'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { validateAnswers, type Answers } from '@/lib/quiz/marriage'
import { saveQuizResult } from '@/app/actions/quiz'
import { ANSWERS_STORAGE_KEY } from '../QuizFlow'

export default function CompleteClient() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    let raw: string | null = null
    let stored: Answers | null = null
    try {
      raw = sessionStorage.getItem(ANSWERS_STORAGE_KEY)
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') stored = parsed as Answers
      }
      // 저장 요청 전에 먼저 비운다 — 새로고침으로 인한 중복 제출 방지.
      // (서버 액션도 동일 응답 재제출 시 기존 결과로 보내는 멱등 처리가 되어 있음)
      sessionStorage.removeItem(ANSWERS_STORAGE_KEY)
    } catch {
      stored = null
    }

    if (!stored || !validateAnswers(stored)) {
      // 응답이 없으면 검사부터 다시
      router.replace('/quiz/marriage')
      return
    }

    const answers = stored
    const rawBackup = raw
    void (async () => {
      const state = await saveQuizResult(answers)
      // 성공 시 서버 액션이 결과 페이지로 redirect — 여기 도달하면 실패
      if (state !== null && 'error' in state) {
        setError(state.error)
        // 실패 시 응답 복원 — 재시도 가능하게
        try {
          if (rawBackup) sessionStorage.setItem(ANSWERS_STORAGE_KEY, rawBackup)
        } catch {
          // 복원 실패 시 검사 재진행으로 안내됨
        }
      }
    })()
  }, [router])

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-[360px] text-center">
        {error ? (
          <>
            <p className="text-sm text-rose-600 mb-6">{error}</p>
            <button
              type="button"
              onClick={() => router.replace('/quiz/marriage')}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              검사 다시 하기
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-5" />
            <p className="text-sm text-gray-500">결과를 준비하고 있어요...</p>
          </>
        )}
      </div>
    </main>
  )
}
