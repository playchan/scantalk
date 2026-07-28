import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ChatRoom from './ChatRoom'

export const metadata = { title: '대화 — 스캔톡' }

interface PageProps {
  params: Promise<{ chatId: string }>
}

// 대화방 (라운드 2) — 본인 방만 접근 가능
export default async function ChatRoomPage({ params }: PageProps) {
  const { chatId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect_to=/chat/${chatId}`)

  const admin = createAdminClient()
  const { data: chat } = await admin
    .from('bot_chats')
    .select('id, user_id, affinity, partner_bot_id')
    .eq('id', chatId)
    .maybeSingle()

  // 소유권 확인 — 타인의 대화방 접근 차단
  if (!chat || chat.user_id !== user.id) redirect('/chat')

  const { data: bot } = await admin
    .from('bots')
    .select('nickname, user_id, sync_rate')
    .eq('id', chat.partner_bot_id)
    .single()
  if (!bot) redirect('/chat')

  const { data: messages } = await admin
    .from('bot_messages')
    .select('id, role, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
    .limit(100)

  const isOwnBot = bot.user_id === user.id

  return (
    <ChatRoom
      chatId={chatId}
      botNickname={bot.nickname}
      isOwnBot={isOwnBot}
      initialAffinity={chat.affinity}
      initialSyncRate={bot.sync_rate}
      initialMessages={(messages ?? []).map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'bot',
        content: m.content,
      }))}
    />
  )
}
