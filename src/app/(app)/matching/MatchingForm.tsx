'use client'

import { useActionState } from 'react'
import { createMatchRequest } from '@/app/actions/matching'

type State = { error?: string } | null

export default function MatchingForm() {
  const [state, action, pending] = useActionState<State, FormData>(
    createMatchRequest,
    null,
  )

  return (
    <form action={action} className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          자기소개 <span className="text-gray-400 font-normal">(선택)</span>
        </label>
        <p className="text-xs text-gray-400 mb-3">
          간단한 자기소개나 이상형을 적어주시면 매칭에 참고합니다.
        </p>
        <textarea
          name="note"
          rows={5}
          placeholder="예: 30대 초반 직장인이에요. 취미는 영화 감상과 산책입니다. 대화가 잘 통하는 분을 원해요."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
        />
      </div>

      {state?.error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-colors"
      >
        {pending ? '신청 중...' : '매칭 신청하기'}
      </button>
    </form>
  )
}
