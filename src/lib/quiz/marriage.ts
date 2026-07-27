// "내가 결혼할 확률은?" 검사 도메인 로직 (docs/10-v2-mvp-spec.md 5번)
// 서버/클라이언트 공용 순수 함수 — AI 호출 없음, 규칙 기반 계산.
// 응답 4축은 라운드 2에서 AI봇 성향 프로필 재료로 재사용된다.

export const QUIZ_SLUG = 'marriage'

export type AxisKey = 'expression' | 'pace' | 'independence' | 'stability'

export const AXIS_LABELS: Record<AxisKey, string> = {
  expression: '표현 방식',
  pace: '관계 속도',
  independence: '독립성',
  stability: '안정 지향',
}

export interface QuizOption {
  id: string
  label: string
  axis: AxisKey
  /** 해당 축 점수 (0~3) */
  score: number
  /** 결혼 확률 기여 (-2~+3) */
  p: number
}

export interface QuizQuestion {
  id: string
  title: string
  options: QuizOption[]
}

// 문항 카피는 초안 — 콘텐츠 확정 시 label/title 텍스트만 교체 (구조 변경 금지)
export const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    title: '마음에 드는 사람이 생기면 나는',
    options: [
      { id: 'q1a', label: '먼저 연락하고 티를 낸다', axis: 'expression', score: 3, p: 3 },
      { id: 'q1b', label: '자연스러운 자리를 만들어본다', axis: 'pace', score: 2, p: 2 },
      { id: 'q1c', label: '상대가 다가올 때까지 지켜본다', axis: 'stability', score: 2, p: 0 },
      { id: 'q1d', label: '혼자 마음을 정리하다 끝난다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q2',
    title: '연락 스타일에 가장 가까운 것은',
    options: [
      { id: 'q2a', label: '생각나면 바로바로 보낸다', axis: 'expression', score: 3, p: 2 },
      { id: 'q2b', label: '아침·저녁 안부는 챙기는 편', axis: 'stability', score: 3, p: 3 },
      { id: 'q2c', label: '용건 있을 때 연락하는 게 편하다', axis: 'independence', score: 2, p: 0 },
      { id: 'q2d', label: '답장이 자주 늦는 편이다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q3',
    title: '주말에 가장 하고 싶은 것은',
    options: [
      { id: 'q3a', label: '좋아하는 사람과 데이트', axis: 'expression', score: 2, p: 3 },
      { id: 'q3b', label: '친구들과 왁자지껄 모임', axis: 'pace', score: 2, p: 1 },
      { id: 'q3c', label: '집에서 완벽한 혼자만의 휴식', axis: 'independence', score: 3, p: -1 },
      { id: 'q3d', label: '자기계발이나 운동', axis: 'stability', score: 2, p: 1 },
    ],
  },
  {
    id: 'q4',
    title: '갈등이 생겼을 때 나는',
    options: [
      { id: 'q4a', label: '바로 대화로 풀어야 잠이 온다', axis: 'expression', score: 3, p: 3 },
      { id: 'q4b', label: '하루 정도 정리하고 차분히 말한다', axis: 'stability', score: 3, p: 3 },
      { id: 'q4c', label: '시간이 해결해줄 때까지 둔다', axis: 'independence', score: 2, p: -1 },
      { id: 'q4d', label: '먼저 사과받기 전엔 말 안 한다', axis: 'pace', score: 1, p: -2 },
    ],
  },
  {
    id: 'q5',
    title: '"결혼" 하면 가장 먼저 드는 생각은',
    options: [
      { id: 'q5a', label: '좋아하는 사람과의 매일이라니 설렌다', axis: 'expression', score: 2, p: 3 },
      { id: 'q5b', label: '준비가 되면 자연스럽게 하고 싶다', axis: 'stability', score: 3, p: 2 },
      { id: 'q5c', label: '해도 그만 안 해도 그만', axis: 'independence', score: 2, p: -1 },
      { id: 'q5d', label: '내 자유가 사라질까 겁난다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q6',
    title: '데이트 계획을 세울 때 나는',
    options: [
      { id: 'q6a', label: '코스를 미리 다 짜두는 편', axis: 'stability', score: 3, p: 2 },
      { id: 'q6b', label: '큰 틀만 정하고 흐름에 맡긴다', axis: 'pace', score: 2, p: 2 },
      { id: 'q6c', label: '즉흥이 제일 재밌다', axis: 'expression', score: 2, p: 1 },
      { id: 'q6d', label: '상대가 정해주면 따라간다', axis: 'independence', score: 1, p: 0 },
    ],
  },
  {
    id: 'q7',
    title: '썸 기간은 어느 정도가 적당할까',
    options: [
      { id: 'q7a', label: '2주면 충분, 마음 확인했으면 직진', axis: 'pace', score: 3, p: 3 },
      { id: 'q7b', label: '한두 달은 서로 알아가야지', axis: 'stability', score: 2, p: 2 },
      { id: 'q7c', label: '기간보다 확신이 중요하다', axis: 'stability', score: 3, p: 1 },
      { id: 'q7d', label: '썸 자체가 제일 재밌는 구간', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'q8',
    title: '연인의 친구 모임에 초대받았다',
    options: [
      { id: 'q8a', label: '좋아! 먼저 나서서 친해진다', axis: 'expression', score: 3, p: 2 },
      { id: 'q8b', label: '가긴 가는데 긴장은 된다', axis: 'stability', score: 2, p: 2 },
      { id: 'q8c', label: '커플은 커플, 친구는 친구 아닌가', axis: 'independence', score: 3, p: -1 },
      { id: 'q8d', label: '몇 번 만난 뒤에 가고 싶다', axis: 'pace', score: 1, p: 1 },
    ],
  },
  {
    id: 'q9',
    title: '월급을 받으면 나는',
    options: [
      { id: 'q9a', label: '저축·투자 비율이 정해져 있다', axis: 'stability', score: 3, p: 3 },
      { id: 'q9b', label: '쓸 건 쓰고 남으면 모은다', axis: 'pace', score: 2, p: 1 },
      { id: 'q9c', label: '경험에 쓰는 게 남는 것', axis: 'expression', score: 2, p: 0 },
      { id: 'q9d', label: '통장 잔고를 잘 안 본다', axis: 'independence', score: 2, p: -2 },
    ],
  },
  {
    id: 'q10',
    title: '연인이 힘들어 보일 때 나는',
    options: [
      { id: 'q10a', label: '무슨 일인지 바로 물어본다', axis: 'expression', score: 3, p: 2 },
      { id: 'q10b', label: '말할 때까지 곁에서 기다린다', axis: 'stability', score: 3, p: 3 },
      { id: 'q10c', label: '혼자 시간이 필요할 테니 둔다', axis: 'independence', score: 3, p: 0 },
      { id: 'q10d', label: '맛있는 걸 사들고 간다', axis: 'pace', score: 2, p: 2 },
    ],
  },
  {
    id: 'q11',
    title: '부모님께 연인을 소개하는 시점은',
    options: [
      { id: 'q11a', label: '확신이 들면 빠를수록 좋다', axis: 'pace', score: 3, p: 3 },
      { id: 'q11b', label: '1년쯤 만나보고 나서', axis: 'stability', score: 2, p: 2 },
      { id: 'q11c', label: '결혼 얘기가 나올 때쯤', axis: 'stability', score: 1, p: 1 },
      { id: 'q11d', label: '소개할 필요가 있나 싶다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q12',
    title: '10년 뒤 나의 모습, 가장 가까운 상상은',
    options: [
      { id: 'q12a', label: '배우자와 아이, 북적이는 집', axis: 'expression', score: 2, p: 3 },
      { id: 'q12b', label: '둘이서 단단하게 사는 삶', axis: 'stability', score: 3, p: 3 },
      { id: 'q12c', label: '일과 사랑 모두 진행형', axis: 'pace', score: 2, p: 1 },
      { id: 'q12d', label: '자유로운 1인 라이프', axis: 'independence', score: 3, p: -2 },
    ],
  },
]

export type Answers = Record<string, string>

export interface QuizResultData {
  probability: number
  resultType: string
  summary: string
  strength: string
  memeLine: string
  axes: Record<AxisKey, number>
}

const PROBABILITY_MIN = 35
const PROBABILITY_MAX = 95
const PROBABILITY_BASE = 50

export interface ResultTypeDef {
  name: string
  summary: string
  strength: string
  memeLine: string
}

// 확률 구간(high/mid/low) × 스타일(다가가는 approach / 지키는 steady) = 6유형
const RESULT_TYPES: Record<string, ResultTypeDef> = {
  'high-approach': {
    name: '직진 로맨티스트',
    summary:
      '마음이 향하면 망설이지 않는 타입입니다. 표현이 빠르고 솔직해서 관계가 결혼까지 이어질 동력이 충분합니다.',
    strength: '망설임 없는 진심 표현',
    memeLine: '식장 예약이 제일 빠른 유형',
  },
  'high-steady': {
    name: '따뜻한 계획형',
    summary:
      '관계를 차곡차곡 쌓아가는 타입입니다. 신뢰가 깊어질수록 강해지는 안정감이 결혼과 가장 잘 어울립니다.',
    strength: '흔들리지 않는 꾸준함',
    memeLine: '상견례 날짜부터 잡는 유형',
  },
  'mid-approach': {
    name: '설레는 탐색가',
    summary:
      '사랑에 진심이지만 아직 확신을 찾는 중입니다. 좋은 사람을 만나면 속도가 확 붙는 잠재력 만렙 타입.',
    strength: '순간을 즐길 줄 아는 에너지',
    memeLine: '운명의 상대 만나면 급발진 예정',
  },
  'mid-steady': {
    name: '신중한 온기형',
    summary:
      '겉은 차분해도 속은 따뜻한 타입입니다. 천천히 데워지는 만큼 한번 정하면 오래 가는 사람입니다.',
    strength: '깊어질수록 빛나는 진심',
    memeLine: '슬로우쿠커처럼 서서히 끓는 중',
  },
  'low-approach': {
    name: '자유로운 불꽃형',
    summary:
      '지금은 사랑보다 나의 세계가 우선인 타입입니다. 다만 불꽃이 튀는 상대를 만나면 누구보다 뜨거워집니다.',
    strength: '어디로 튈지 모르는 매력',
    memeLine: '결혼? 아직은 내 인생이 더 재밌음',
  },
  'low-steady': {
    name: '느긋한 마이웨이형',
    summary:
      '서두를 이유가 전혀 없는 타입입니다. 내 페이스대로 가다 보면 어울리는 사람이 옆에 와 있을 거예요.',
    strength: '조급함 없는 단단한 페이스',
    memeLine: '인연은 오는 것, 쫓는 것 아님',
  },
}

// 카피 검수용 전체 유형 목록 (key = 확률구간-스타일)
export const RESULT_TYPE_LIST: Array<{ key: string } & ResultTypeDef> = Object.entries(
  RESULT_TYPES,
).map(([key, def]) => ({ key, ...def }))

function isCompleteAnswers(answers: Answers): boolean {
  return QUESTIONS.every((q) => {
    const picked = answers[q.id]
    return typeof picked === 'string' && q.options.some((o) => o.id === picked)
  })
}

export function validateAnswers(answers: Answers): boolean {
  return Object.keys(answers).length === QUESTIONS.length && isCompleteAnswers(answers)
}

export function calcQuizResult(answers: Answers): QuizResultData | null {
  if (!validateAnswers(answers)) return null

  const axes: Record<AxisKey, number> = { expression: 0, pace: 0, independence: 0, stability: 0 }
  let pSum = 0

  QUESTIONS.forEach((q) => {
    const option = q.options.find((o) => o.id === answers[q.id])
    if (!option) return
    axes[option.axis] += option.score
    pSum += option.p
  })

  const probability = Math.min(
    PROBABILITY_MAX,
    Math.max(PROBABILITY_MIN, PROBABILITY_BASE + pSum),
  )

  const band = probability >= 75 ? 'high' : probability >= 55 ? 'mid' : 'low'
  const approachScore = axes.expression + axes.pace
  const steadyScore = axes.independence + axes.stability
  const style = approachScore >= steadyScore ? 'approach' : 'steady'

  const type = RESULT_TYPES[`${band}-${style}`]

  return {
    probability,
    resultType: type.name,
    summary: type.summary,
    strength: type.strength,
    memeLine: type.memeLine,
    axes,
  }
}

export function getResultTypeDef(resultType: string): ResultTypeDef | null {
  const found = Object.values(RESULT_TYPES).find((t) => t.name === resultType)
  return found ?? null
}
