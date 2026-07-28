import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncStageLabel, AFFINITY_MATCH_THRESHOLD, type BotProfile } from '@/lib/bot/profile'

export const metadata = { title: '나의 AI — 스캔톡' }

// 나의 AI 탭 (docs/09 3번): 싱크로율 % + 상대 닉네임 + 호감도 %만 공개.
// 대화 내용·산출 근거는 절대 보여주지 않는다 — 궁금증이 서비스의 재미.
export default async function MyAiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect_to=/my-ai')

  const admin = createAdminClient()
  const { data: bot } = await admin
    .from('bots')
    .select('id, nickname, sync_rate, profile')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!bot) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🤖</p>
        <h1 className="text-lg font-bold text-gray-900 mb-2">나의 AI봇이 아직 없어요</h1>
        <p className="text-sm text-gray-500 mb-6">
          결혼 확률 테스트를 완료하면
          <br />
          나를 닮은 AI봇이 만들어져요
        </p>
        <Link
          href="/quiz/marriage"
          className="inline-block px-6 py-3 rounded-xl bg-rose-500 text-white text-sm font-semibold"
        >
          테스트 하러 가기
        </Link>
      </div>
    )
  }

  const profile = bot.profile as BotProfile
  const { data: chats } = await admin
    .from('bot_chats')
    .select('id, affinity, message_count, last_message_at, bots!bot_chats_partner_bot_id_fkey (nickname, user_id)')
    .eq('user_id', user.id)
    .order('affinity', { ascending: false })

  const partnerChats = (chats ?? []).filter((chat) => {
    const partner = chat.bots as unknown as { user_id: string } | null
    return partner?.user_id !== user.id
  })

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">나의 AI</h1>

      {/* 싱크로율 — 봇 육성 현황 (docs/09 4-1) */}
      <div className="bg-gray-950 rounded-2xl p-6 text-white text-center mb-3">
        <p className="text-sm font-bold mb-1">🤖 {bot.nickname}</p>
        <p className="text-[11px] text-gray-400 mb-4">
          {profile.resultType} · {profile.interests.slice(0, 3).join(' · ')}
        </p>
        <p className="text-5xl font-extrabold text-rose-400 leading-none">{bot.sync_rate}%</p>
        <p className="text-xs font-bold text-gray-300 mt-2">
          싱크로율 — 지금은 「{syncStageLabel(bot.sync_rate)}」 단계
        </p>
        <div className="h-2 rounded-full bg-gray-800 mt-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-500"
            style={{ width: `${bot.sync_rate}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-1.5">
          <span>30% 어색한 사이</span>
          <span>60% 닮은꼴</span>
          <span>90% 또 다른 나</span>
        </div>
        <Link
          href="/chat"
          className="block mt-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-semibold transition-colors"
        >
          내 봇과 대화하고 싱크로율 올리기
        </Link>
        <p className="text-[10px] text-gray-500 mt-2">
          싱크로율이 높을수록 봇이 나 대신 더 잘 대화해요
        </p>
      </div>

      {/* 상대별 호감도 — 내용은 비공개, 수치만 */}
      <h2 className="text-sm font-bold text-gray-900 mb-2">봇이 만나고 있는 상대</h2>
      {partnerChats.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-3xl mb-2">🕊️</p>
          <p className="text-sm text-gray-600 font-semibold mb-1">아직 만나는 상대가 없어요</p>
          <Link href="/chat" className="text-xs text-rose-500 font-semibold hover:underline">
            챗에서 어울리는 상대 찾아보기 →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {partnerChats.map((chat) => {
            const partner = chat.bots as unknown as { nickname: string } | null
            const reached = chat.affinity >= AFFINITY_MATCH_THRESHOLD
            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-rose-200 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">{partner?.nickname ?? '알 수 없는 봇'}</p>
                  <p className="text-[11px] text-gray-400">대화 {chat.message_count}회</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-rose-500">💗 {chat.affinity}%</p>
                  {reached && (
                    <p className="text-[10px] font-bold text-emerald-500">매칭 가능 단계!</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
        봇들이 무슨 대화를 나눴는지는 보여드리지 않아요 🤫
        <br />
        호감도 {AFFINITY_MATCH_THRESHOLD}%에 도달하면 진짜 매칭을 제안해드려요
      </p>
    </div>
  )
}
