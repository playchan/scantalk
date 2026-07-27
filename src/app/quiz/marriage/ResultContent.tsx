import { AXIS_LABELS, getResultTypeDef, type AxisKey, type ResultTypeDef } from '@/lib/quiz/marriage'

interface ResultContentProps {
  probability: number
  typeDef: ResultTypeDef
  axes: Record<AxisKey, number>
}

// 펜타그램(5각 레이더)의 축 배치 순서 — 12시 방향부터 시계방향
const RADAR_ORDER: AxisKey[] = ['expression', 'pace', 'intimacy', 'stability', 'independence']

const RADAR_SIZE = 280
const RADAR_CENTER = RADAR_SIZE / 2
const RADAR_RADIUS = 96

function radarPoint(index: number, ratio: number): [number, number] {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5
  return [
    RADAR_CENTER + Math.cos(angle) * RADAR_RADIUS * ratio,
    RADAR_CENTER + Math.sin(angle) * RADAR_RADIUS * ratio,
  ]
}

function polygonPoints(ratios: number[]): string {
  return ratios.map((r, i) => radarPoint(i, r).join(',')).join(' ')
}

// 연애 성향 펜타그램 — 5축 레이더 차트 (순수 SVG)
function RadarPentagon({ axes }: { axes: Record<AxisKey, number> }) {
  const maxValue = Math.max(...RADAR_ORDER.map((a) => axes[a] ?? 0), 1)
  const ratios = RADAR_ORDER.map((a) => Math.max((axes[a] ?? 0) / maxValue, 0.08))

  return (
    <svg
      viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}
      className="w-full max-w-[280px] mx-auto"
      role="img"
      aria-label="연애 성향 펜타그램"
    >
      {/* 배경 그리드 */}
      {[1, 0.66, 0.33].map((ring) => (
        <polygon
          key={ring}
          points={polygonPoints([ring, ring, ring, ring, ring])}
          fill={ring === 1 ? '#fff1f2' : 'none'}
          stroke="#fecdd3"
          strokeWidth="1"
        />
      ))}
      {/* 축선 */}
      {RADAR_ORDER.map((_, i) => {
        const [x, y] = radarPoint(i, 1)
        return (
          <line
            key={i}
            x1={RADAR_CENTER}
            y1={RADAR_CENTER}
            x2={x}
            y2={y}
            stroke="#fecdd3"
            strokeWidth="1"
          />
        )
      })}
      {/* 값 폴리곤 */}
      <polygon
        points={polygonPoints(ratios)}
        fill="rgba(244, 63, 94, 0.25)"
        stroke="#f43f5e"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* 꼭짓점 */}
      {ratios.map((r, i) => {
        const [x, y] = radarPoint(i, r)
        return <circle key={i} cx={x} cy={y} r="4" fill="#f43f5e" />
      })}
      {/* 축 라벨 */}
      {RADAR_ORDER.map((axis, i) => {
        const [x, y] = radarPoint(i, 1.22)
        return (
          <text
            key={axis}
            x={x}
            y={y + 4}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill="#6b7280"
          >
            {AXIS_LABELS[axis]}
          </text>
        )
      })}
    </svg>
  )
}

// 확률 원형 게이지 — 유형 이모지가 중앙에
function ProbabilityGauge({ probability, emoji }: { probability: number; emoji: string }) {
  const radius = 84
  const circumference = 2 * Math.PI * radius
  const filled = (probability / 100) * circumference

  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#ffe4e6" strokeWidth="14" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl leading-none mb-1">{emoji}</span>
        <span className="text-4xl font-extrabold text-rose-500 leading-none">
          {probability}
          <span className="text-xl">%</span>
        </span>
      </div>
    </div>
  )
}

// 결과 리치 콘텐츠 — 실서비스 결과 페이지와 테스트 모드에서 공용 (순수 프레젠테이션)
export default function ResultContent({ probability, typeDef, axes }: ResultContentProps) {
  const bestMatchDef = getResultTypeDef(typeDef.bestMatch)
  const hardMatchDef = getResultTypeDef(typeDef.hardMatch)

  return (
    <>
      {/* 헤더 — 확률 게이지 */}
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 mb-3">나의 결혼 확률은</p>
        <ProbabilityGauge probability={probability} emoji={typeDef.emoji} />
        <h1 className="text-2xl font-bold text-gray-900 mt-4">{typeDef.name}</h1>
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

      {/* 펜타그램 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-3">
        <h2 className="text-sm font-bold text-gray-900 mb-2 text-center">⭐ 연애 성향 펜타그램</h2>
        <RadarPentagon axes={axes} />
      </div>

      {/* 요약 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">{typeDef.summary}</p>
      </div>

      {/* 케미 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center">
          <p className="text-[11px] font-bold text-emerald-600 mb-1">💚 환상의 케미</p>
          <p className="text-2xl mb-1">{bestMatchDef?.emoji}</p>
          <p className="text-sm font-bold text-gray-900">{typeDef.bestMatch}</p>
        </div>
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4 text-center">
          <p className="text-[11px] font-bold text-orange-500 mb-1">🧨 환장의 케미</p>
          <p className="text-2xl mb-1">{hardMatchDef?.emoji}</p>
          <p className="text-sm font-bold text-gray-900">{typeDef.hardMatch}</p>
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

      <p className="text-center text-[11px] text-gray-400 leading-relaxed mb-4">
        🧠 애착 이론 · 사랑의 언어(5 Love Languages) 등<br />
        관계심리학 프레임워크를 참고해 설계된 검사입니다
      </p>
    </>
  )
}
