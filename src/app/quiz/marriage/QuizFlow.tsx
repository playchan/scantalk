'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QUESTIONS, calcQuizResult, getResultTypeDef, type Answers } from '@/lib/quiz/marriage'
import { saveQuizResult, trackQuizComplete } from '@/app/actions/quiz'
import { trackEvent } from '@/app/actions/tracking'
import ResultContent from './ResultContent'

export const ANSWERS_STORAGE_KEY = 'st_quiz_marriage_answers'

type Stage = 'intro' | 'questions' | 'preview' | 'result'

interface QuizFlowProps {
  isLoggedIn: boolean
  /** 카피 검수용 테스트 모드 — 가입 없이 결과 표시, 저장·이벤트 집계 없음 */
  previewMode?: boolean
}

export default function QuizFlow({ isLoggedIn, previewMode = false }: QuizFlowProps) {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('intro')
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const viewTracked = useRef(false)

  useEffect(() => {
    if (previewMode) return
    if (viewTracked.current) return
    viewTracked.current = true
    void trackEvent('quiz_view')
  }, [previewMode])

  const question = QUESTIONS[index]
  const progress = Math.round((index / QUESTIONS.length) * 100)

  function handleStart() {
    setStage('questions')
    setIndex(0)
    if (!previewMode) void trackEvent('quiz_start')
  }

  function handleRetake() {
    setAnswers({})
    setIndex(0)
    setStage('questions')
  }

  function handleSelect(optionId: string) {
    const next: Answers = { ...answers, [question.id]: optionId }
    setAnswers(next)

    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1)
      return
    }

    // 테스트 모드: 저장·집계 없이 결과를 바로 보여준다 (KPI 오염 방지)
    if (previewMode) {
      setStage('result')
      return
    }

    // 완료 — 응답을 임시 보관하고 미리보기로.
    // 결과 계산은 서버에서만 — 실제 값이 가입 전 클라이언트에 노출되면 안 됨
    try {
      sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // 시크릿 모드 등에서 실패해도 진행은 가능 (로그인 유저는 바로 저장됨)
    }
    setStage('preview')
    void trackQuizComplete(next)
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
        {previewMode && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-700 font-semibold text-center mb-2">
            🧪 테스트 모드 — 결과가 저장되지 않고 통계에도 잡히지 않습니다
          </div>
        )}

        {stage === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-5xl mb-5">💍</span>
            <h1 className="text-3xl font-bold text-gray-900 leading-snug mb-3">
              내가 결혼할<br />확률은?
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              수많은 사람들의 통계 기반으로<br />
              결혼할 확률을 테스트해보세요
            </p>
            <LiveCounter />
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white text-base font-bold rounded-2xl transition-colors shadow-lg shadow-rose-200"
            >
              테스트 시작하기
            </button>
            <p className="text-xs text-gray-400 mt-4">36개 질문 · 약 5분 · 가입 없이 바로 시작</p>
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

        {stage === 'preview' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-gray-500 mb-3">나의 결혼 확률은...</p>

            {/* 실제 값은 서버에만 있음 — 가입 후 결과 페이지에서 공개 */}
            <div className="relative mb-8">
              <div className="text-7xl font-extrabold text-rose-200 select-none" aria-hidden>
                ??%
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

        {stage === 'result' && previewMode && (
          <PreviewResult answers={answers} onRetake={handleRetake} />
        )}
      </div>
    </main>
  )
}

// 실시간 참여 카운터 — 시간 기반 기준값에서 시작해 0.7~1.6초마다 0~2명씩 증가하는 연출
const COUNTER_EPOCH = new Date('2026-07-01T00:00:00+09:00').getTime()
const COUNTER_BASE = 12480
const COUNTER_DAILY_GROWTH = 217
// 오도미터 자릿수 롤링 높이 (em)
const DIGIT_EM = 1.35

// 플립 시계처럼 세로로 굴러가는 한 자리 숫자
function RollingDigit({ digit }: { digit: string }) {
  const n = Number(digit)
  return (
    <span
      className="inline-block overflow-hidden align-bottom"
      style={{ height: `${DIGIT_EM}em` }}
    >
      <span
        className="block transition-transform duration-700"
        style={{
          transform: `translateY(-${n * DIGIT_EM}em)`,
          transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span
            key={i}
            className="block text-center"
            style={{ height: `${DIGIT_EM}em`, lineHeight: `${DIGIT_EM}em` }}
          >
            {i}
          </span>
        ))}
      </span>
    </span>
  )
}

function RollingNumber({ value, bumping }: { value: number; bumping: boolean }) {
  const text = value.toLocaleString()
  return (
    <span
      className={`inline-flex items-baseline font-bold tabular-nums transition-all duration-300 ${
        bumping ? 'scale-110 text-rose-600' : 'scale-100 text-rose-500'
      }`}
      style={{ transformOrigin: 'center bottom' }}
    >
      {text.split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <RollingDigit key={`${text.length}-${i}`} digit={ch} />
        ) : (
          <span key={`${text.length}-${i}`} style={{ lineHeight: `${DIGIT_EM}em` }}>
            {ch}
          </span>
        ),
      )}
    </span>
  )
}

function LiveCounter() {
  const [count, setCount] = useState<number | null>(null)
  const [bumping, setBumping] = useState(false)

  useEffect(() => {
    const elapsedDays = Math.max(0, (Date.now() - COUNTER_EPOCH) / 86400000)
    const initial =
      COUNTER_BASE +
      Math.floor(elapsedDays * COUNTER_DAILY_GROWTH) +
      Math.floor((Date.now() / 1000) % 97)
    setCount(initial)

    let tickTimer: ReturnType<typeof setTimeout>
    let bumpTimer: ReturnType<typeof setTimeout>

    const tick = () => {
      tickTimer = setTimeout(() => {
        const increment = Math.floor(Math.random() * 3)
        if (increment > 0) {
          setCount((c) => (c === null ? c : c + increment))
          setBumping(true)
          bumpTimer = setTimeout(() => setBumping(false), 450)
        }
        tick()
      }, 700 + Math.random() * 900)
    }
    tick()

    return () => {
      clearTimeout(tickTimer)
      clearTimeout(bumpTimer)
    }
  }, [])

  return (
    <div className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 rounded-full bg-white border border-rose-100 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
      </span>
      <span className="text-xs text-gray-600 inline-flex items-baseline gap-0.5">
        지금까지 <RollingNumber value={count ?? COUNTER_BASE + 5000} bumping={bumping} />명이
        참여했어요
      </span>
    </div>
  )
}

// 테스트 모드 전용 결과 화면 — 실서비스 결과 페이지와 동일한 리치 콘텐츠를 즉석 표시
function PreviewResult({ answers, onRetake }: { answers: Answers; onRetake: () => void }) {
  const result = calcQuizResult(answers)
  const typeDef = result ? getResultTypeDef(result.resultType) : null
  if (!result || !typeDef) return null

  return (
    <div className="flex-1 py-6">
      <ResultContent probability={result.probability} typeDef={typeDef} axes={result.axes} />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onRetake}
          className="py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold transition-colors"
        >
          다시 하기
        </button>
        <a
          href="/quiz/marriage/types"
          className="py-3 rounded-xl border border-gray-200 hover:border-rose-200 text-gray-700 text-sm font-bold text-center transition-colors"
        >
          전체 문항·유형 보기
        </a>
      </div>
    </div>
  )
}
