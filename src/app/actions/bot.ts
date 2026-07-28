'use server'

// 라운드 2: AI봇 생성·챗·호감도·싱크로율 서버 액션 (docs/09 라운드 2)
// 쓰기는 전부 service_role 경유 — 클라이언트는 RLS로 본인 데이터만 조회.
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@/lib/openai'
import {
  buildBotNickname,
  buildBotProfile,
  buildSystemPrompt,
  compatibilityScore,
  nextAffinity,
  nextSyncRate,
  type BotProfile,
} from '@/lib/bot/profile'
import type { AxisKey, Answers, Gender } from '@/lib/quiz/marriage'

const BOT_MODEL = 'gpt-4o-mini'
const BOT_MAX_TOKENS = 160
const HISTORY_LIMIT = 12
const MESSAGE_MAX_LENGTH = 500

interface ActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
}

interface BotRow {
  id: string
  user_id: string
  gender: Gender
  nickname: string
  profile: BotProfile
  sync_rate: number
}

/** 내 봇이 없으면 최신 검사 결과로 생성. 검사 결과가 없으면 에러 */
export async function ensureMyBot(): Promise<ActionResult<{ botId: string; created: boolean }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('bots')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (existing) return { success: true, data: { botId: existing.id, created: false } }

  const { data: quiz } = await admin
    .from('quiz_results')
    .select('id, answers, axes, result_type')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!quiz) {
    return { success: false, error: '먼저 결혼 확률 테스트를 완료해주세요.' }
  }

  const answers = quiz.answers as Answers
  const gender = answers.gender === 'male' ? 'male' : 'female'
  const axes = quiz.axes as Record<AxisKey, number>
  const profile = buildBotProfile(answers, axes, quiz.result_type)
  const nickname = buildBotNickname(axes, quiz.id)

  const { data: bot, error } = await admin
    .from('bots')
    .insert({
      user_id: user.id,
      quiz_result_id: quiz.id,
      gender,
      nickname,
      profile,
    })
    .select('id')
    .single()

  if (error || !bot) {
    console.error('[ensureMyBot] insert failed:', error)
    return { success: false, error: '봇 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' }
  }
  return { success: true, data: { botId: bot.id, created: true } }
}

export interface ChatCandidate {
  botId: string
  nickname: string
  interests: string[]
  resultType: string
  compatibility: number
}

/** 궁합 순으로 상대 봇 후보 조회 (이성 봇, 이미 대화 중인 봇 제외) */
export async function getChatCandidates(): Promise<ActionResult<ChatCandidate[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const admin = createAdminClient()
  const { data: myBot } = await admin
    .from('bots')
    .select('id, gender, profile')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!myBot) return { success: false, error: '먼저 나의 AI봇을 만들어주세요.' }

  const targetGender = myBot.gender === 'male' ? 'female' : 'male'
  const { data: partners } = await admin
    .from('bots')
    .select('id, nickname, profile')
    .eq('gender', targetGender)
    .neq('user_id', user.id)
    .limit(50)

  const { data: chats } = await admin
    .from('bot_chats')
    .select('partner_bot_id')
    .eq('user_id', user.id)
  const chattingIds = new Set((chats ?? []).map((c) => c.partner_bot_id))

  const myProfile = myBot.profile as BotProfile
  const candidates = (partners ?? [])
    .filter((p) => !chattingIds.has(p.id))
    .map((p) => {
      const profile = p.profile as BotProfile
      return {
        botId: p.id,
        nickname: p.nickname,
        interests: profile.interests.slice(0, 3),
        resultType: profile.resultType,
        compatibility: compatibilityScore(myProfile.axes, profile.axes),
      }
    })
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 10)

  return { success: true, data: candidates }
}

