// "내가 결혼할 확률은?" 검사 도메인 로직 (docs/10-v2-mvp-spec.md 5번)
// 서버/클라이언트 공용 순수 함수 — AI 호출 없음, 규칙 기반 계산.
// 응답 전체(answers)와 4축(axes)은 라운드 2에서 AI봇 성향 프로필 재료로 재사용된다.
// category별 용도: personality/situation → 성향 축, profile/preference → 봇 프로필·매칭 조건.

export const QUIZ_SLUG = 'marriage'

export type AxisKey = 'expression' | 'pace' | 'independence' | 'stability'

export const AXIS_LABELS: Record<AxisKey, string> = {
  expression: '표현 방식',
  pace: '관계 속도',
  independence: '독립성',
  stability: '안정 지향',
}

export type QuestionCategory = 'profile' | 'personality' | 'preference' | 'situation'

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  profile: '프로필',
  personality: '성격·성향',
  preference: '취향·이상형',
  situation: '상황 반응',
}

export interface QuizOption {
  id: string
  label: string
  axis: AxisKey
  /** 해당 축 점수 (0~3) — profile/preference는 0으로 축에 영향 없음 */
  score: number
  /** 결혼 확률 기여 (-2~+3) */
  p: number
}

export interface QuizQuestion {
  id: string
  title: string
  category: QuestionCategory
  options: QuizOption[]
}

