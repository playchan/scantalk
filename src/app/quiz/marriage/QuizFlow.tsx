'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTIONS, calcQuizResult, type Answers } from '@/lib/quiz/marriage'
import { saveQuizResult } from '@/app/actions/quiz'
import { trackEvent } from '@/app/actions/tracking'

export const ANSWERS_STORAGE_KEY = 'st_quiz_marriage_answers'

type Stage = 'intro' | 'questions' | 'preview'

interface QuizFlowProps {
  isLoggedIn: boolean
}

export default function QuizFlow({ isLoggedIn }: QuizFlowProps) {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const viewTracked = useRef(false)

  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    void trackEvent('quiz_view')
  }, [])

  const question = QUESTIONS[index]
  const progress = Math.round((index / QUESTIONS.length) * 100)
  const result = stage === 'preview' ? calcQuizResult(answers) : null

  function handleStart() {
    setStage('questions')
    setIndex(0)
    void trackEvent('quiz_start')
  }

  function handleSelect(optionId: string) {
    const next: Answers = { ...answers, [question.id]: optionId }
    setAnswers(next)

    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1)
      return
    }

    // 완료 — 응답을 임시 보관하고 미리보기로
    const completed = calcQuizResult(next)
    try {
      sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // 시크릿 모드 등에서 실패해도 진행은 가능 (로그인 유저는 바로 저장됨)
    }
    setStage('preview')
    void trackEvent('quiz_complete', {
      probability: completed?.probability ?? 0,
      result_type: completed?.resultType ?? 'unknown',
    })
  }

  function handleBack() {
    if (index > 0) setIndex(index - 1)
    else setStage('intro')
  }

  async function handleReveal() {
    if (isLoggedIn) {
      setIsSaving(true)
      setSaveError(null)
      const state = await saveQuizResult(answers)
      // 성공 시 redirect 되므로 여기 도달하면 실패
      if (state !== null && 'error' in state) {
        setSaveError(state.error)
        setIsSaving(false)
      }
      return
    }

    void trackEvent('signup_start')
    router.push('/signup?redirect_to=/quiz/marriage/complete')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-[420px] flex-1 flex flex-col">
        {stage === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-5xl mb-5">💍</span>
            <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-3">
              내가 결혼할<br />확률은?
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              12개 질문, 90초면 끝나요.<br />
              재미로 보는 나의 결혼 확률 테스트
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white text-base font-bold rounded-2xl transition-colors shadow-lg shadow-rose-200"
            >
              테스트 시작하기
            </button>
            <p className="text-xs text-gray-400 mt-4">가입 없이 바로 시작할 수 있어요</p>
          </div>
        )}

        {stage === 'questions' && (
          <div className="flex-1 flex flex-col pt-4">
            {/* 진행바 */}
            <div className="flex items-center gap-3 mb-8">
              <button
                type="button"
                onClick={handleBack}
                aria-label="이전 문항"
                className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1"
              >
                ‹
              </button>
              <div className="flex-1 h-2 bg-rose-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-400 w-10 text-right">
                {index + 1}/{QUESTIONS.length}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 leading-snug mb-6 min-h-[3.5rem]">
              Q{index + 1}. {question.title}
            </h2>

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border text-sm font-medium transition-colors min-h-[52px] ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50 text-rose-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-rose-200 hover:bg-rose-50/50'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {stage === 'preview' && result && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500 mb-3">나의 결혼 확률은...</p>

            {/* 블러 처리된 결과 — 가입 후 공개 */}
            <div className="relative mb-8">
              <div className="text-7xl font-extrabold text-rose-500 blur-lg select-none" aria-hidden>
                {result.probability}%
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🔒</span>
              </div>
            </div>

            <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <p className="text-sm text-gray-600 leading-relaxed">
                결과가 준비됐어요!<br />
                <b className="text-gray-900">3초 가입</b>하면 나의 확률과 유형을 바로 볼 수 있어요.
              </p>
            </div>

            {saveError && (
              <div className="w-full rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600 mb-4">
                {saveError}
              </div>
            )}

            <button
              type="button"
              onClick={handleReveal}
              disabled={isSaving}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-base font-bold rounded-2xl transition-colors shadow-lg shadow-rose-200"
            >
              {isSaving ? '결과 여는 중...' : isLoggedIn ? '내 결과 보기' : '3초 가입하고 결과 보기'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
