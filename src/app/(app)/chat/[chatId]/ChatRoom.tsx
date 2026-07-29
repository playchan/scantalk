'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { sendMessage } from '@/app/actions/bot'
import { requestMatch } from '@/app/actions/match'
import { AFFINITY_MATCH_THRESHOLD } from '@/lib/bot/profile'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
}

interface ChatRoomProps {
  chatId: string
  botNickname: string
  isOwnBot: boolean
  matchStatus: string | null
  matchId: string | null
  initialAffinity: number
  initialSyncRate: number
  initialMessages: ChatMessage[]
}

export default function ChatRoom({
  chatId,
  botNickname,
  isOwnBot,
  matchStatus,
  matchId,
  initialAffinity,
  initialSyncRate,
  initialMessages,
}: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [affinity, setAffinity] = useState(initialAffinity)
  const [syncRate, setSyncRate] = useState(initialSyncRate)
  const [error, setError] = useState<string | null>(null)
  const [matchState, setMatchState] = useState<string | null>(matchStatus)
  const [requesting, setRequesting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function handleRequestMatch() {
    setRequesting(true)
    const result = await requestMatch(chatId)
    if (result.success) setMatchState('proposed')
    else setError(result.error ?? '매칭 신청에 실패했습니다.')
    setRequesting(false)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const content = input.trim()
    if (!content || sending) return

    setSending(true)
    setError(null)
    setInput('')
    setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, role: 'user', content }])

    const result = await sendMessage(chatId, content)
    if (result.success && result.data) {
      const { reply, affinity: nextAffinityValue, isOwnBot: own, syncRate: nextSync } = result.data
      setMessages((prev) => [...prev, { id: `bot-${Date.now()}`, role: 'bot', content: reply }])
      if (own) setSyncRate(nextSync)
      else setAffinity(nextAffinityValue)
    } else {
      setError(result.error ?? '전송에 실패했습니다.')
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)]">
      {/* 대화방 헤더 */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 mb-3">
        <div className="flex items-center gap-2">
          <Link href="/chat" className="text-gray-400 text-sm">
            ←
          </Link>
          <p className="text-sm font-bold text-gray-900">
            {isOwnBot ? '🤖' : '💬'} {botNickname}
            {isOwnBot && <span className="ml-1 text-[10px] text-gray-400">(내 봇)</span>}
          </p>
        </div>
        {isOwnBot ? (
          <span className="text-sm font-extrabold text-rose-500">싱크로율 {syncRate}%</span>
        ) : (
          <span className="text-sm font-extrabold text-rose-500">💗 {affinity}%</span>
        )}
      </div>

      {/* 매칭 배너 — 호감도 임계 도달 시 (docs/09: 봇 주인과의 진짜 매칭) */}
      {!isOwnBot && affinity >= AFFINITY_MATCH_THRESHOLD && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3 mb-3 text-center">
          {matchState === 'matched' && matchId ? (
            <Link href={`/match/${matchId}`} className="text-xs font-bold text-rose-500">
              🎉 매칭 성사! 실제 대화방으로 이동 →
            </Link>
          ) : matchState === 'proposed' || matchState === 'declined' ? (
            <p className="text-xs font-semibold text-rose-400">
              💌 매칭 신청 완료 — 상대의 응답을 기다리고 있어요
            </p>
          ) : (
            <button
              type="button"
              onClick={handleRequestMatch}
              disabled={requesting}
              className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60 px-4 py-2 rounded-xl transition-colors"
            >
              💘 호감도 {AFFINITY_MATCH_THRESHOLD}% 달성! 이 봇의 주인과 실제 대화 신청하기
            </button>
          )}
        </div>
      )}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto space-y-2 pb-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 pt-10 leading-relaxed">
            {isOwnBot
              ? '내 봇과 대화할수록 싱크로율이 올라가요.\n봇이 나를 닮아갑니다 🤖'
              : '첫 마디를 건네보세요!\n가볍게 시작하는 게 제일 좋아요 😊'}
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-rose-500 text-white rounded-br-md'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 px-3.5 py-2.5 rounded-2xl rounded-bl-md text-sm text-gray-400">
              입력 중…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-[11px] text-rose-500 text-center mb-2">{error}</p>}

      {/* 입력창 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend()
          }}
          placeholder="메시지 보내기…"
          maxLength={500}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-300 focus:outline-none text-sm"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !input.trim()}
          className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          전송
        </button>
      </div>
    </div>
  )
}
