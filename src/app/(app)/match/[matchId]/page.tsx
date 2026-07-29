import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import MatchChatInput from './MatchChatInput'

export const metadata = { title: '매칭 대화 — 스캔톡' }

interface PageProps {
  params: Promise<{ matchId: string }>
}

// 매칭 성사 후 사람↔사람 대화방 — 참여자만 접근
export default async function MatchRoomPage({ params }: PageProps) {
  const { matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect_to=/match/${matchId}`)

  const admin = createAdminClient()
  const { data: match } = await admin
    .from('bot_matches')
    .select('id, status, requester_id, owner_id')
    .eq('id', matchId)
    .maybeSingle()

  const isParticipant = match && (match.requester_id === user.id || match.owner_id === user.id)
  if (!match || !isParticipant || match.status !== 'matched') redirect('/my-ai')

  const counterpartId = match.requester_id === user.id ? match.owner_id : match.requester_id
  const { data: counterpartBot } = await admin
    .from('bots')
    .select('nickname')
    .eq('user_id', counterpartId)
    .maybeSingle()

  const { data: messages } = await admin
    .from('match_messages')
    .select('id, sender_id, content, created_at')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true })
    .limit(200)

  return (
    <div className="flex flex-col h-[calc(100vh-10.5rem)]">
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-3">
        <Link href="/my-ai" className="text-gray-400 text-sm">←</Link>
        <div>
          <p className="text-sm font-bold text-gray-900">
            💬 {counterpartBot?.nickname ?? '익명'}님
          </p>
          <p className="text-[10px] text-emerald-500 font-semibold">매칭 성사 · 실제 사람과의 대화</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pb-3">
        {(messages ?? []).length === 0 && (
          <p className="text-center text-xs text-gray-400 pt-10 leading-relaxed">
            봇이 아닌 진짜 사람과의 첫 대화예요 🎉
            <br />
            서로를 존중하는 대화 부탁드려요
          </p>
        )}
        {(messages ?? []).map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.sender_id === user.id
                  ? 'bg-rose-500 text-white rounded-br-md'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <MatchChatInput matchId={matchId} />
      <p className="text-center text-[10px] text-gray-400 mt-2">
        불쾌한 대화를 받았다면 카카오채널로 신고해주세요
      </p>
    </div>
  )
}
