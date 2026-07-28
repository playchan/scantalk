import type { Metadata } from 'next'
import Link from 'next/link'
import {
  QUESTIONS,
  RESULT_TYPE_LIST,
  AXIS_LABELS,
  CATEGORY_LABELS,
  GENDER_LABELS,
} from '@/lib/quiz/marriage'

export const metadata: Metadata = {
  title: '[검수] 문항·유형 전체 — 스캔톡',
  robots: { index: false, follow: false },
}

const BAND_LABELS: Record<string, string> = {
  high: '높음 (75%+)',
  mid: '중간 (55~74%)',
  low: '낮음 (~54%)',
}

const DOMINANT_LABELS: Record<string, string> = {
  expression: '표현 주도형',
  pace: '속도 주도형',
  stability: '안정 주도형',
  independence: '독립 주도형',
}

// 카피 검수 페이지 — 문항 24개와 유형 6종 리치 프로필을 한 화면에서 검토
export default function QuizTypesReviewPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="max-w-[560px] mx-auto">
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-700 font-semibold text-center mb-6">
          🧪 카피 검수용 페이지 — 문항·유형 텍스트 확인 및 수정 논의용
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">문항·유형 전체 보기</h1>
          <Link
            href="/quiz/marriage/preview"
            className="text-sm text-rose-500 font-semibold hover:underline"
          >
            테스트 해보기 →
          </Link>
        </div>

        {/* 유형 12종 */}
        <h2 className="text-base font-bold text-gray-900 mb-3">결과 유형 12종</h2>
        <div className="space-y-4 mb-10">
          {RESULT_TYPE_LIST.map((type) => {
            const [band, dominant] = type.key.split('-')
            return (
              <div key={type.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-900">
                    {type.emoji} {type.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-500">
                    확률 {BAND_LABELS[band]}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {DOMINANT_LABELS[dominant]}
                  </span>
                </div>
                <p className="text-sm text-rose-400 font-semibold mb-2">"{type.memeLine}"</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {type.keywords.map((k) => (
                    <span key={k} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-400">
                      #{k}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{type.summary}</p>

                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 leading-relaxed">
                    <b className="text-gray-900">💘 연애 스타일</b> — {type.loveStyle}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    <b className="text-gray-900">💍 결혼생활</b> — {type.marriageOutlook}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 grid gap-1.5 text-xs text-gray-500">
                  <p>💪 강점: {type.strengths.join(' · ')}</p>
                  <p>⚠️ 주의: {type.watchouts.join(' · ')}</p>
                  <p>🍯 꿀팁: {type.tips.join(' / ')}</p>
                  <p>
                    💚 환상의 케미: <b className="text-gray-700">{type.bestMatch}</b> · 🧨 환장의 케미:{' '}
                    <b className="text-gray-700">{type.hardMatch}</b>
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* 문항 62종 */}
        <h2 className="text-base font-bold text-gray-900 mb-1">문항 72종 — 남/녀 각 69문항 응답 (약 8분)</h2>
        <p className="text-xs text-gray-400 mb-3">
          카테고리: 프로필·취향은 AI봇 프로필 재료(축 영향 없음), 성격·상황은 성향 축 산출.
          성별 배지가 있는 문항은 해당 성별에게만 출제. 구조(카테고리·성별·축 매핑)는 유지하고 텍스트만 교체 가능.
        </p>
        <div className="space-y-3">
          {QUESTIONS.map((q, i) => (
            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Q{i + 1}. {q.title}
              </h3>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 mb-3 mr-1">
                {CATEGORY_LABELS[q.category]}
              </span>
              {q.genderOnly && (
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-3 ${
                    q.genderOnly === 'male'
                      ? 'bg-blue-50 text-blue-500'
                      : 'bg-pink-50 text-pink-500'
                  }`}
                >
                  {GENDER_LABELS[q.genderOnly]} 전용
                </span>
              )}
              <ul className="space-y-2">
                {q.options.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-gray-700">{o.label}</span>
                    <span className="flex gap-1 shrink-0">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {AXIS_LABELS[o.axis]} +{o.score}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          o.p >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                        }`}
                      >
                        p {o.p >= 0 ? `+${o.p}` : o.p}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