// 문항 36개 — 9개 파트. 카피 교체 시 구조(카테고리·축 매핑·p값)는 유지.
export const QUESTIONS: QuizQuestion[] = [
  // ── PART 0. 나에 대하여 (프로필 — AI봇 기본 정보) ──
  {
    id: 'q1',
    title: '나의 나이대는',
    category: 'profile',
    options: [
      { id: 'q1a', label: '20대 초반', axis: 'stability', score: 0, p: 0 },
      { id: 'q1b', label: '20대 후반', axis: 'stability', score: 0, p: 1 },
      { id: 'q1c', label: '30대 초·중반', axis: 'stability', score: 0, p: 1 },
      { id: 'q1d', label: '30대 후반 이상', axis: 'stability', score: 0, p: 1 },
    ],
  },
  {
    id: 'q2',
    title: '나의 키는',
    category: 'profile',
    options: [
      { id: 'q2a', label: '165cm 미만', axis: 'stability', score: 0, p: 0 },
      { id: 'q2b', label: '165~175cm', axis: 'stability', score: 0, p: 0 },
      { id: 'q2c', label: '175~185cm', axis: 'stability', score: 0, p: 0 },
      { id: 'q2d', label: '185cm 이상', axis: 'stability', score: 0, p: 0 },
    ],
  },
  {
    id: 'q3',
    title: '지금까지의 연애 경험은',
    category: 'profile',
    options: [
      { id: 'q3a', label: '아직 없다 (모태솔로)', axis: 'stability', score: 0, p: -1 },
      { id: 'q3b', label: '1~2번', axis: 'stability', score: 0, p: 1 },
      { id: 'q3c', label: '3~5번', axis: 'stability', score: 0, p: 1 },
      { id: 'q3d', label: '다 세지도 못한다', axis: 'stability', score: 0, p: 0 },
    ],
  },
  {
    id: 'q4',
    title: '요즘 나의 연애 상태는',
    category: 'profile',
    options: [
      { id: 'q4a', label: '썸 진행 중 (그래서 이 테스트를…)', axis: 'expression', score: 1, p: 3 },
      { id: 'q4b', label: '소개팅·모임 등 활발하게 만나는 중', axis: 'pace', score: 1, p: 2 },
      { id: 'q4c', label: '공백기. 올해는 뭔가 있겠지', axis: 'stability', score: 0, p: 0 },
      { id: 'q4d', label: '연애 생각이 별로 없다', axis: 'independence', score: 1, p: -2 },
    ],
  },

  // ── PART 1. 설렘의 시작 ──
  {
    id: 'q5',
    title: '마음에 드는 사람이 생기면 나는',
    category: 'personality',
    options: [
      { id: 'q5a', label: '먼저 연락하고 대놓고 티를 낸다', axis: 'expression', score: 3, p: 3 },
      { id: 'q5b', label: '자연스럽게 마주칠 자리를 만든다', axis: 'pace', score: 2, p: 2 },
      { id: 'q5c', label: '상대가 다가올 때까지 신호만 보낸다', axis: 'stability', score: 2, p: 0 },
      { id: 'q5d', label: '혼자 마음을 정리하다 타이밍을 놓친다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q6',
    title: '소개팅 자리, 첫인상이 괜찮다면',
    category: 'personality',
    options: [
      { id: 'q6a', label: '그 자리에서 다음 약속을 잡는다', axis: 'pace', score: 3, p: 3 },
      { id: 'q6b', label: '헤어지고 30분 안에 잘 들어갔냐고 연락한다', axis: 'expression', score: 3, p: 2 },
      { id: 'q6c', label: '이틀 정도 두고 보다가 연락한다', axis: 'stability', score: 2, p: 1 },
      { id: 'q6d', label: '상대 연락을 기다린다. 오면 인연이지', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'q7',
    title: '썸 타는 상대의 연락 빈도, 나의 이상은',
    category: 'personality',
    options: [
      { id: 'q7a', label: '틈날 때마다. 일상 공유가 곧 애정', axis: 'expression', score: 3, p: 2 },
      { id: 'q7b', label: '아침·점심·저녁 리듬 있게', axis: 'stability', score: 3, p: 3 },
      { id: 'q7c', label: '하루 한두 번, 밀도 있는 대화면 충분', axis: 'independence', score: 2, p: 1 },
      { id: 'q7d', label: '연락은 필요할 때만. 각자 삶이 우선', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q8',
    title: '상대가 보낸 메시지에 "ㅋㅋ" 하나만 왔다',
    category: 'situation',
    options: [
      { id: 'q8a', label: '"뭐가 웃긴데~" 하고 바로 되받아친다', axis: 'expression', score: 3, p: 2 },
      { id: 'q8b', label: '대화 주제를 바꿔 자연스럽게 이어간다', axis: 'pace', score: 2, p: 2 },
      { id: 'q8c', label: '바쁜가 보다 하고 잠시 둔다', axis: 'stability', score: 2, p: 1 },
      { id: 'q8d', label: '나도 "ㅋㅋ"로 응수한다. 밀당 시작', axis: 'independence', score: 2, p: -1 },
    ],
  },

  // ── PART 2. 관계의 속도 ──
  {
    id: 'q9',
    title: '썸 기간은 어느 정도가 적당할까',
    category: 'personality',
    options: [
      { id: 'q9a', label: '2주면 충분. 마음 확인했으면 직진', axis: 'pace', score: 3, p: 3 },
      { id: 'q9b', label: '한두 달은 서로 알아가야지', axis: 'stability', score: 2, p: 2 },
      { id: 'q9c', label: '기간보다 확신이 중요하다', axis: 'stability', score: 3, p: 1 },
      { id: 'q9d', label: '썸 자체가 제일 재밌는 구간인데 왜 끝내', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'q10',
    title: '고백은 누가 해야 할까',
    category: 'personality',
    options: [
      { id: 'q10a', label: '내가 한다. 기다리는 시간이 아깝다', axis: 'expression', score: 3, p: 3 },
      { id: 'q10b', label: '분위기를 만들어서 상대가 하게 한다', axis: 'pace', score: 2, p: 2 },
      { id: 'q10c', label: '확신이 들 때까지는 서로 아껴둔다', axis: 'stability', score: 2, p: 1 },
      { id: 'q10d', label: '고백 없이 자연스럽게 되는 게 이상적', axis: 'independence', score: 2, p: 0 },
    ],
  },
  {
    id: 'q11',
    title: '부모님께 연인을 소개하는 시점은',
    category: 'personality',
    options: [
      { id: 'q11a', label: '확신이 들면 빠를수록 좋다', axis: 'pace', score: 3, p: 3 },
      { id: 'q11b', label: '1년쯤 만나보고 나서', axis: 'stability', score: 2, p: 2 },
      { id: 'q11c', label: '결혼 얘기가 나올 때쯤', axis: 'stability', score: 1, p: 1 },
      { id: 'q11d', label: '소개할 필요가 있나 싶다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q12',
    title: '연인의 친구 모임에 초대받았다',
    category: 'situation',
    options: [
      { id: 'q12a', label: '좋아! 먼저 나서서 친해진다', axis: 'expression', score: 3, p: 2 },
      { id: 'q12b', label: '가긴 가는데 긴장은 된다', axis: 'stability', score: 2, p: 2 },
      { id: 'q12c', label: '몇 번 더 만난 뒤에 가고 싶다', axis: 'pace', score: 1, p: 1 },
      { id: 'q12d', label: '커플은 커플, 친구는 친구 아닌가', axis: 'independence', score: 3, p: -1 },
    ],
  },

  // ── PART 3. 일상과 라이프스타일 ──
  {
    id: 'q13',
    title: '주말에 가장 하고 싶은 것은',
    category: 'personality',
    options: [
      { id: 'q13a', label: '좋아하는 사람과 데이트', axis: 'expression', score: 2, p: 3 },
      { id: 'q13b', label: '친구들과 왁자지껄 모임', axis: 'pace', score: 2, p: 1 },
      { id: 'q13c', label: '운동이나 자기계발로 나를 채우기', axis: 'stability', score: 2, p: 1 },
      { id: 'q13d', label: '집에서 완벽한 혼자만의 휴식', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'q14',
    title: '데이트 계획을 세울 때 나는',
    category: 'personality',
    options: [
      { id: 'q14a', label: '맛집 예약까지 코스를 다 짜둔다', axis: 'stability', score: 3, p: 2 },
      { id: 'q14b', label: '큰 틀만 정하고 흐름에 맡긴다', axis: 'pace', score: 2, p: 2 },
      { id: 'q14c', label: '즉흥이 제일 재밌다. 발길 닿는 대로', axis: 'expression', score: 2, p: 1 },
      { id: 'q14d', label: '상대가 정해주면 따라가는 편', axis: 'independence', score: 1, p: 0 },
    ],
  },
  {
    id: 'q15',
    title: '연인과 여행을 간다면 나의 역할은',
    category: 'personality',
    options: [
      { id: 'q15a', label: '총무 겸 가이드. 엑셀 일정표까지 만든다', axis: 'stability', score: 3, p: 3 },
      { id: 'q15b', label: '분위기 메이커. 사진과 리액션 담당', axis: 'expression', score: 3, p: 2 },
      { id: 'q15c', label: '흘러가는 대로. 길을 잃어도 그게 추억', axis: 'pace', score: 2, p: 1 },
      { id: 'q15d', label: '각자 보고 싶은 걸 보고 저녁에 만나자', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'q16',
    title: '혼자만의 시간, 나에게는',
    category: 'personality',
    options: [
      { id: 'q16a', label: '없어도 그만. 함께가 더 좋다', axis: 'expression', score: 2, p: 2 },
      { id: 'q16b', label: '일주일에 하루 정도는 필요하다', axis: 'stability', score: 2, p: 2 },
      { id: 'q16c', label: '연애 중에도 반드시 지켜야 하는 성역', axis: 'independence', score: 3, p: 0 },
      { id: 'q16d', label: '사실 혼자가 제일 편하다', axis: 'independence', score: 3, p: -2 },
    ],
  },

  // ── PART 4. 갈등과 소통 ──
  {
    id: 'q17',
    title: '갈등이 생겼을 때 나는',
    category: 'personality',
    options: [
      { id: 'q17a', label: '바로 대화로 풀어야 잠이 온다', axis: 'expression', score: 3, p: 3 },
      { id: 'q17b', label: '하루 정도 정리하고 차분히 말한다', axis: 'stability', score: 3, p: 3 },
      { id: 'q17c', label: '시간이 해결해줄 때까지 둔다', axis: 'independence', score: 2, p: -1 },
      { id: 'q17d', label: '먼저 사과받기 전엔 말 안 한다', axis: 'pace', score: 1, p: -2 },
    ],
  },
  {
    id: 'q18',
    title: '연인이 힘들어 보일 때 나는',
    category: 'personality',
    options: [
      { id: 'q18a', label: '무슨 일인지 바로 물어본다', axis: 'expression', score: 3, p: 2 },
      { id: 'q18b', label: '말할 때까지 곁에서 기다린다', axis: 'stability', score: 3, p: 3 },
      { id: 'q18c', label: '맛있는 걸 사들고 간다', axis: 'pace', score: 2, p: 2 },
      { id: 'q18d', label: '혼자 시간이 필요할 테니 둔다', axis: 'independence', score: 3, p: 0 },
    ],
  },
  {
    id: 'q19',
    title: '서운한 게 생겼을 때 나는',
    category: 'personality',
    options: [
      { id: 'q19a', label: '그 자리에서 말한다. 쌓아두면 병 된다', axis: 'expression', score: 3, p: 3 },
      { id: 'q19b', label: '적당한 타이밍을 골라 부드럽게 꺼낸다', axis: 'stability', score: 3, p: 2 },
      { id: 'q19c', label: '세 번까지는 참는다. 네 번째에 폭발', axis: 'pace', score: 1, p: 0 },
      { id: 'q19d', label: '말 안 한다. 대신 마음의 문이 닫힌다', axis: 'independence', score: 2, p: -2 },
    ],
  },
  {
    id: 'q20',
    title: '연인과 의견이 완전히 다를 때',
    category: 'personality',
    options: [
      { id: 'q20a', label: '끝장 토론. 서로를 이해할 때까지', axis: 'expression', score: 2, p: 2 },
      { id: 'q20b', label: '반반 양보해서 중간 지점을 찾는다', axis: 'stability', score: 3, p: 3 },
      { id: 'q20c', label: '중요한 문제 아니면 상대에게 맞춘다', axis: 'pace', score: 2, p: 1 },
      { id: 'q20d', label: '각자 방식대로 하면 된다. 강요 금지', axis: 'independence', score: 3, p: 0 },
    ],
  },

  // ── PART 5. 가치관 ──
  {
    id: 'q21',
    title: '월급을 받으면 나는',
    category: 'personality',
    options: [
      { id: 'q21a', label: '저축·투자 비율이 정해져 있다', axis: 'stability', score: 3, p: 3 },
      { id: 'q21b', label: '쓸 건 쓰고 남으면 모은다', axis: 'pace', score: 2, p: 1 },
      { id: 'q21c', label: '경험에 쓰는 게 남는 것', axis: 'expression', score: 2, p: 0 },
      { id: 'q21d', label: '통장 잔고를 잘 안 본다', axis: 'independence', score: 2, p: -2 },
    ],
  },
  {
    id: 'q22',
    title: '연인의 가족 행사에 함께 가자는 말, 나의 속마음은',
    category: 'personality',
    options: [
      { id: 'q22a', label: '드디어! 잘 보이고 싶어서 설렌다', axis: 'expression', score: 2, p: 3 },
      { id: 'q22b', label: '관계가 깊어지는 단계구나, 기꺼이', axis: 'stability', score: 3, p: 3 },
      { id: 'q22c', label: '조금 이르지 않나? 부담이 살짝', axis: 'pace', score: 1, p: 0 },
      { id: 'q22d', label: '가족은 가족, 연애는 연애로 두고 싶다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q23',
    title: '"사랑이 밥 먹여주냐"는 말에 나는',
    category: 'personality',
    options: [
      { id: 'q23a', label: '사랑이 있어야 밥도 맛있다', axis: 'expression', score: 3, p: 3 },
      { id: 'q23b', label: '사랑과 현실, 둘 다 챙겨야 한다', axis: 'stability', score: 3, p: 2 },
      { id: 'q23c', label: '맞는 말. 현실이 받쳐줘야 사랑도 있다', axis: 'pace', score: 1, p: 1 },
      { id: 'q23d', label: '밥은 내가 벌어서 먹으면 된다', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'q24',
    title: '반려동물이나 식물을 키우는 것에 대해',
    category: 'personality',
    options: [
      { id: 'q24a', label: '이미 키우고 있고, 매일이 행복하다', axis: 'stability', score: 3, p: 2 },
      { id: 'q24b', label: '연인과 함께라면 키워보고 싶다', axis: 'expression', score: 2, p: 3 },
      { id: 'q24c', label: '귀엽지만 책임질 자신은 아직 없다', axis: 'pace', score: 1, p: 0 },
      { id: 'q24d', label: '내 몸 하나 챙기기도 벅차다', axis: 'independence', score: 2, p: -1 },
    ],
  },

  // ── PART 6. 이상형과 취향 (AI봇 매칭 조건 재료) ──
  {
    id: 'q25',
    title: '선호하는 상대의 나이는',
    category: 'preference',
    options: [
      { id: 'q25a', label: '연상이 좋다', axis: 'stability', score: 0, p: 0 },
      { id: 'q25b', label: '동갑 또는 비슷한 또래', axis: 'stability', score: 0, p: 0 },
      { id: 'q25c', label: '연하가 좋다', axis: 'stability', score: 0, p: 0 },
      { id: 'q25d', label: '사람만 좋으면 나이는 상관없다', axis: 'stability', score: 0, p: 1 },
    ],
  },
  {
    id: 'q26',
    title: '상대에게 가장 끌리는 매력 포인트는',
    category: 'preference',
    options: [
      { id: 'q26a', label: '대화가 잘 통하는 유머 코드', axis: 'expression', score: 0, p: 1 },
      { id: 'q26b', label: '다정하고 세심한 배려', axis: 'stability', score: 0, p: 1 },
      { id: 'q26c', label: '자기 일에 몰입하는 열정', axis: 'independence', score: 0, p: 1 },
      { id: 'q26d', label: '외모·스타일. 일단 눈이 즐거워야', axis: 'pace', score: 0, p: 0 },
    ],
  },
  {
    id: 'q27',
    title: '이상적인 데이트 코스는',
    category: 'preference',
    options: [
      { id: 'q27a', label: '맛집 투어와 카페 수다', axis: 'expression', score: 0, p: 1 },
      { id: 'q27b', label: '집에서 배달시켜 놓고 영화 정주행', axis: 'stability', score: 0, p: 1 },
      { id: 'q27c', label: '등산·러닝·볼링 같은 액티비티', axis: 'pace', score: 0, p: 1 },
      { id: 'q27d', label: '전시·공연 보고 산책하며 대화', axis: 'independence', score: 0, p: 1 },
    ],
  },
  {
    id: 'q28',
    title: '내가 가장 사랑을 느끼는 순간은 (나의 사랑의 언어)',
    category: 'preference',
    options: [
      { id: 'q28a', label: '"보고 싶다", "잘했어" 같은 말 한마디', axis: 'expression', score: 0, p: 1 },
      { id: 'q28b', label: '나를 위해 시간을 내어줄 때', axis: 'stability', score: 0, p: 1 },
      { id: 'q28c', label: '작은 선물과 서프라이즈', axis: 'pace', score: 0, p: 1 },
      { id: 'q28d', label: '손잡기, 포옹 같은 스킨십', axis: 'independence', score: 0, p: 1 },
    ],
  },
  {
    id: 'q29',
    title: '상대에게 절대 포기 못 하는 조건 하나를 고른다면',
    category: 'preference',
    options: [
      { id: 'q29a', label: '거짓말하지 않는 정직함', axis: 'stability', score: 0, p: 1 },
      { id: 'q29b', label: '나를 웃게 하는 유머', axis: 'expression', score: 0, p: 1 },
      { id: 'q29c', label: '경제관념과 성실함', axis: 'pace', score: 0, p: 1 },
      { id: 'q29d', label: '나의 시간과 공간에 대한 존중', axis: 'independence', score: 0, p: 0 },
    ],
  },

  // ── PART 7. 만약에… (상황 반응) ──
  {
    id: 'q30',
    title: '헤어진 애인에게 "잘 지내?" 연락이 왔다',
    category: 'situation',
    options: [
      { id: 'q30a', label: '읽씹. 과거는 과거다', axis: 'independence', score: 2, p: 1 },
      { id: 'q30b', label: '"잘 지내지~" 예의상 답하고 끝', axis: 'stability', score: 2, p: 1 },
      { id: 'q30c', label: '무슨 일인지 궁금해서 대화가 길어진다', axis: 'expression', score: 2, p: 0 },
      { id: 'q30d', label: '혹시…? 하는 마음에 잠이 안 온다', axis: 'pace', score: 1, p: -1 },
    ],
  },
  {
    id: 'q31',
    title: '친구가 "너랑 잘 어울릴 사람 있는데 소개해줄까?"',
    category: 'situation',
    options: [
      { id: 'q31a', label: '"언제? 어디서?" 바로 일정부터 잡는다', axis: 'pace', score: 3, p: 3 },
      { id: 'q31b', label: '사진 말고 어떤 사람인지부터 물어본다', axis: 'stability', score: 2, p: 2 },
      { id: 'q31c', label: '"생각해볼게" 하고 일주일째 고민 중', axis: 'independence', score: 2, p: 0 },
      { id: 'q31d', label: '"괜찮아~" 자연스러운 만남을 원한다', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'q32',
    title: '만난 지 3개월, 상대가 커플링 매장 앞에서 걸음을 멈췄다',
    category: 'situation',
    options: [
      { id: 'q32a', label: '설렌다. 슬쩍 손가락 사이즈를 흘린다', axis: 'expression', score: 2, p: 3 },
      { id: 'q32b', label: '기분은 좋지만 아직 이르다고 생각한다', axis: 'stability', score: 2, p: 1 },
      { id: 'q32c', label: '"구경만 하는 거지?" 확인부터 한다', axis: 'pace', score: 1, p: 0 },
      { id: 'q32d', label: '심장이 철렁. 화제를 돌린다', axis: 'independence', score: 2, p: -2 },
    ],
  },

  // ── PART 8. 결혼이라는 미래 ──
  {
    id: 'q33',
    title: '"결혼" 하면 가장 먼저 드는 생각은',
    category: 'personality',
    options: [
      { id: 'q33a', label: '좋아하는 사람과의 매일이라니 설렌다', axis: 'expression', score: 2, p: 3 },
      { id: 'q33b', label: '준비가 되면 자연스럽게 하고 싶다', axis: 'stability', score: 3, p: 2 },
      { id: 'q33c', label: '해도 그만 안 해도 그만', axis: 'independence', score: 2, p: -1 },
      { id: 'q33d', label: '내 자유가 사라질까 겁난다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'q34',
    title: '결혼식을 한다면 어떤 모습일까',
    category: 'personality',
    options: [
      { id: 'q34a', label: '모두를 초대하는 성대한 축제', axis: 'expression', score: 3, p: 2 },
      { id: 'q34b', label: '소중한 사람만 모은 아늑한 스몰웨딩', axis: 'stability', score: 2, p: 3 },
      { id: 'q34c', label: '둘이서 떠나는 여행 결혼식', axis: 'independence', score: 2, p: 2 },
      { id: 'q34d', label: '식 자체를 생략하고 싶다', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'q35',
    title: '결혼 후 배우자와의 하루, 나의 이상은',
    category: 'personality',
    options: [
      { id: 'q35a', label: '퇴근하면 오늘 있었던 일 다 쏟아내기', axis: 'expression', score: 3, p: 3 },
      { id: 'q35b', label: '저녁 함께 먹고 각자 취미 존중', axis: 'stability', score: 2, p: 2 },
      { id: 'q35c', label: '주말만큼은 무조건 둘이 풀코스', axis: 'pace', score: 2, p: 2 },
      { id: 'q35d', label: '같은 집, 각자의 방. 적당한 거리', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'q36',
    title: '10년 뒤 나의 모습, 가장 가까운 상상은',
    category: 'personality',
    options: [
      { id: 'q36a', label: '배우자와 아이, 북적이는 집', axis: 'expression', score: 2, p: 3 },
      { id: 'q36b', label: '둘이서 단단하게 사는 삶', axis: 'stability', score: 3, p: 3 },
      { id: 'q36c', label: '일과 사랑 모두 현재진행형', axis: 'pace', score: 2, p: 1 },
      { id: 'q36d', label: '자유로운 1인 라이프', axis: 'independence', score: 3, p: -2 },
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
// 36문항 p 합계를 35~95 범위에 맞게 스케일링
const PROBABILITY_SCALE = 0.75

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

// 확률 구간(high/mid/low) × 주도 성향 축(4축) = 12유형
const RESULT_TYPES: Record<string, ResultTypeDef> = {
  'high-expression': {
    name: '직진 로맨티스트',
    emoji: '🚀',
    memeLine: '식장 예약이 제일 빠른 유형',
    keywords: ['직진본능', '표현부자', '금사빠아님_진심임', '결혼선봉대'],
    summary:
      '마음이 향하면 계산하지 않고 직진하는 타입입니다. 좋아하면 좋아한다고 말하고, 보고 싶으면 보고 싶다고 말합니다. 그 솔직함이 상대에게는 세상에서 가장 확실한 안정감이 됩니다. 사랑에 있어서 "나중에"라는 말을 믿지 않는 사람입니다.',
    loveStyle:
      '연애가 시작되면 온 세상이 그 사람 중심으로 재편됩니다. 기념일을 잊는 법이 없고, 상대의 사소한 말을 기억했다가 서프라이즈로 돌려줍니다. 다만 상대가 표현에 서툰 타입이면 "왜 나만 좋아하는 것 같지?"라는 생각에 혼자 지치기도 합니다.',
    marriageOutlook:
      '결혼을 두려워하지 않는 몇 안 되는 유형입니다. 확신이 서면 프로포즈까지의 속도가 12유형 중 최상위권. 결혼 후에도 "우리 연애하던 때 같다"는 말을 듣는 부부가 될 가능성이 높습니다.',
    strengths: ['망설임 없는 진심 표현', '상대를 불안하게 만들지 않는 확실함', '기념일·이벤트를 챙기는 낭만 실행력'],
    watchouts: ['속도 차이를 존중하지 않으면 상대가 부담을 느낄 수 있어요', '표현이 돌아오지 않을 때 혼자 서운함을 키우는 경향'],
    tips: [
      '상대의 속도계를 먼저 확인하세요. 직진은 방향이 맞을 때만 빛납니다',
      '표현의 크기보다 빈도를 조절해보세요. 잔잔하게 오래가 더 강합니다',
      '가끔은 받는 연습도 필요해요. 사랑은 주고받는 캐치볼입니다',
    ],
    bestMatch: '신중한 온기형',
    hardMatch: '썸 전문가',
  },
  'high-pace': {
    name: '초고속 골인형',
    emoji: '🚄',
    memeLine: '만난 지 100일에 상견례 가능',
    keywords: ['속전속결', '결정장애_그게뭐죠', 'KTX연애', '골인각_재는중'],
    summary:
      '마음의 결정이 서면 실행까지의 속도가 압도적인 타입입니다. 썸에서 연애로, 연애에서 결혼으로 넘어가는 환승 구간에서 머뭇거림이 없습니다. 인생의 중요한 결정일수록 오래 끌면 안 된다는 철학의 소유자. 주변에서 "벌써?"라는 말을 가장 자주 듣지만, 후회도 가장 적게 하는 유형입니다.',
    loveStyle:
      '만남 초반에 상대를 파악하는 스캔 능력이 뛰어납니다. "이 사람이다" 싶으면 관계의 다음 단계를 먼저 제안하는 쪽도 늘 당신. 데이트 약속을 잡을 때도 "언제 시간 돼?"가 아니라 "토요일 7시 어때?"로 물어봅니다. 다만 신중한 상대에게는 그 속도가 압박으로 느껴질 수 있습니다.',
    marriageOutlook:
      '결혼 결심이 서는 순간부터는 일사천리입니다. 상견례, 식장, 신혼집까지 프로젝트 매니저처럼 진행하는 유형. 결혼 후에도 부부의 대소사를 빠르게 결정하고 추진하는 엔진 역할을 맡습니다. 단, 배우자의 "잠깐만, 생각 좀"을 기다려주는 연습이 행복의 열쇠입니다.',
    strengths: ['기회를 놓치지 않는 결단력', '관계를 정체시키지 않는 추진력', '말보다 빠른 실행'],
    watchouts: ['상대가 준비되기 전에 다음 단계를 밀어붙일 수 있어요', '빠른 결정만큼 빠른 실망도 주의하세요'],
    tips: [
      '중요한 제안 전에 "너는 어떻게 생각해?"를 먼저 물어보세요',
      '속도를 늦추는 게 아니라 보폭을 맞추는 겁니다. 함께 가야 골인입니다',
      '결정 전 하루의 숙성 시간을 가져보세요. 확신은 사라지지 않습니다',
    ],
    bestMatch: '따뜻한 계획형',
    hardMatch: '느긋한 마이웨이형',
  },
  'high-stability': {
    name: '따뜻한 계획형',
    emoji: '🏡',
    memeLine: '상견례 날짜부터 잡는 유형',
    keywords: ['신뢰적금', '연애도_장기투자', '준비된배우자', '안정감맛집'],
    summary:
      '관계를 벽돌 쌓듯 차곡차곡 만들어가는 타입입니다. 화려한 이벤트보다 매일 같은 시간의 연락, 약속을 지키는 꾸준함으로 사랑을 증명합니다. 시간이 지날수록 진가가 드러나는 사람 — 3개월보다 3년이 더 기대되는 연애를 합니다.',
    loveStyle:
      '요란하지 않지만 빈틈이 없습니다. 상대의 생활 패턴을 기억하고, 힘든 날을 알아채고, 필요한 순간에 정확히 옆에 있습니다. 갈등이 생겨도 감정적으로 폭발하기보다 하루 정리한 뒤 차분하게 대화를 청합니다. 다만 속마음 표현이 느려서 상대가 답답해할 수 있습니다.',
    marriageOutlook:
      '12유형 중 결혼 준비도 1위. 경제 계획, 주거 계획, 인생 계획이 이미 머릿속에 그려져 있습니다. 결혼 후에는 가정을 시스템처럼 안정적으로 운영하는 배우자가 됩니다. 오래 볼수록 좋은 사람입니다.',
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
  'high-independence': {
    name: '츤데레 순정파',
    emoji: '😼',
    memeLine: '겉은 시크, 속은 이미 웨딩플래너',
    keywords: ['츤데레인증', '무심한듯_다챙김', '속마음은_순정만화', '반전매력'],
    summary:
      '겉으로는 쿨하고 독립적이지만, 속으로는 누구보다 진지하게 평생을 그리는 반전의 타입입니다. "연애? 뭐 굳이"라고 말하면서 마음에 둔 사람의 SNS는 다 챙겨보고 있는 사람. 좀처럼 곁을 내주지 않지만, 한번 마음을 정하면 그 사람이 인생의 답이 됩니다.',
    loveStyle:
      '표현은 무뚝뚝해도 행동에는 애정이 배어 있습니다. "밥은 먹었냐"는 퉁명스러운 한마디가 사실 최고 수위의 관심 표현. 자신의 영역을 지키면서도 상대의 영역을 침범하지 않는 세련된 거리감각이 강점입니다. 문제는 상대가 그 시크함을 무관심으로 오해할 때입니다.',
    marriageOutlook:
      '결혼에 대한 확신이 서기까지는 시간이 걸리지만, 내린 결론은 번복하지 않습니다. 결혼 후에는 밖에서는 무심한 척, 집에서는 배우자 껌딱지가 되는 이중생활을 합니다. 서로의 독립성을 존중하면서도 단단하게 연결된, 어른의 결혼을 만드는 유형입니다.',
    strengths: ['행동으로 스며드는 진심', '집착하지 않는 세련된 거리감각', '한번 정하면 번복 없는 심지'],
    watchouts: ['시크함이 길어지면 상대는 무관심으로 읽어요', '마음을 확인해주지 않으면 좋은 인연이 지쳐 떠날 수 있어요'],
    tips: [
      '열 번의 츤 중에 한 번은 데레를 보여주세요. 그 한 번이 관계를 살립니다',
      '"표현 안 해도 알겠지"는 없습니다. 최소한의 언어화 연습을 하세요',
      '상대의 애정 표현을 부담스러워하지 말고 "고마워" 한마디로 받아주세요',
    ],
    bestMatch: '직진 로맨티스트',
    hardMatch: '밀당의 아티스트',
  },
  'mid-expression': {
    name: '설레는 탐색가',
    emoji: '🧭',
    memeLine: '운명의 상대 만나면 급발진 예정',
    keywords: ['설렘수집가', '잠재력만렙', '아직_간보는중', '급발진주의'],
    summary:
      '사랑에 진심이지만, 아직 "이 사람이다" 싶은 확신을 찾는 중인 타입입니다. 연애 세포는 충분히 살아있고 사람을 만나는 것도 즐겁습니다. 좋은 사람을 만나는 순간 12유형 중 가장 극적인 변화를 보여주는, 잠재력의 유형입니다.',
    loveStyle:
      '연애 초반의 설렘을 그 누구보다 잘 즐깁니다. 새로운 사람의 세계를 탐험하는 것이 즐겁고, 리액션이 좋아 상대를 기분 좋게 만듭니다. 하지만 관계가 깊어지는 길목에서 한 번씩 멈칫합니다 — 그 고민의 시간이 길어지면 상대는 지치기 시작합니다.',
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
    hardMatch: '거리조절 마스터',
  },
  'mid-pace': {
    name: '밀당의 아티스트',
    emoji: '🎭',
    memeLine: '읽씹도 전략, 답장도 예술',
    keywords: ['밀당장인', '연애는_심리전', '타이밍의신', '어장아님_전략임'],
    summary:
      '관계의 온도를 조절하는 감각이 타고난 타입입니다. 언제 다가가고 언제 물러설지, 언제 답장하고 언제 뜸 들일지를 본능적으로 아는 사람. 그 미묘한 긴장감이 상대를 계속 궁금하게 만듭니다. 연애를 게임처럼 즐기는 게 아니라, 관계의 리듬을 아는 것뿐입니다.',
    loveStyle:
      '호감이 있어도 전부를 보여주지 않습니다. 오늘 재밌게 놀았어도 내일 연락은 저녁에. 그 완급 조절이 상대의 마음을 끌어당기는 원동력입니다. 다만 진심을 보여야 할 결정적 순간에도 습관처럼 밀당을 하다가, 정작 확신을 원하는 상대를 놓치는 것이 최대 리스크입니다.',
    marriageOutlook:
      '결혼 앞에서는 밀당이 통하지 않는다는 걸 스스로도 알고 있습니다. 진짜 인연을 만나면 서서히 패를 내려놓고 정공법으로 전환하는 유형. 결혼 후에는 그 긴장 조절 능력이 권태기 방어 스킬로 진화합니다 — 10년 차에도 서로를 궁금해하는 부부가 됩니다.',
    strengths: ['상대를 계속 궁금하게 만드는 매력', '관계의 온도를 읽는 감각', '쉽게 지루해지지 않는 연애'],
    watchouts: ['결정적 순간의 밀당은 인연을 끊는 가위가 됩니다', '전략이 길어지면 진심의 타이밍을 놓쳐요'],
    tips: [
      '밀당은 에피타이저까지만. 메인 요리는 진심으로 내세요',
      '상대가 지쳐 보이면 즉시 당기세요. 그 타이밍만은 계산하지 마세요',
      '"나 사실 너 좋아해"를 이길 전략은 없습니다',
    ],
    bestMatch: '자유로운 불꽃형',
    hardMatch: '직진 로맨티스트',
  },
  'mid-stability': {
    name: '신중한 온기형',
    emoji: '🕯️',
    memeLine: '슬로우쿠커처럼 서서히 끓는 중',
    keywords: ['느리지만_확실하게', '곰탕같은사랑', '진국인증', '천천히_뜨거워짐'],
    summary:
      '겉은 차분하지만 속은 누구보다 따뜻한 타입입니다. 마음을 여는 데 시간이 걸리지만, 한번 열리면 그 온기가 쉽게 식지 않습니다. 곰탕처럼 오래 우려낼수록 깊어지는 사람 — 당신의 진가를 아는 사람만이 그 온기를 누릴 수 있습니다.',
    loveStyle:
      '호감이 있어도 티가 잘 나지 않아 상대가 눈치채지 못하는 경우가 많습니다. 하지만 일단 연애가 시작되면 반전 매력이 폭발합니다 — 기억력 좋은 세심함, 위기에서 빛나는 침착함, 변하지 않는 한결같음. 문제는 시작까지의 진입장벽입니다.',
    marriageOutlook:
      '결혼을 가볍게 생각하지 않기에 신중하지만, 그만큼 결혼 후 만족도는 12유형 중 최상위권입니다. 배우자의 변화를 가장 먼저 알아채고, 말없이 필요한 것을 채워주는 사람. "결혼 잘했다"는 말을 배우자 입에서 가장 자주 듣게 될 유형입니다.',
    strengths: ['깊어질수록 빛나는 진심', '위기에서 드러나는 침착함과 세심함', '쉽게 변하지 않는 한결같음'],
    watchouts: ['마음의 문이 너무 늦게 열리면 기회 자체가 사라져요', '침묵이 길어지면 상대는 거절로 오해해요'],
    tips: [
      '호감의 30%만 미리 보여주세요. 상대에게는 그게 유일한 신호입니다',
      '"천천히"와 "멈춤"은 다릅니다. 느려도 계속 움직이세요',
      '상대의 빠른 속도를 가벼움으로 단정하지 마세요. 스타일 차이일 뿐입니다',
    ],
    bestMatch: '직진 로맨티스트',
    hardMatch: '썸 전문가',
  },
  'mid-independence': {
    name: '거리조절 마스터',
    emoji: '📏',
    memeLine: '가까이 오면 한 발, 멀어지면 반 발',
    keywords: ['거리의미학', '고슴도치딜레마', '혼자도_둘도_좋아', '적정온도유지'],
    summary:
      '너무 가깝지도, 너무 멀지도 않은 최적의 거리를 아는 타입입니다. 연애를 원하지만 나를 잃는 연애는 사절. 함께여서 좋고 혼자여도 괜찮은, 균형 잡힌 관계관의 소유자입니다. 상대에게 기대지 않는 단단함이 오히려 매력으로 작동하는 사람입니다.',
    loveStyle:
      '연애 중에도 자신의 루틴과 세계를 지킵니다. 상대의 취미를 존중하고 간섭하지 않으며, 그만큼 자신도 존중받기를 원합니다. 부담 주지 않는 편안한 연애가 강점이지만, 애정 확인이 필요한 상대에게는 "우리 사귀는 거 맞아?"라는 질문을 듣게 될 수 있습니다.',
    marriageOutlook:
      '결혼하면 자유가 사라진다는 공식을 거부하는 유형입니다. 각자의 방, 각자의 시간, 각자의 통장을 존중하는 현대적 결혼을 설계합니다. 서로를 소유하지 않으면서도 신뢰로 묶인 관계 — 요즘 시대가 원하는 결혼의 모범 답안이 될 수 있습니다.',
    strengths: ['상대를 숨 막히게 하지 않는 여유', '자기 관리에서 나오는 단단한 매력', '갈등을 키우지 않는 거리감각'],
    watchouts: ['적정 거리가 상대에겐 미지근함으로 느껴질 수 있어요', '한 발 물러서는 습관이 결정적 순간에도 나올 수 있어요'],
    tips: [
      '일주일에 한 번은 먼저 거리를 좁혀보세요. 균형은 번갈아 잡는 겁니다',
      '"괜찮아"가 아니라 "보고 싶어"라고 말하는 연습을 해보세요',
      '경계선을 지키되, 그 선 위에서 손은 잡아주세요',
    ],
    bestMatch: '츤데레 순정파',
    hardMatch: '초고속 골인형',
  },
  'low-expression': {
    name: '자유로운 불꽃형',
    emoji: '🔥',
    memeLine: '결혼? 아직은 내 인생이 더 재밌음',
    keywords: ['내인생이_메인디쉬', '자유영혼', '불꽃주의보', '묶이면_도망감'],
    summary:
      '지금은 사랑보다 나의 세계가 우선인 타입입니다. 하고 싶은 것도, 이루고 싶은 것도 많아서 연애가 인생의 1순위가 아닐 뿐 — 매력이 없어서가 결코 아닙니다. 오히려 자기 인생을 재밌게 사는 사람 특유의 에너지가 사람을 끌어당깁니다.',
    loveStyle:
      '밀당의 고수라는 오해를 받지만, 사실은 밀당이 아니라 진짜 바쁜 겁니다. 연애를 해도 자신의 리듬을 잃지 않으며, 상대에게도 각자의 삶을 존중하자고 말합니다. 소유하려 들지 않는 쿨함이 매력이지만, 안정형 상대에게는 불안을 줄 수 있습니다.',
    marriageOutlook:
      '지금의 결혼 확률이 낮은 건 능력이 아니라 우선순위의 문제입니다. 자신의 세계를 존중해주는 파트너를 만나면 생각이 달라집니다. "부부이자 각자"로 사는 신개념 결혼 생활을 개척하는 유형 — 오히려 요즘 시대와 잘 맞습니다.',
    strengths: ['어디로 튈지 모르는 매력', '자기 인생을 사는 사람의 건강한 에너지', '상대를 소유하려 하지 않는 쿨함'],
    watchouts: ['"바쁨"이 반복되면 상대에게는 거절의 신호로 읽혀요', '자유와 방치는 한 끗 차이입니다'],
    tips: [
      '일주일에 단 하루라도 상대를 1순위에 놓는 날을 만들어보세요',
      '자유를 지키고 싶다면, 그만큼 안심을 선물하세요',
      '"나중에 여유되면 연애해야지"의 나중은 오지 않습니다',
    ],
    bestMatch: '밀당의 아티스트',
    hardMatch: '따뜻한 계획형',
  },
  'low-pace': {
    name: '썸 전문가',
    emoji: '🎢',
    memeLine: '설렘 구간만 무한 환승 중',
    keywords: ['썸신', '시작이_제일_재밌어', '환승의달인', '롤러코스터만_탐'],
    summary:
      '연애의 예고편, 그 아슬아슬한 설렘 구간을 사랑하는 타입입니다. 눈빛이 오가고, 답장 시간에 의미를 부여하고, "우리 무슨 사이지?"를 고민하는 그 순간이 본편보다 재밌는 사람. 시작 전문가지만 정착은 아직 미정 — 롤러코스터에서 내리는 법을 배우는 중입니다.',
    loveStyle:
      '썸의 공기를 만드는 데는 12유형 중 최고 수준입니다. 미묘한 호감의 신호를 주고받는 게임에서 지는 법이 없습니다. 문제는 관계가 확정되는 순간 흥미가 급감한다는 것. "잡은 물고기" 이론이 아니라, 확정이 주는 무게가 아직 낯선 것뿐입니다.',
    marriageOutlook:
      '결혼은 멀게 느껴지지만, 사실 당신에게 필요한 건 설렘이 유지되는 관계일 뿐입니다. 매일이 썸 같은 연애를 만들어주는 상대를 만나면 이야기가 달라집니다. 결혼 후에는 그 감각으로 부부 사이의 긴장과 재미를 유지하는 로맨스 담당이 됩니다.',
    strengths: ['상대를 설레게 하는 타고난 감각', '관계 초반의 압도적인 매력', '분위기를 읽고 만드는 능력'],
    watchouts: ['설렘 중독은 진짜 사랑의 문턱에서 발목을 잡아요', '환승이 반복되면 남는 건 피로뿐입니다'],
    tips: [
      '설렘의 끝은 권태가 아니라 편안함입니다. 한 번은 그 구간을 지나보세요',
      '"확정"을 두려워하지 마세요. 썸의 기술은 연애에서도 쓸 수 있습니다',
      '이번에 만나는 사람과는 3개월만 더 가보세요. 본편이 시작됩니다',
    ],
    bestMatch: '설레는 탐색가',
    hardMatch: '신중한 온기형',
  },
  'low-stability': {
    name: '완벽주의 대기만성형',
    emoji: '⏳',
    memeLine: '준비가 끝나야 사랑도 시작이지',
    keywords: ['준비완료후_출발', '완벽주의연애', '대기만성', '내기준이_높은편'],
    summary:
      '"지금은 때가 아니다"를 스스로에게 말하는 타입입니다. 커리어, 재정, 자기 성장 — 모든 조건이 갖춰진 뒤에 제대로 된 사랑을 하겠다는 계획형 완벽주의자. 연애를 못 하는 게 아니라 미루고 있는 것이며, 그 기준의 높이가 곧 당신이 관계를 얼마나 진지하게 여기는지의 증거입니다.',
    loveStyle:
      '어설픈 관계를 시작하느니 혼자를 택하는 사람입니다. 마음에 드는 사람이 나타나도 "내가 아직 부족한데"라며 물러서는 것이 최대 특징. 하지만 일단 시작한 연애에서는 준비된 사람 특유의 성숙함과 책임감이 빛납니다. 상대를 실망시키는 일이 거의 없는 견고한 파트너입니다.',
    marriageOutlook:
      '결혼 확률이 낮게 나온 건 의지가 아니라 "아직"이라는 단서 때문입니다. 준비가 갖춰지는 순간 12유형 중 가장 안정적인 결혼 생활을 만들 재목입니다. 다만 완벽한 준비란 존재하지 않는다는 것 — 그걸 인정하는 순간이 당신의 결혼 원년이 됩니다.',
    strengths: ['관계에 대한 진지한 책임감', '준비된 사람의 성숙함', '쉽게 흔들리지 않는 자기 기준'],
    watchouts: ['"완벽한 때"를 기다리다 좋은 사람을 그냥 보낼 수 있어요', '높은 기준이 상대에 대한 채점표가 되지 않게 주의하세요'],
    tips: [
      '사랑은 준비된 사람이 아니라 시작한 사람의 것입니다',
      '부족한 채로 만나서 함께 채워가는 것도 계획의 일부로 넣어보세요',
      '스스로에게 관대해지는 만큼 인연의 문도 넓어집니다',
    ],
    bestMatch: '초고속 골인형',
    hardMatch: '자유로운 불꽃형',
  },
  'low-independence': {
    name: '느긋한 마이웨이형',
    emoji: '🐢',
    memeLine: '인연은 오는 것, 쫓는 것 아님',
    keywords: ['거북이전략', '조급함제로', '올사람은온다', '마이페이스'],
    summary:
      '서두를 이유가 전혀 없는 타입입니다. 남들이 연애 못 해서 안달일 때도 흔들리지 않는 단단한 페이스의 소유자. "때가 되면 만나겠지"라는 태도는 무심함이 아니라 자신에 대한 깊은 믿음에서 나오는 여유입니다.',
    loveStyle:
      '먼저 다가가는 일은 거의 없지만, 다가온 인연을 밀어내지도 않습니다. 함께 있어도 편하고 혼자 있어도 편한, 부담 제로의 연애를 합니다. 상대를 바꾸려 하지 않는 관대함이 최고의 장점. 다만 이벤트를 기대하는 상대에게는 아쉬움을 남길 수 있습니다.',
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

// 카피 검수용 전체 유형 목록 (key = 확률구간-주도축)
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

// 동점 시 우선순위 — 표현 > 속도 > 안정 > 독립
const DOMINANT_ORDER: AxisKey[] = ['expression', 'pace', 'stability', 'independence']

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
  const dominant = DOMINANT_ORDER.reduce((best, axis) =>
    axes[axis] > axes[best] ? axis : best,
  )

  const type = RESULT_TYPES[`${band}-${dominant}`]

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
