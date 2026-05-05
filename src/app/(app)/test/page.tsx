'use client'

import { useState } from 'react'
import { saveLoveTest } from '@/app/actions/loveTest'

const QUESTIONS = [
  {
    id: 'q1',
    text: '관심 있는 사람이 생겼을 때 어떻게 하나요?',
    options: [
      { value: 'A', text: '망설임 없이 먼저 연락한다' },
      { value: 'B', text: '상대가 관심 있는지 살핀 뒤 행동한다' },
      { value: 'C', text: '자연스럽게 흘러가도록 둔다' },
      { value: 'D', text: '상황을 분석한 뒤 최적의 타이밍을 고른다' },
    ],
  },
  {
    id: 'q2',
    text: '상대방이 연락을 늦게 할 때 어떻게 하나요?',
    options: [
      { value: 'A', text: '바로 다시 연락한다' },
      { value: 'B', text: '걱정되지만 조금 기다린다' },
      { value: 'C', text: '바쁘겠지 하고 크게 신경 쓰지 않는다' },
      { value: 'D', text: '늦는 이유를 생각해본다' },
    ],
  },
  {
    id: 'q3',
    text: '데이트 장소를 정할 때는?',
    options: [
      { value: 'A', text: '내가 직접 계획하고 이끄는 편이다' },
      { value: 'B', text: '상대방 의견을 최대한 반영한다' },
      { value: 'C', text: '즉흥적으로 그날 분위기에 맞게 정한다' },
      { value: 'D', text: '미리 여러 후보를 비교하고 고른다' },
    ],
  },
  {
    id: 'q4',
    text: '좋아하는 감정을 어떻게 표현하나요?',
    options: [
      { value: 'A', text: '말로 직접 표현한다' },
      { value: 'B', text: '행동으로 조심스럽게 표현한다' },
      { value: 'C', text: '함께 있다 보면 자연스럽게 알게 된다' },
      { value: 'D', text: '적절한 타이밍에 계획적으로 표현한다' },
    ],
  },
  {
    id: 'q5',
    text: '연애에서 가장 중요한 것은?',
    options: [
      { value: 'A', text: '적극적인 애정 표현' },
      { value: 'B', text: '서로 간의 신뢰와 안정감' },
      { value: 'C', text: '자유롭고 편안한 분위기' },
      { value: 'D', text: '서로에 대한 깊은 이해' },
    ],
  },
  {
    id: 'q6',
    text: '썸 단계가 길어질 때 어떻게 하나요?',
    options: [
      { value: 'A', text: '먼저 고백해서 결론을 낸다' },
      { value: 'B', text: '상대방이 준비될 때까지 기다린다' },
      { value: 'C', text: '자연스럽게 발전하도록 두는 게 좋다' },
      { value: 'D', text: '상대방 감정을 파악한 뒤 행동한다' },
    ],
  },
  {
    id: 'q7',
    text: '상대방과 갈등이 생겼을 때는?',
    options: [
      { value: 'A', text: '즉시 이야기를 꺼내 해결한다' },
      { value: 'B', text: '감정이 가라앉은 뒤 대화한다' },
      { value: 'C', text: '시간이 지나면 자연스럽게 해결된다고 본다' },
      { value: 'D', text: '원인을 파악하고 해결책을 먼저 생각한다' },
    ],
  },
  {
    id: 'q8',
    text: '상대방이 다른 이성과 친하게 지낼 때?',
    options: [
      { value: 'A', text: '솔직하게 불편하다고 말한다' },
      { value: 'B', text: '내색은 안 하지만 마음이 쓰인다' },
      { value: 'C', text: '믿기 때문에 크게 신경 쓰지 않는다' },
      { value: 'D', text: '상황을 지켜보며 판단한다' },
    ],
  },
  {
    id: 'q9',
    text: '이상적인 연애 속도는?',
    options: [
      { value: 'A', text: '감정이 있으면 빠를수록 좋다' },
      { value: 'B', text: '천천히 서로를 알아가며 발전' },
      { value: 'C', text: '정해진 속도 없이 자연스럽게' },
      { value: 'D', text: '단계별로 체계적으로 발전' },
    ],
  },
  {
    id: 'q10',
    text: '연애 상대에게 가장 바라는 것은?',
    options: [
      { value: 'A', text: '나를 향한 적극적인 관심과 표현' },
      { value: 'B', text: '변함없는 신뢰와 안정감' },
      { value: 'C', text: '자유를 존중해주는 여유로움' },
      { value: 'D', text: '서로를 깊이 이해하려는 노력' },
    ],
  },
]

export default function TestPage() {
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const q = QUESTIONS[currentQ]
  const selectedValue = answers[q.id]
  const answeredCount = Object.keys(answers).length
  const isLast = currentQ === QUESTIONS.length - 1
  const allAnswered = answeredCount === QUESTIONS.length

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: value }))
  }

  const handleNext = () => {
    if (!isLast) setCurrentQ((prev) => prev + 1)
  }

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ((prev) => prev - 1)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    const result = await saveLoveTest(answers)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">연애 성향 테스트</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-2">
          나의 연애 스타일을 알아보세요
        </p>
        <p className="text-xs text-gray-400 mb-8">총 10문항 · 약 3분 소요</p>
        <button
          onClick={() => setStarted(true)}
          className="px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white text-base font-bold rounded-2xl transition-colors"
        >
          테스트 시작하기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 진행률 */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>{currentQ + 1} / {QUESTIONS.length}</span>
          <span>{Math.round((answeredCount / QUESTIONS.length) * 100)}% 완료</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-rose-400 rounded-full transition-all duration-300"
            style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 질문 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <p className="text-base font-semibold text-gray-900 leading-relaxed mb-5">{q.text}</p>

        <div className="space-y-3">
          {q.options.map((opt) => {
            const isSelected = selectedValue === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors ${
                  isSelected
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-rose-200 hover:bg-rose-50/40'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {opt.value}
                </span>
                <span className="text-sm">{opt.text}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* 이전 / 다음 */}
      <div className="flex gap-3">
        {currentQ > 0 && (
          <button
            onClick={handlePrev}
            className="flex-1 py-3 border border-gray-200 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            이전
          </button>
        )}

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
          >
            {submitting ? '분석 중...' : '결과 확인하기'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selectedValue}
            className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
          >
            다음
          </button>
        )}
      </div>
    </div>
  )
}