/** 대화방 시작 (이미 있으면 기존 방 반환) */
export async function startChat(partnerBotId: string): Promise<ActionResult<{ chatId: string }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const admin = createAdminClient()
  const { data: partner } = await admin
    .from('bots')
    .select('id, user_id')
    .eq('id', partnerBotId)
    .maybeSingle()
  if (!partner) return { success: false, error: '존재하지 않는 봇입니다.' }

  const { data: existing } = await admin
    .from('bot_chats')
    .select('id')
    .eq('user_id', user.id)
    .eq('partner_bot_id', partnerBotId)
    .maybeSingle()
  if (existing) return { success: true, data: { chatId: existing.id } }

  const { data: chat, error } = await admin
    .from('bot_chats')
    .insert({ user_id: user.id, partner_bot_id: partnerBotId })
    .select('id')
    .single()
  if (error || !chat) {
    console.error('[startChat] insert failed:', error)
    return { success: false, error: '대화방 생성에 실패했습니다.' }
  }

  revalidatePath('/chat')
  return { success: true, data: { chatId: chat.id } }
}

/**
 * 메시지 전송 → 봇 응답 생성 → 호감도(상대 봇) 또는 싱크로율(내 봇) 갱신.
 * 봇 응답은 저비용 모델 + 토큰 상한으로 비용 통제 (docs/09 현실 체크).
 */
export async function sendMessage(
  chatId: string,
  content: string,
): Promise<ActionResult<{ reply: string; affinity: number; isOwnBot: boolean; syncRate: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const trimmed = content.trim()
  if (!trimmed) return { success: false, error: '메시지를 입력해주세요.' }
  if (trimmed.length > MESSAGE_MAX_LENGTH) {
    return { success: false, error: `메시지는 ${MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.` }
  }

  const admin = createAdminClient()
  const { data: chat } = await admin
    .from('bot_chats')
    .select('id, user_id, partner_bot_id, affinity, message_count')
    .eq('id', chatId)
    .maybeSingle()
  if (!chat || chat.user_id !== user.id) {
    return { success: false, error: '대화방을 찾을 수 없습니다.' }
  }

  const { data: botRow } = await admin
    .from('bots')
    .select('id, user_id, gender, nickname, profile, sync_rate')
    .eq('id', chat.partner_bot_id)
    .single()
  if (!botRow) return { success: false, error: '봇 정보를 찾을 수 없습니다.' }
  const bot = botRow as BotRow
  const isOwnBot = bot.user_id === user.id

  const { data: history } = await admin
    .from('bot_messages')
    .select('role, content')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  await admin.from('bot_messages').insert({ chat_id: chatId, role: 'user', content: trimmed })

  let reply = ''
  try {
    const completion = await openai.chat.completions.create({
      model: BOT_MODEL,
      max_tokens: BOT_MAX_TOKENS,
      temperature: 0.9,
      messages: [
        { role: 'system', content: buildSystemPrompt(bot.nickname, bot.gender, bot.profile) },
        ...(history ?? [])
          .reverse()
          .map((m) => ({
            role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
            content: m.content,
          })),
        { role: 'user', content: trimmed },
      ],
    })
    reply = completion.choices[0]?.message?.content?.trim() ?? ''
  } catch (error) {
    console.error('[sendMessage] openai failed:', error)
  }
  if (!reply) {
    reply = '앗, 잠깐 딴생각했어요 😅 방금 뭐라고 했어요?'
  }

  await admin.from('bot_messages').insert({ chat_id: chatId, role: 'bot', content: reply })

  // 내 봇과의 대화 = 싱크로율 훈련, 상대 봇 = 호감도 상승
  let affinity = chat.affinity
  let syncRate = bot.sync_rate
  if (isOwnBot) {
    syncRate = nextSyncRate(bot.sync_rate)
    await admin.from('bots').update({ sync_rate: syncRate, updated_at: new Date().toISOString() }).eq('id', bot.id)
  } else {
    affinity = nextAffinity(chat.affinity, trimmed.length)
  }

  await admin
    .from('bot_chats')
    .update({
      affinity,
      message_count: chat.message_count + 1,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', chatId)

  return { success: true, data: { reply, affinity, isOwnBot, syncRate } }
}
