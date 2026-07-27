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

// 문항 24개 — 6개 파트 × 4문항. 카피 교체 시 구조(축 매핑·p값)는 유지.
export const QUESTIONS: QuizQuestion[] = [
  // ── PART 1. 설렘의 시작 ──
  {
    id: 'q1',
    title: '마음에 드는 사람이 생기면 나는',
    options: [
      { id: 'q1a', label: '먼저 연락하고 대놓고 티를 낸다', axis: 'expression', score: 3, p: 3 },
      { id: 'q1b', label: '자연스럽게 마주칠 자리를 만든다', axis: 'pace', score: 2, p: 2 },
      { id: 'q1c', label: '상대가 다가올 때까지 신호만 보낸다', axis: 'stability', score: 2, p: 0 },
      { id: 'q1d', label: '혼자 마음을 정리하다 타이밍을 놓친다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q2',
    title: '소개팅 자리, 첫인상이 괜찮다면',
    options: [
      { id: 'q2a', label: '그 자리에서 다음 약속을 잡는다', axis: 'pace', score: 3, p: 3 },
      { id: 'q2b', label: '헤어지고 30분 안에 잘 들어갔냐고 연락한다', axis: 'expression', score: 3, p: 2 },
      { id: 'q2c', label: '이틀 정도 두고 보다가 연락한다', axis: 'stability', score: 2, p: 1 },
      { id: 'q2d', label: '상대 연락을 기다린다. 오면 인연이지', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'q3',
    title: '썸 타는 상대의 연락 빈도, 나의 이상은',
    options: [
      { id: 'q3a', label: '틈날 때마다. 일상 공유가 곧 애정', axis: 'expression', score: 3, p: 2 },
      { id: 'q3b', label: '아침·점심·저녁 리듬 있게', axis: 'stability', score: 3, p: 3 },
      { id: 'q3c', label: '하루 한두 번, 밀도 있는 대화면 충분', axis: 'independence', score: 2, p: 1 },
      { id: 'q3d', label: '연락은 필요할 때만. 각자 삶이 우선', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q4',
    title: '상대가 보낸 메시지에 "ㅋㅋ" 하나만 왔다',
    options: [
      { id: 'q4a', label: '"뭐가 웃긴데~" 하고 바로 되받아친다', axis: 'expression', score: 3, p: 2 },
      { id: 'q4b', label: '대화 주제를 바꿔 자연스럽게 이어간다', axis: 'pace', score: 2, p: 2 },
      { id: 'q4c', label: '바쁜가 보다 하고 잠시 둔다', axis: 'stability', score: 2, p: 1 },
      { id: 'q4d', label: '나도 "ㅋㅋ"로 응수한다. 밀당 시작', axis: 'independence', score: 2, p: -1 },
    ],
  },

  // ── PART 2. 관계의 속도 ──
  {
    id: 'q5',
    title: '썸 기간은 어느 정도가 적당할까',
    options: [
      { id: 'q5a', label: '2주면 충분. 마음 확인했으면 직진', axis: 'pace', score: 3, p: 3 },
      { id: 'q5b', label: '한두 달은 서로 알아가야지', axis: 'stability', score: 2, p: 2 },
      { id: 'q5c', label: '기간보다 확신이 중요하다', axis: 'stability', score: 3, p: 1 },
      { id: 'q5d', label: '썸 자체가 제일 재밌는 구간인데 왜 끝내', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'q6',
    title: '고백은 누가 해야 할까',
    options: [
      { id: 'q6a', label: '내가 한다. 기다리는 시간이 아깝다', axis: 'expression', score: 3, p: 3 },
      { id: 'q6b', label: '분위기를 만들어서 상대가 하게 한다', axis: 'pace', score: 2, p: 2 },
      { id: 'q6c', label: '확신이 들 때까지는 서로 아껴둔다', axis: 'stability', score: 2, p: 1 },
      { id: 'q6d', label: '고백 없이 자연스럽게 되는 게 이상적', axis: 'independence', score: 2, p: 0 },
    ],
  },
  {
    id: 'q7',
    title: '부모님께 연인을 소개하는 시점은',
    options: [
      { id: 'q7a', label: '확신이 들면 빠를수록 좋다', axis: 'pace', score: 3, p: 3 },
      { id: 'q7b', label: '1년쯤 만나보고 나서', axis: 'stability', score: 2, p: 2 },
      { id: 'q7c', label: '결혼 얘기가 나올 때쯤', axis: 'stability', score: 1, p: 1 },
      { id: 'q7d', label: '소개할 필요가 있나 싶다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q8',
    title: '연인의 친구 모임에 초대받았다',
    options: [
      { id: 'q8a', label: '좋아! 먼저 나서서 친해진다', axis: 'expression', score: 3, p: 2 },
      { id: 'q8b', label: '가긴 가는데 긴장은 된다', axis: 'stability', score: 2, p: 2 },
      { id: 'q8c', label: '몇 번 더 만난 뒤에 가고 싶다', axis: 'pace', score: 1, p: 1 },
      { id: 'q8d', label: '커플은 커플, 친구는 친구 아닌가', axis: 'independence', score: 3, p: -1 },
    ],
  },

  // ── PART 3. 일상과 라이프스타일 ──
  {
    id: 'q9',
    title: '주말에 가장 하고 싶은 것은',
    options: [
      { id: 'q9a', label: '좋아하는 사람과 데이트', axis: 'expression', score: 2, p: 3 },
      { id: 'q9b', label: '친구들과 왁자지껄 모임', axis: 'pace', score: 2, p: 1 },
      { id: 'q9c', label: '운동이나 자기계발로 나를 채우기', axis: 'stability', score: 2, p: 1 },
      { id: 'q9d', label: '집에서 완벽한 혼자만의 휴식', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'q10',
    title: '데이트 계획을 세울 때 나는',
    options: [
      { id: 'q10a', label: '맛집 예약까지 코스를 다 짜둔다', axis: 'stability', score: 3, p: 2 },
      { id: 'q10b', label: '큰 틀만 정하고 흐름에 맡긴다', axis: 'pace', score: 2, p: 2 },
      { id: 'q10c', label: '즉흥이 제일 재밌다. 발길 닿는 대로', axis: 'expression', score: 2, p: 1 },
      { id: 'q10d', label: '상대가 정해주면 따라가는 편', axis: 'independence', score: 1, p: 0 },
    ],
  },
  {
    id: 'q11',
    title: '연인과 여행을 간다면 나의 역할은',
    options: [
      { id: 'q11a', label: '총무 겸 가이드. 엑셀 일정표까지 만든다', axis: 'stability', score: 3, p: 3 },
      { id: 'q11b', label: '분위기 메이커. 사진과 리액션 담당', axis: 'expression', score: 3, p: 2 },
      { id: 'q11c', label: '흘러가는 대로. 길을 잃어도 그게 추억', axis: 'pace', score: 2, p: 1 },
      { id: 'q11d', label: '각자 보고 싶은 걸 보고 저녁에 만나자', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'q12',
    title: '혼자만의 시간, 나에게는',
    options: [
      { id: 'q12a', label: '없어도 그만. 함께가 더 좋다', axis: 'expression', score: 2, p: 2 },
      { id: 'q12b', label: '일주일에 하루 정도는 필요하다', axis: 'stability', score: 2, p: 2 },
      { id: 'q12c', label: '연애 중에도 반드시 지켜야 하는 성역', axis: 'independence', score: 3, p: 0 },
      { id: 'q12d', label: '사실 혼자가 제일 편하다', axis: 'independence', score: 3, p: -2 },
    ],
  },

  // ── PART 4. 갈등과 소통 ──
  {
    id: 'q13',
    title: '갈등이 생겼을 때 나는',
    options: [
      { id: 'q13a', label: '바로 대화로 풀어야 잠이 온다', axis: 'expression', score: 3, p: 3 },
      { id: 'q13b', label: '하루 정도 정리하고 차분히 말한다', axis: 'stability', score: 3, p: 3 },
      { id: 'q13c', label: '시간이 해결해줄 때까지 둔다', axis: 'independence', score: 2, p: -1 },
      { id: 'q13d', label: '먼저 사과받기 전엔 말 안 한다', axis: 'pace', score: 1, p: -2 },
    ],
  },
  {
    id: 'q14',
    title: '연인이 힘들어 보일 때 나는',
    options: [
      { id: 'q14a', label: '무슨 일인지 바로 물어본다', axis: 'expression', score: 3, p: 2 },
      { id: 'q14b', label: '말할 때까지 곁에서 기다린다', axis: 'stability', score: 3, p: 3 },
      { id: 'q14c', label: '맛있는 걸 사들고 간다', axis: 'pace', score: 2, p: 2 },
      { id: 'q14d', label: '혼자 시간이 필요할 테니 둔다', axis: 'independence', score: 3, p: 0 },
    ],
  },
  {
    id: 'q15',
    title: '서운한 게 생겼을 때 나는',
    options: [
      { id: 'q15a', label: '그 자리에서 말한다. 쌓아두면 병 된다', axis: 'expression', score: 3, p: 3 },
      { id: 'q15b', label: '적당한 타이밍을 골라 부드럽게 꺼낸다', axis: 'stability', score: 3, p: 2 },
      { id: 'q15c', label: '세 번까지는 참는다. 네 번째에 폭발', axis: 'pace', score: 1, p: 0 },
      { id: 'q15d', label: '말 안 한다. 대신 마음의 문이 닫힌다', axis: 'independence', score: 2, p: -2 },
    ],
  },
  {
    id: 'q16',
    title: '연인과 의견이 완전히 다를 때',
    options: [
      { id: 'q16a', label: '끝장 토론. 서로를 이해할 때까지', axis: 'expression', score: 2, p: 2 },
      { id: 'q16b', label: '반반 양보해서 중간 지점을 찾는다', axis: 'stability', score: 3, p: 3 },
      { id: 'q16c', label: '중요한 문제 아니면 상대에게 맞춘다', axis: 'pace', score: 2, p: 1 },
      { id: 'q16d', label: '각자 방식대로 하면 된다. 강요 금지', axis: 'independence', score: 3, p: 0 },
    ],
  },

  // ── PART 5. 가치관 ──
  {
    id: 'q17',
    title: '월급을 받으면 나는',
    options: [
      { id: 'q17a', label: '저축·투자 비율이 정해져 있다', axis: 'stability', score: 3, p: 3 },
      { id: 'q17b', label: '쓸 건 쓰고 남으면 모은다', axis: 'pace', score: 2, p: 1 },
      { id: 'q17c', label: '경험에 쓰는 게 남는 것', axis: 'expression', score: 2, p: 0 },
      { id: 'q17d', label: '통장 잔고를 잘 안 본다', axis: 'independence', score: 2, p: -2 },
    ],
  },
  {
    id: 'q18',
    title: '연인의 가족 행사에 함께 가자는 말, 나의 속마음은',
    options: [
      { id: 'q18a', label: '드디어! 잘 보이고 싶어서 설렌다', axis: 'expression', score: 2, p: 3 },
      { id: 'q18b', label: '관계가 깊어지는 단계구나, 기꺼이', axis: 'stability', score: 3, p: 3 },
      { id: 'q18c', label: '조금 이르지 않나? 부담이 살짝', axis: 'pace', score: 1, p: 0 },
      { id: 'q18d', label: '가족은 가족, 연애는 연애로 두고 싶다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q19',
    title: '"사랑이 밥 먹여주냐"는 말에 나는',
    options: [
      { id: 'q19a', label: '사랑이 있어야 밥도 맛있다', axis: 'expression', score: 3, p: 3 },
      { id: 'q19b', label: '사랑과 현실, 둘 다 챙겨야 한다', axis: 'stability', score: 3, p: 2 },
      { id: 'q19c', label: '맞는 말. 현실이 받쳐줘야 사랑도 있다', axis: 'pace', score: 1, p: 1 },
      { id: 'q19d', label: '밥은 내가 벌어서 먹으면 된다', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'q20',
    title: '반려동물이나 식물을 키우는 것에 대해',
    options: [
      { id: 'q20a', label: '이미 키우고 있고, 매일이 행복하다', axis: 'stability', score: 3, p: 2 },
      { id: 'q20b', label: '연인과 함께라면 키워보고 싶다', axis: 'expression', score: 2, p: 3 },
      { id: 'q20c', label: '귀엽지만 책임질 자신은 아직 없다', axis: 'pace', score: 1, p: 0 },
      { id: 'q20d', label: '내 몸 하나 챙기기도 벅차다', axis: 'independence', score: 2, p: -1 },
    ],
  },

  // ── PART 6. 결혼이라는 미래 ──
  {
    id: 'q21',
    title: '"결혼" 하면 가장 먼저 드는 생각은',
    options: [
      { id: 'q21a', label: '좋아하는 사람과의 매일이라니 설렌다', axis: 'expression', score: 2, p: 3 },
      { id: 'q21b', label: '준비가 되면 자연스럽게 하고 싶다', axis: 'stability', score: 3, p: 2 },
      { id: 'q21c', label: '해도 그만 안 해도 그만', axis: 'independence', score: 2, p: -1 },
      { id: 'q21d', label: '내 자유가 사라질까 겁난다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q22',
    title: '결혼식을 한다면 어떤 모습일까',
    options: [
      { id: 'q22a', label: '모두를 초대하는 성대한 축제', axis: 'expression', score: 3, p: 2 },
      { id: 'q22b', label: '소중한 사람만 모은 아늑한 스몰웨딩', axis: 'stability', score: 2, p: 3 },
      { id: 'q22c', label: '둘이서 떠나는 여행 결혼식', axis: 'independence', score: 2, p: 2 },
      { id: 'q22d', label: '식 자체를 생략하고 싶다', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'q23',
    title: '결혼 후 배우자와의 하루, 나의 이상은',
    options: [
      { id: 'q23a', label: '퇴근하면 오늘 있었던 일 다 쏟아내기', axis: 'expression', score: 3, p: 3 },
      { id: 'q23b', label: '저녁 함께 먹고 각자 취미 존중', axis: 'stability', score: 2, p: 2 },
      { id: 'q23c', label: '주말만큼은 무조건 둘이 풀코스', axis: 'pace', score: 2, p: 2 },
      { id: 'q23d', label: '같은 집, 각자의 방. 적당한 거리', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'q24',
    title: '10년 뒤 나의 모습, 가장 가까운 상상은',
    options: [
      { id: 'q24a', label: '배우자와 아이, 북적이는 집', axis: 'expression', score: 2, p: 3 },
      { id: 'q24b', label: '둘이서 단단하게 사는 삶', axis: 'stability', score: 3, p: 3 },
      { id: 'q24c', label: '일과 사랑 모두 현재진행형', axis: 'pace', score: 2, p: 1 },
      { id: 'q24d', label: '자유로운 1인 라이프', axis: 'independence', score: 3, p: -2 },
    ],
  },
]

export type Answers = Record<string, string>

export interface QuizResultData {
  probability: number
  resultType: string
  summary: string
  memeLine: string
  axes: Record<AxisKey, number>
}

const PROBABILITY_MIN = 35
const PROBABILITY_MAX = 95
const PROBABILITY_BASE = 50
// 24문항 p 합계를 35~95 범위에 맞게 스케일링
const PROBABILITY_SCALE = 0.8

export interface ResultTypeDef {
  name: string
  emoji: string
  memeLine: string
  /** 공유용 해시태그 (# 제외) */
  keywords: string[]
  summary: string
  loveStyle: string
  marriageOutlook: string
  strengths: string[]
  watchouts: string[]
  tips: string[]
  /** 환상의 케미 유형명 */
  bestMatch: string
  /** 환장의 케미 유형명 */
  hardMatch: string
}

// 확률 구간(high/mid/low) × 스타일(다가가는 approach / 지키는 steady) = 6유형
const RESULT_TYPES: Record<string, ResultTypeDef> = {
  'high-approach': {
    name: '직진 로맨티스트',
    emoji: '🚀',
    memeLine: '식장 예약이 제일 빠른 유형',
    keywords: ['직진본능', '표현부자', '금사빠아님_진심임', '결혼선봉대'],
    summary:
      '마음이 향하면 계산하지 않고 직진하는 타입입니다. 좋아하면 좋아한다고 말하고, 보고 싶으면 보고 싶다고 말합니다. 그 솔직함이 상대에게는 세상에서 가장 확실한 안정감이 됩니다. 사랑에 있어서 "나중에"라는 말을 믿지 않는 사람 — 지금 이 마음이 가장 뜨겁다는 걸 알기 때문입니다.',
    loveStyle:
      '연애가 시작되면 온 세상이 그 사람 중심으로 재편됩니다. 기념일을 잊는 법이 없고, 상대의 사소한 말 한마디를 기억했다가 서프라이즈로 돌려줍니다. 연락은 자주, 애정 표현은 더 자주. 다만 상대가 표현에 서툰 타입이면 "왜 나만 좋아하는 것 같지?"라는 생각에 혼자 지치기도 합니다.',
    marriageOutlook:
      '결혼을 두려워하지 않는 몇 안 되는 유형입니다. 확신이 서면 프로포즈까지의 속도가 6인 중 가장 빠릅니다. 결혼 후에도 "우리 연애하던 때 같다"는 말을 듣는 부부가 될 가능성이 높습니다. 매일 아침 인사와 잘 자라는 말을 거르지 않는 배우자가 됩니다.',
    strengths: ['망설임 없는 진심 표현', '상대를 불안하게 만들지 않는 확실함', '기념일·이벤트를 챙기는 낭만 실행력'],
    watchouts: ['속도 차이를 존중하지 않으면 상대가 부담을 느낄 수 있어요', '표현이 돌아오지 않을 때 혼자 서운함을 키우는 경향'],
    tips: [
      '상대의 속도계를 먼저 확인하세요. 직진은 방향이 맞을 때만 빛납니다',
      '표현의 크기보다 빈도를 조절해보세요. 잔잔하게 오래가 더 강합니다',
      '가끔은 받는 연습도 필요해요. 사랑은 주고받는 캐치볼입니다',
    ],
    bestMatch: '신중한 온기형',
    hardMatch: '느긋한 마이웨이형',
  },
  'high-steady': {
    name: '따뜻한 계획형',
    emoji: '🏡',
    memeLine: '상견례 날짜부터 잡는 유형',
    keywords: ['신뢰적금', '연애도_장기투자', '준비된배우자', '안정감맛집'],
    summary:
      '관계를 벽돌 쌓듯 차곡차곡 만들어가는 타입입니다. 화려한 이벤트보다 매일 같은 시간의 연락, 약속을 지키는 꾸준함으로 사랑을 증명합니다. 시간이 지날수록 진가가 드러나는 사람 — 3개월보다 3년이 더 기대되는 연애를 합니다. 주변에서 "결혼은 저런 사람이랑 해야 한다"는 말을 듣는 유형입니다.',
    loveStyle:
      '요란하지 않지만 빈틈이 없습니다. 상대의 생활 패턴을 기억하고, 힘든 날을 알아채고, 필요한 순간에 정확히 옆에 있습니다. 갈등이 생겨도 감정적으로 폭발하기보다 하루 정리한 뒤 차분하게 대화를 청합니다. 다만 속마음 표현이 느려서 상대가 "나를 좋아하긴 하는 걸까?" 하고 답답해할 수 있습니다.',
    marriageOutlook:
      '6개 유형 중 결혼 준비도 1위. 경제 계획, 주거 계획, 인생 계획이 이미 머릿속에 그려져 있습니다. 결혼 후에는 가정을 시스템처럼 안정적으로 운영하는 배우자가 됩니다. 통장이 늘어나는 재미와 함께 늙어가는 즐거움을 아는, 오래 볼수록 좋은 사람입니다.',
    strengths: ['흔들리지 않는 꾸준함', '말보다 행동으로 증명하는 신뢰', '현실 감각과 계획 능력'],
    watchouts: ['표현 절약이 심하면 상대는 확신을 잃어요', '계획에 없던 변수에 유연하지 못할 때가 있어요'],
    tips: [
      '마음의 10%만이라도 말로 꺼내보세요. 상대는 그 한마디를 기다립니다',
      '가끔은 계획 없는 하루를 선물해보세요. 즉흥도 연습하면 늘어요',
      '상대의 감정 기복을 "비효율"로 보지 말고 날씨처럼 받아들여 보세요',
    ],
    bestMatch: '설레는 탐색가',
    hardMatch: '자유로운 불꽃형',
  },
  'mid-approach': {
    name: '설레는 탐색가',
    emoji: '🧭',
    memeLine: '운명의 상대 만나면 급발진 예정',
    keywords: ['설렘수집가', '잠재력만렙', '아직_간보는중', '급발진주의'],
    summary:
      '사랑에 진심이지만, 아직 "이 사람이다" 싶은 확신을 찾는 중인 타입입니다. 연애 세포는 충분히 살아있고 사람을 만나는 것도 즐겁습니다. 다만 마음의 문이 완전히 열리는 순간을 기다리고 있을 뿐. 좋은 사람을 만나는 순간 6개 유형 중 가장 극적인 변화를 보여주는, 잠재력의 유형입니다.',
    loveStyle:
      '연애 초반의 설렘을 그 누구보다 잘 즐깁니다. 새로운 사람의 세계를 탐험하는 것이 즐겁고, 리액션이 좋아 상대를 기분 좋게 만듭니다. 하지만 관계가 깊어지는 길목에서 한 번씩 멈칫합니다 — "이 사람이 정말 맞나?" 그 고민의 시간이 길어지면 상대는 지치기 시작합니다.',
    marriageOutlook:
      '지금 당장의 결혼 확률은 중간이지만, 이 수치는 언제든 급등할 수 있습니다. 확신을 주는 사람을 만나면 누구보다 빠르게 결혼으로 직행하는 유형이기 때문입니다. 결혼 후에는 연애 때의 설렘을 일상에서 재생산하는 재주로, 지루할 틈 없는 가정을 만듭니다.',
    strengths: ['순간을 즐길 줄 아는 에너지', '상대를 기분 좋게 만드는 리액션', '새로움에 대한 열린 마음'],
    watchouts: ['간만 보다가 좋은 인연을 놓칠 수 있어요', '설렘이 사라지면 사랑도 끝났다고 착각하기 쉬워요'],
    tips: [
      '100% 확신은 없습니다. 70% 확신이면 한 걸음 내디뎌 보세요',
      '설렘은 시작 신호일 뿐, 편안함이 진짜 본편입니다',
      '비교 대상을 늘리기보다 눈앞의 한 사람을 깊게 들여다보세요',
    ],
    bestMatch: '따뜻한 계획형',
    hardMatch: '신중한 온기형',
  },
  'mid-steady': {
    name: '신중한 온기형',
    emoji: '🕯️',
    memeLine: '슬로우쿠커처럼 서서히 끓는 중',
    keywords: ['느리지만_확실하게', '곰탕같은사랑', '진국인증', '천천히_뜨거워짐'],
    summary:
      '겉은 차분하지만 속은 누구보다 따뜻한 타입입니다. 마음을 여는 데 시간이 걸리지만, 한번 열리면 그 온기가 쉽게 식지 않습니다. 가볍게 시작해서 가볍게 끝나는 요즘 연애 문법과는 다른, 곰탕처럼 오래 우려낼수록 깊어지는 사람. 당신의 진가를 아는 사람만이 그 온기를 누릴 수 있습니다.',
    loveStyle:
      '호감이 있어도 티가 잘 나지 않아 상대가 눈치채지 못하는 경우가 많습니다. 하지만 일단 연애가 시작되면 반전 매력이 폭발합니다 — 기억력 좋은 세심함, 위기에서 빛나는 침착함, 변하지 않는 한결같음. 문제는 시작까지의 진입장벽. 상대가 인내심이 없다면 당신의 본편을 보기도 전에 떠날 수 있습니다.',
    marriageOutlook:
      '결혼을 가볍게 생각하지 않기에 신중하지만, 그만큼 결혼 후 만족도는 6개 유형 중 최상위권입니다. 배우자의 변화를 가장 먼저 알아채고, 말없이 필요한 것을 채워주는 사람. "결혼 잘했다"는 말을 배우자 입에서 가장 자주 듣게 될 유형입니다.',
    strengths: ['깊어질수록 빛나는 진심', '위기에서 드러나는 침착함과 세심함', '쉽게 변하지 않는 한결같음'],
    watchouts: ['마음의 문이 너무 늦게 열리면 기회 자체가 사라져요', '침묵이 길어지면 상대는 거절로 오해해요'],
    tips: [
      '호감의 30%만 미리 보여주세요. 상대에게는 그게 유일한 신호입니다',
      '"천천히"와 "멈춤"은 다릅니다. 느려도 계속 움직이세요',
      '상대의 빠른 속도를 가벼움으로 단정하지 마세요. 스타일 차이일 뿐입니다',
    ],
    bestMatch: '직진 로맨티스트',
    hardMatch: '자유로운 불꽃형',
  },
  'low-approach': {
    name: '자유로운 불꽃형',
    emoji: '🔥',
    memeLine: '결혼? 아직은 내 인생이 더 재밌음',
    keywords: ['내인생이_메인디쉬', '자유영혼', '불꽃주의보', '묶이면_도망감'],
    summary:
      '지금은 사랑보다 나의 세계가 우선인 타입입니다. 하고 싶은 것도, 이루고 싶은 것도 많아서 연애가 인생의 1순위가 아닐 뿐 — 매력이 없어서가 결코 아닙니다. 오히려 자기 인생을 재밌게 사는 사람 특유의 에너지가 사람을 끌어당깁니다. 불꽃이 튀는 상대를 만나면 누구보다 뜨거워지는 반전의 유형입니다.',
    loveStyle:
      '밀당의 고수라는 오해를 받지만, 사실은 밀당이 아니라 진짜 바쁜 겁니다. 연애를 해도 자신의 리듬을 잃지 않으며, 상대에게도 각자의 삶을 존중하자고 말합니다. 소유하려 들지 않는 쿨함이 매력이지만, 안정형 상대에게는 "나에게 진심이 아닌가?"라는 불안을 줄 수 있습니다.',
    marriageOutlook:
      '지금의 결혼 확률이 낮은 건 능력이 아니라 우선순위의 문제입니다. 자신의 세계를 존중해주는 사람, 서로의 자유를 침범하지 않는 파트너를 만나면 생각이 달라집니다. 결혼하더라도 "부부이자 각자"로 사는 신개념 결혼 생활을 개척하는 유형 — 오히려 요즘 시대와 잘 맞습니다.',
    strengths: ['어디로 튈지 모르는 매력', '자기 인생을 사는 사람의 건강한 에너지', '상대를 소유하려 하지 않는 쿨함'],
    watchouts: ['"바쁨"이 반복되면 상대에게는 거절의 신호로 읽혀요', '자유와 방치는 한 끗 차이입니다'],
    tips: [
      '일주일에 단 하루라도 상대를 1순위에 놓는 날을 만들어보세요',
      '자유를 지키고 싶다면, 그만큼 안심을 선물하세요. 자유는 신뢰 위에서만 유지됩니다',
      '"나중에 여유되면 연애해야지"의 나중은 오지 않습니다. 지금 곁의 인연을 보세요',
    ],
    bestMatch: '느긋한 마이웨이형',
    hardMatch: '따뜻한 계획형',
  },
  'low-steady': {
    name: '느긋한 마이웨이형',
    emoji: '🐢',
    memeLine: '인연은 오는 것, 쫓는 것 아님',
    keywords: ['거북이전략', '조급함제로', '올사람은온다', '마이페이스'],
    summary:
      '서두를 이유가 전혀 없는 타입입니다. 남들이 연애 못 해서 안달일 때도 흔들리지 않는 단단한 페이스의 소유자. "때가 되면 만나겠지"라는 태도가 무심해 보이지만, 사실은 자신에 대한 깊은 믿음에서 나오는 여유입니다. 조급하게 아무나 만나서 상처받는 일이 없는, 어쩌면 가장 현명한 유형일지도 모릅니다.',
    loveStyle:
      '먼저 다가가는 일은 거의 없지만, 다가온 인연을 밀어내지도 않습니다. 함께 있어도 편하고 혼자 있어도 편한, 부담 제로의 연애를 합니다. 상대를 바꾸려 하지 않고 있는 그대로 받아들이는 관대함이 최고의 장점. 다만 표현과 이벤트를 기대하는 상대에게는 "설렘이 없다"는 아쉬움을 남길 수 있습니다.',
    marriageOutlook:
      '결혼을 서두르지 않을 뿐, 거부하는 것이 아닙니다. 자연스럽게 스며드는 인연을 만나면 물 흐르듯 결혼까지 이어지는 유형입니다. 결혼 후에는 잔소리 없고 간섭 없는, 함께 있어도 숨 쉴 공간이 있는 편안한 가정을 만듭니다. 롱런 부부의 비결을 타고난 사람입니다.',
    strengths: ['조급함 없는 단단한 페이스', '상대를 바꾸려 하지 않는 관대함', '있는 그대로 편안함을 주는 존재감'],
    watchouts: ['기다림이 길어지면 인연이 지나쳐 갈 수 있어요', '무심함과 여유는 상대 입장에선 구분이 어려워요'],
    tips: [
      '올 사람은 옵니다. 하지만 문은 열어둬야 들어옵니다',
      '한 달에 한 번은 새로운 모임에 나가보세요. 확률은 움직여야 올라갑니다',
      '마음에 드는 사람에게는 평소보다 딱 한 템포만 빠르게 반응해보세요',
    ],
    bestMatch: '자유로운 불꽃형',
    hardMatch: '직진 로맨티스트',
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
    Math.max(PROBABILITY_MIN, PROBABILITY_BASE + Math.round(pSum * PROBABILITY_SCALE)),
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
    memeLine: type.memeLine,
    axes,
  }
}

export function getResultTypeDef(resultType: string): ResultTypeDef | null {
  const found = Object.values(RESULT_TYPES).find((t) => t.name === resultType)
  return found ?? null
}
