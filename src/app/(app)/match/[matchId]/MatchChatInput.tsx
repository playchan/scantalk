'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { sendMatchMessage } from '@/app/actions/match'

export default function MatchChatInput({ matchId }: { matchId: string }) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    setError(null)
    const result = await sendMatchMessage(matchId, content)
    if (result.success) {
      setInput('')
      router.refresh()
    } else {
      setError(result.error ?? '전송에 실패했습니다.')
    }
    setSending(false)
  }

  return (
    <div>
      {error && <p className="text-[11px] text-rose-500 text-center mb-2">{error}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend()
          }}
          placeholder="메시지 보내기…"
          maxLength={1000}
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
      <button
        type="button"
        onClick={() => router.refresh()}
        className="w-full mt-2 py-1.5 text-[11px] text-gray-400 hover:text-rose-400"
      >
        ↻ 새 메시지 확인
      </button>
    </div>
  )
}
