import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ensureMyBot, getChatCandidates } from '@/app/actions/bot'
import type { BotProfile } from '@/lib/bot/profile'
import StartChatButton from './StartChatButton'

export const metadata = { title: '챗 — 스캔톡' }

// 챗 탭 (라운드 2) — 내 봇 + 궁합 추천 + 진행 중 대화
export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect_to=/chat')

  const ensured = await ensureMyBot()
  if (!ensured.success) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🤖</p>
        <h1 className="text-lg font-bold text-gray-900 mb-2">나의 AI봇이 아직 없어요</h1>
        <p className="text-sm text-gray-500 mb-6">{ensured.error}</p>
        <Link
          href="/quiz/marriage"
          className="inline-block px-6 py-3 rounded-xl bg-rose-500 text-white text-sm font-semibold"
        >
          결혼 확률 테스트 하러 가기
        </Link>
      </div>
    )
  }

  const admin = createAdminClient()
  const { data: myBot } = await admin
    .from('bots')
    .select('id, nickname, sync_rate, profile')
    .eq('user_id', user.id)
    .single()

  const { data: chats } = await admin
    .from('bot_chats')
    .select('id, affinity, message_count, last_message_at, partner_bot_id, bots!bot_chats_partner_bot_id_fkey (nickname, user_id)')
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  const candidatesResult = await getChatCandidates()
  const candidates = candidatesResult.data ?? []
  const myProfile = (myBot?.profile ?? null) as BotProfile | null

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">챗</h1>

      {/* 나의 AI봇 카드 */}
      {myBot && (
        <div className="bg-gray-950 rounded-2xl p-5 mb-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[11px] text-gray-400 mb-0.5">나의 AI봇</p>
              <p className="font-bold">🤖 {myBot.nickname}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400 mb-0.5">싱크로율</p>
              <p className="text-xl font-extrabold text-rose-400">{myBot.sync_rate}%</p>
            </div>
          </div>
          {myProfile && (
            <p className="text-[11px] text-gray-400 mb-3">
              {myProfile.resultType} · {myProfile.interests.slice(0, 3).join(' · ')}
            </p>
          )}
          <StartChatButton
            partnerBotId={myBot.id}
            label="내 봇과 대화하고 싱크로율 올리기"
            variant="dark"
          />
        </div>
      )}

      {/* 진행 중인 대화 */}
      {(chats ?? []).length > 0 && (
        <>
          <h2 className="text-sm font-bold text-gray-900 mb-2">대화 중</h2>
          <div className="space-y-2 mb-6">
            {(chats ?? []).map((chat) => {
              const partner = chat.bots as unknown as { nickname: string; user_id: string } | null
              const isOwn = partner?.user_id === user.id
              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-rose-200 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {isOwn ? '🤖' : '💬'} {partner?.nickname ?? '알 수 없는 봇'}
                      {isOwn && <span className="ml-1 text-[10px] text-gray-400">(내 봇)</span>}
                    </p>
                    <p className="text-[11px] text-gray-400">메시지 {chat.message_count}개</p>
                  </div>
                  {!isOwn && (
                    <span className="text-sm font-extrabold text-rose-500">💗 {chat.affinity}%</span>
                  )}
                </Link>
              )
            })}
          </div>
        </>
      )}

      {/* 추천 상대 */}
      <h2 className="text-sm font-bold text-gray-900 mb-2">나와 어울리는 상대</h2>
      {candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-3xl mb-2">🌱</p>
          <p className="text-sm text-gray-600 font-semibold mb-1">아직 대화할 상대가 없어요</p>
          <p className="text-xs text-gray-400">
            친구에게 테스트를 공유하면 상대 봇이 생겨요!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {candidates.map((c) => (
            <div
              key={c.botId}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-900">{c.nickname}</p>
                  <p className="text-[11px] text-gray-400">
                    {c.resultType} · {c.interests.join(' · ')}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-emerald-500">궁합 {c.compatibility}%</span>
              </div>
              <StartChatButton partnerBotId={c.botId} label="대화 시작하기" variant="light" />
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
        상대방의 AI봇과 대화합니다. 봇끼리 무슨 이야기를 했는지는
        <br />
        매칭 전까지 서로 알 수 없어요 🤫
      </p>
    </div>
  )
}
