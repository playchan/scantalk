'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { respondMatch } from '@/app/actions/match'

export default function MatchProposalActions({ matchId }: { matchId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function respond(accept: boolean) {
    setBusy(true)
    setError(null)
    const result = await respondMatch(matchId, accept)
    if (result.success) router.refresh()
    else {
      setError(result.error ?? '처리에 실패했습니다.')
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button
          type="button"
          onClick={() => respond(true)}
          disabled={busy}
          className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
        >
          수락하고 대화 시작
        </button>
        <button
          type="button"
          onClick={() => respond(false)}
          disabled={busy}
          className="py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-500 text-xs font-semibold transition-colors"
        >
          괜찮아요
        </button>
      </div>
      {error && <p className="text-[11px] text-rose-500 mt-1.5 text-center">{error}</p>}
    </div>
  )
}
