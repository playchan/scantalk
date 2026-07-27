import { AXIS_LABELS, getResultTypeDef, type AxisKey, type ResultTypeDef } from '@/lib/quiz/marriage'

interface ResultContentProps {
  probability: number
  typeDef: ResultTypeDef
  axes: Record<AxisKey, number>
}

// 결과 리치 콘텐츠 — 실서비스 결과 페이지와 테스트 모드에서 공용 (순수 프레젠테이션)
export default function ResultContent({ probability, typeDef, axes }: ResultContentProps) {
  const maxAxisScore = Math.max(...Object.values(axes), 1)
  const bestMatchDef = getResultTypeDef(typeDef.bestMatch)
  const hardMatchDef = getResultTypeDef(typeDef.hardMatch)

  return (
    <>
      {/* 헤더 */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 mb-2">나의 결혼 확률은</p>
        <p className="text-7xl font-extrabold text-rose-500 mb-3">{probability}%</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {typeDef.emoji} {typeDef.name}
        </h1>
        <p className="text-sm text-rose-400 font-semibold mt-1">"{typeDef.memeLine}"</p>
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {typeDef.keywords.map((k) => (
            <span
              key={k}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-500"
            >
              #{k}
            </span>
          ))}
        </div>
      </div>

      {/* 요약 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">{typeDef.summary}</p>
      </div>

      {/* 케미 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center">
          <p className="text-[11px] font-bold text-emerald-600 mb-1">💚 환상의 케미</p>
          <p className="text-sm font-bold text-gray-900">
            {bestMatchDef?.emoji} {typeDef.bestMatch}
          </p>
        </div>
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4 text-center">
          <p className="text-[11px] font-bold text-orange-500 mb-1">🧨 환장의 케미</p>
          <p className="text-sm font-bold text-gray-900">
            {hardMatchDef?.emoji} {typeDef.hardMatch}
          </p>
        </div>
      </div>

      {/* 연애 스타일 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-3">
        <h2 className="text-sm font-bold text-gray-900 mb-2">💘 나의 연애 스타일</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{typeDef.loveStyle}</p>
      </div>

      {/* 결혼생활 미리보기 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-3">
        <h2 className="text-sm font-bold text-gray-900 mb-2">💍 결혼생활 미리보기</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{typeDef.marriageOutlook}</p>
      </div>

      {/* 강점 & 주의 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-3">
        <h2 className="text-sm font-bold text-gray-900 mb-3">💪 이런 점이 빛나요</h2>
        <ul className="space-y-2 mb-5">
          {typeDef.strengths.map((s) => (
            <li key={s} className="flex gap-2 text-sm text-gray-700">
              <span className="text-emerald-500 shrink-0">✓</span>
              {s}
            </li>
          ))}
        </ul>
        <h2 className="text-sm font-bold text-gray-900 mb-3">⚠️ 이것만 조심하면 돼요</h2>
        <ul className="space-y-2">
          {typeDef.watchouts.map((w) => (
            <li key={w} className="flex gap-2 text-sm text-gray-600">
              <span className="text-orange-400 shrink-0">!</span>
              {w}
            </li>
          ))}
        </ul>
      </div>

      {/* 꿀팁 */}
      <div className="bg-gray-950 rounded-2xl p-6 mb-3">
        <h2 className="text-sm font-bold text-white mb-3">🍯 {typeDef.name}을 위한 연애 꿀팁</h2>
        <ol className="space-y-2.5">
          {typeDef.tips.map((tip, i) => (
            <li key={tip} className="flex gap-2.5 text-sm text-gray-300 leading-relaxed">
              <span className="text-rose-400 font-bold shrink-0">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ol>
      </div>

      {/* 성향 축 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-bold text-gray-900 mb-4">📊 나의 연애 성향 분석</h2>
        <div className="space-y-3">
          {(Object.keys(AXIS_LABELS) as AxisKey[]).map((axis) => (
            <div key={axis} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-16">{AXIS_LABELS[axis]}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full"
                  style={{ width: `${Math.round((axes[axis] / maxAxisScore) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
