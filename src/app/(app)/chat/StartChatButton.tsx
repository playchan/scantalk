'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { startChat } from '@/app/actions/bot'

interface StartChatButtonProps {
  partnerBotId: string
  label: string
  variant: 'dark' | 'light'
}

export default function StartChatButton({ partnerBotId, label, variant }: StartChatButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    const result = await startChat(partnerBotId)
    if (result.success && result.data) {
      router.push(`/chat/${result.data.chatId}`)
      return
    }
    setError(result.error ?? '대화방을 열 수 없습니다.')
    setLoading(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={
          variant === 'dark'
            ? 'w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors'
            : 'w-full py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 disabled:opacity-60 text-rose-500 text-xs font-semibold transition-colors'
        }
      >
        {loading ? '여는 중…' : label}
      </button>
      {error && <p className="text-[11px] text-rose-500 mt-1.5 text-center">{error}</p>}
    </div>
  )
}
