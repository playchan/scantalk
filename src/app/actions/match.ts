'use server'

// 매칭 v1 (docs/09 라운드 3 정정판): 사람↔봇 호감도 임계 도달 → 봇 주인과 매칭.
// 원칙: 한쪽만 수락한 상태는 상대에게 알리지 않는다. 대화 내용은 끝까지 비공개.
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AFFINITY_MATCH_THRESHOLD } from '@/lib/bot/profile'

const MATCH_MESSAGE_MAX_LENGTH = 1000

interface ActionResult<T = undefined> {
  success: boolean
  data?: T
  error?: string
}

/** 호감도 임계 도달 대화방에서 매칭 신청 (requester = 대화하던 사람) */
export async function requestMatch(chatId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const admin = createAdminClient()
  const { data: chat } = await admin
    .from('bot_chats')
    .select('id, user_id, affinity, partner_bot_id')
    .eq('id', chatId)
    .maybeSingle()
  if (!chat || chat.user_id !== user.id) {
    return { success: false, error: '대화방을 찾을 수 없습니다.' }
  }
  if (chat.affinity < AFFINITY_MATCH_THRESHOLD) {
    return { success: false, error: `호감도 ${AFFINITY_MATCH_THRESHOLD}%부터 매칭을 신청할 수 있어요.` }
  }

  const { data: bot } = await admin
    .from('bots')
    .select('user_id')
    .eq('id', chat.partner_bot_id)
    .single()
  if (!bot || bot.user_id === user.id) {
    return { success: false, error: '내 봇과는 매칭할 수 없어요.' }
  }

  const { error } = await admin.from('bot_matches').upsert(
    { chat_id: chatId, requester_id: user.id, owner_id: bot.user_id },
    { onConflict: 'chat_id', ignoreDuplicates: true },
  )
  if (error) {
    console.error('[requestMatch] upsert failed:', error)
    return { success: false, error: '매칭 신청에 실패했습니다.' }
  }

  revalidatePath('/my-ai')
  return { success: true }
}

/** 봇 주인의 응답 — 수락 시 매칭 성사, 거절은 상대에게 표시하지 않음 */
export async function respondMatch(matchId: string, accept: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const admin = createAdminClient()
  const { data: match } = await admin
    .from('bot_matches')
    .select('id, owner_id, status')
    .eq('id', matchId)
    .maybeSingle()
  if (!match || match.owner_id !== user.id) {
    return { success: false, error: '매칭 요청을 찾을 수 없습니다.' }
  }
  if (match.status !== 'proposed') {
    return { success: false, error: '이미 처리된 요청입니다.' }
  }

  const { error } = await admin
    .from('bot_matches')
    .update(accept ? { owner_accepted: true, status: 'matched' } : { status: 'declined' })
    .eq('id', matchId)
  if (error) {
    console.error('[respondMatch] update failed:', error)
    return { success: false, error: '처리에 실패했습니다.' }
  }

  revalidatePath('/my-ai')
  return { success: true }
}

/** 성사된 매칭 방에서 사람↔사람 메시지 전송 */
export async function sendMatchMessage(matchId: string, content: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: '로그인이 필요합니다.' }

  const trimmed = content.trim()
  if (!trimmed) return { success: false, error: '메시지를 입력해주세요.' }
  if (trimmed.length > MATCH_MESSAGE_MAX_LENGTH) {
    return { success: false, error: `메시지는 ${MATCH_MESSAGE_MAX_LENGTH}자 이내로 입력해주세요.` }
  }

  const admin = createAdminClient()
  const { data: match } = await admin
    .from('bot_matches')
    .select('id, status, requester_id, owner_id')
    .eq('id', matchId)
    .maybeSingle()
  const isParticipant = match && (match.requester_id === user.id || match.owner_id === user.id)
  if (!match || !isParticipant || match.status !== 'matched') {
    return { success: false, error: '대화방을 찾을 수 없습니다.' }
  }

  const { error } = await admin
    .from('match_messages')
    .insert({ match_id: matchId, sender_id: user.id, content: trimmed })
  if (error) {
    console.error('[sendMatchMessage] insert failed:', error)
    return { success: false, error: '전송에 실패했습니다.' }
  }

  revalidatePath(`/match/${matchId}`)
  return { success: true }
}
