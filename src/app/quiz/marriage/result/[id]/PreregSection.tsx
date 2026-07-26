'use client'

import { useActionState } from 'react'
import { preregister, type QuizActionState } from '@/app/actions/quiz'

interface PreregSectionProps {
  quizResultId: string
  alreadyRegistered: boolean
}

export default function PreregSection({ quizResultId, alreadyRegistered }: PreregSectionProps) {
  const [state, formAction, isPending] = useActionState<QuizActionState, FormData>(
    preregister,
    null,
  )

  const isDone = alreadyRegistered || (state !== null && 'success' in state)
  const errorMessage = state !== null && 'error' in state ? state.error : null

  return (
    <div className="bg-gray-950 rounded-2xl p-6 text-center">
      <p className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-2">
        Coming Soon
      </p>
      <h2 className="text-lg font-bold text-white leading-snug mb-2">
        나와 어울리는 사람과<br />채팅해보고 싶다면?
      </h2>
      <p className="text-xs text-gray-400 leading-relaxed mb-5">
        내 검사 결과로 만들어진 AI가 어울리는 상대를 찾아드려요.<br />
        오픈 시 가장 먼저 알려드릴게요.
      </p>

      {isDone ? (
        <div className="py-3 rounded-xl bg-rose-500/20 text-rose-300 text-sm font-semibold">
          사전신청 완료 ✓ 오픈 소식으로 찾아뵐게요
        </div>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="quiz_result_id" value={quizResultId} />
          {errorMessage && <p className="text-xs text-rose-300 mb-3">{errorMessage}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {isPending ? '신청 중...' : '사전신청하기'}
          </button>
        </form>
      )}
    </div>
  )
}
