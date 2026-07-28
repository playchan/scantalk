// "내가 결혼할 확률은?" 검사 도메인 로직 (docs/10-v2-mvp-spec.md 5번)
// 서버/클라이언트 공용 순수 함수 — AI 호출 없음, 규칙 기반 계산.
// 응답 전체(answers)와 4축(axes)은 라운드 2에서 AI봇 성향 프로필 재료로 재사용된다.
// category별 용도: personality/situation → 성향 축, profile/preference → 봇 프로필·매칭 조건.
// 성별(gender)에 따라 일부 문항이 다르게 출제된다 (genderOnly).

export const QUIZ_SLUG = 'marriage'

export type Gender = 'male' | 'female'

export const GENDER_KEY = 'gender'

export const GENDER_LABELS: Record<Gender, string> = {
  male: '남성',
  female: '여성',
}

export type AxisKey = 'expression' | 'pace' | 'independence' | 'stability' | 'intimacy'

export const AXIS_LABELS: Record<AxisKey, string> = {
  expression: '표현력',
  pace: '추진력',
  intimacy: '친밀함',
  stability: '안정감',
  independence: '독립성',
}

export type QuestionCategory = 'profile' | 'personality' | 'preference' | 'situation'

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  profile: '프로필',
  personality: '성격·가치관',
  preference: '취향·이상형',
  situation: '상황 반응',
}

export interface QuizOption {
  id: string
  label: string
  axis: AxisKey
  /** 해당 축 점수 (0~3) — profile/preference는 0~1로 축 영향 최소화 */
  score: number
  /** 결혼 확률 기여 (-2~+3) */
  p: number
}

export interface QuizQuestion {
  id: string
  title: string
  category: QuestionCategory
  /** 지정 시 해당 성별에게만 출제 */
  genderOnly?: Gender
  options: QuizOption[]
}

// 문항 72종 정의 (공통 66 + 남성 전용 3 + 여성 전용 3) — 응답 기준 69문항.
// 선택지는 4~5개. 애착 이론·사랑의 언어 등 관계심리학 프레임을 참고해 설계.
// 카피 교체 시 구조(카테고리·성별·축 매핑·p값)는 유지.
export const QUESTIONS: QuizQuestion[] = [
  // ══════ PART 0. 나에 대하여 (프로필) ══════
  {
    id: 'pr1',
    title: '나의 나이대는',
    category: 'profile',
    options: [
      { id: 'pr1a', label: '20대 초반', axis: 'stability', score: 0, p: 0 },
      { id: 'pr1b', label: '20대 후반', axis: 'stability', score: 0, p: 1 },
      { id: 'pr1c', label: '30대 초·중반', axis: 'stability', score: 0, p: 1 },
      { id: 'pr1d', label: '30대 후반 이상', axis: 'stability', score: 0, p: 1 },
    ],
  },
  {
    id: 'pr2',
    title: '결혼 경력은',
    category: 'profile',
    options: [
      { id: 'pr2a', label: '초혼입니다', axis: 'stability', score: 0, p: 1 },
      { id: 'pr2b', label: '재혼입니다 (이혼 경험)', axis: 'stability', score: 0, p: 1 },
      { id: 'pr2c', label: '사별 후 새로운 시작', axis: 'stability', score: 0, p: 1 },
      { id: 'pr2d', label: '말하고 싶지 않아요', axis: 'stability', score: 0, p: 0 },
    ],
  },
  {
    id: 'pr3',
    title: '나의 직업 분야는',
    category: 'profile',
    options: [
      { id: 'pr3a', label: '회사원 (사무·기술직)', axis: 'stability', score: 0, p: 1 },
      { id: 'pr3b', label: '공무원·공기업·교직', axis: 'stability', score: 0, p: 1 },
      { id: 'pr3c', label: '전문직 (의료·법률·회계 등)', axis: 'stability', score: 0, p: 1 },
      { id: 'pr3d', label: '자영업·사업·프리랜서·기타', axis: 'independence', score: 0, p: 1 },
    ],
  },
  {
    id: 'pr4',
    title: '나의 연수입은',
    category: 'profile',
    options: [
      { id: 'pr4a', label: '3천만 원 미만', axis: 'stability', score: 0, p: 0 },
      { id: 'pr4b', label: '3천~5천만 원', axis: 'stability', score: 0, p: 1 },
      { id: 'pr4c', label: '5천~8천만 원', axis: 'stability', score: 0, p: 1 },
      { id: 'pr4d', label: '8천만 원 이상', axis: 'stability', score: 0, p: 1 },
    ],
  },
  {
    id: 'pr5',
    title: '최종 학력은',
    category: 'profile',
    options: [
      { id: 'pr5a', label: '고등학교 졸업', axis: 'stability', score: 0, p: 0 },
      { id: 'pr5b', label: '전문대 졸업', axis: 'stability', score: 0, p: 0 },
      { id: 'pr5c', label: '4년제 대학 졸업', axis: 'stability', score: 0, p: 0 },
      { id: 'pr5d', label: '대학원 이상', axis: 'stability', score: 0, p: 0 },
    ],
  },
  {
    id: 'pr6',
    title: '종교는',
    category: 'profile',
    options: [
      { id: 'pr6a', label: '무교', axis: 'stability', score: 0, p: 0 },
      { id: 'pr6b', label: '기독교 (개신교·천주교)', axis: 'stability', score: 0, p: 0 },
      { id: 'pr6c', label: '불교', axis: 'stability', score: 0, p: 0 },
      { id: 'pr6d', label: '기타 또는 비공개', axis: 'stability', score: 0, p: 0 },
    ],
  },
  {
    id: 'pr7',
    title: '나의 외모, 스스로 평가하면',
    category: 'profile',
    options: [
      { id: 'pr7a', label: '어디 가서 꿀리지 않는 상위권', axis: 'expression', score: 1, p: 1 },
      { id: 'pr7b', label: '호감형이라는 말을 자주 듣는다', axis: 'stability', score: 0, p: 1 },
      { id: 'pr7c', label: '꾸미면 꽤 괜찮은 편', axis: 'pace', score: 0, p: 1 },
      { id: 'pr7d', label: '외모보다 매력과 분위기로 승부', axis: 'independence', score: 0, p: 1 },
    ],
  },
  {
    id: 'pr8',
    title: '지금까지의 연애 경험은',
    category: 'profile',
    options: [
      { id: 'pr8a', label: '아직 없다 (모태솔로)', axis: 'stability', score: 0, p: -1 },
      { id: 'pr8b', label: '1~2번', axis: 'stability', score: 0, p: 1 },
      { id: 'pr8c', label: '3~5번', axis: 'stability', score: 0, p: 1 },
      { id: 'pr8d', label: '다 세지도 못한다', axis: 'stability', score: 0, p: 0 },
    ],
  },
  {
    id: 'pr9',
    title: '요즘 나의 연애 상태는',
    category: 'profile',
    options: [
      { id: 'pr9a', label: '썸 진행 중 (그래서 이 테스트를…)', axis: 'expression', score: 1, p: 3 },
      { id: 'pr9b', label: '소개팅·모임 등 활발하게 만나는 중', axis: 'pace', score: 1, p: 2 },
      { id: 'pr9c', label: '공백기. 올해는 뭔가 있겠지', axis: 'stability', score: 0, p: 0 },
      { id: 'pr9d', label: '연애 생각이 별로 없다', axis: 'independence', score: 1, p: -2 },
    ],
  },

  // ── 성별 전용 프로필 ──
  {
    id: 'gm1',
    title: '나의 키는',
    category: 'profile',
    genderOnly: 'male',
    options: [
      { id: 'gm1a', label: '170cm 미만', axis: 'stability', score: 0, p: 0 },
      { id: 'gm1b', label: '170~175cm', axis: 'stability', score: 0, p: 0 },
      { id: 'gm1c', label: '176~183cm', axis: 'stability', score: 0, p: 1 },
      { id: 'gm1d', label: '184cm 이상', axis: 'stability', score: 0, p: 1 },
    ],
  },
  {
    id: 'gm2',
    title: '장남 여부와 집안 제사는',
    category: 'profile',
    genderOnly: 'male',
    options: [
      { id: 'gm2a', label: '장남이고, 제사도 지낸다', axis: 'stability', score: 1, p: 0 },
      { id: 'gm2b', label: '장남이지만 제사는 없다', axis: 'stability', score: 0, p: 1 },
      { id: 'gm2c', label: '장남은 아니고, 집안 제사는 있다', axis: 'stability', score: 0, p: 1 },
      { id: 'gm2d', label: '둘 다 해당 없음', axis: 'independence', score: 0, p: 1 },
    ],
  },
  {
    id: 'gm3',
    title: '여자 형제(누나·여동생)는',
    category: 'profile',
    genderOnly: 'male',
    options: [
      { id: 'gm3a', label: '없다', axis: 'stability', score: 0, p: 0 },
      { id: 'gm3b', label: '한 명 있다', axis: 'stability', score: 0, p: 1 },
      { id: 'gm3c', label: '두 명 이상 있다', axis: 'stability', score: 0, p: 1 },
      { id: 'gm3d', label: '형제 없이 외동이다', axis: 'independence', score: 0, p: 0 },
    ],
  },
  {
    id: 'gf1',
    title: '나의 키는',
    category: 'profile',
    genderOnly: 'female',
    options: [
      { id: 'gf1a', label: '155cm 미만', axis: 'stability', score: 0, p: 0 },
      { id: 'gf1b', label: '155~162cm', axis: 'stability', score: 0, p: 0 },
      { id: 'gf1c', label: '163~168cm', axis: 'stability', score: 0, p: 1 },
      { id: 'gf1d', label: '169cm 이상', axis: 'stability', score: 0, p: 1 },
    ],
  },
  {
    id: 'gf2',
    title: '집안에서 나의 위치는',
    category: 'profile',
    genderOnly: 'female',
    options: [
      { id: 'gf2a', label: '맏딸 — 책임감이 몸에 배어 있다', axis: 'stability', score: 1, p: 1 },
      { id: 'gf2b', label: '막내 — 사랑받는 게 익숙하다', axis: 'expression', score: 1, p: 1 },
      { id: 'gf2c', label: '중간 — 눈치와 중재의 달인', axis: 'pace', score: 1, p: 1 },
      { id: 'gf2d', label: '외동 — 독립심이 강하다', axis: 'independence', score: 1, p: 0 },
    ],
  },
  {
    id: 'gf3',
    title: '결혼 후 커리어에 대한 나의 생각은',
    category: 'profile',
    genderOnly: 'female',
    options: [
      { id: 'gf3a', label: '커리어는 계속. 맞벌이가 당연하다', axis: 'independence', score: 1, p: 1 },
      { id: 'gf3b', label: '일과 가정 모두 병행할 자신 있다', axis: 'stability', score: 1, p: 1 },
      { id: 'gf3c', label: '상황이 되면 가정에 집중해도 좋다', axis: 'stability', score: 0, p: 1 },
      { id: 'gf3d', label: '아직 구체적으로 생각해보지 않았다', axis: 'pace', score: 0, p: 0 },
    ],
  },

  // ══════ PART 1. 설렘의 시작 ══════
  {
    id: 's1',
    title: '마음에 드는 사람이 생기면 나는',
    category: 'personality',
    options: [
      { id: 's1a', label: '먼저 연락하고 대놓고 티를 낸다', axis: 'expression', score: 3, p: 3 },
      { id: 's1b', label: '자연스럽게 마주칠 자리를 만든다', axis: 'pace', score: 2, p: 2 },
      { id: 's1c', label: '상대가 다가올 때까지 신호만 보낸다', axis: 'stability', score: 2, p: 0 },
      { id: 's1d', label: '혼자 마음을 정리하다 타이밍을 놓친다', axis: 'independence', score: 3, p: -2 },
      { id: 's1e', label: '일단 SNS부터 정독한다 (조용한 탐색전)', axis: 'intimacy', score: 1, p: 0 },
    ],
  },
  {
    id: 's2',
    title: '소개팅 자리, 첫인상이 괜찮다면',
    category: 'personality',
    options: [
      { id: 's2a', label: '그 자리에서 다음 약속을 잡는다', axis: 'pace', score: 3, p: 3 },
      { id: 's2b', label: '헤어지고 30분 안에 잘 들어갔냐고 연락한다', axis: 'expression', score: 3, p: 2 },
      { id: 's2c', label: '이틀 정도 두고 보다가 연락한다', axis: 'stability', score: 2, p: 1 },
      { id: 's2d', label: '상대 연락을 기다린다. 오면 인연이지', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 's3',
    title: '썸 타는 상대의 연락 빈도, 나의 이상은',
    category: 'personality',
    options: [
      { id: 's3a', label: '틈날 때마다. 일상 공유가 곧 애정', axis: 'expression', score: 3, p: 2 },
      { id: 's3b', label: '아침·점심·저녁 리듬 있게', axis: 'stability', score: 3, p: 3 },
      { id: 's3c', label: '하루 한두 번, 밀도 있는 대화면 충분', axis: 'independence', score: 2, p: 1 },
      { id: 's3d', label: '연락은 필요할 때만. 각자 삶이 우선', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 's4',
    title: '상대가 보낸 메시지에 "ㅋㅋ" 하나만 왔다',
    category: 'situation',
    options: [
      { id: 's4a', label: '"뭐가 웃긴데~" 하고 바로 되받아친다', axis: 'expression', score: 3, p: 2 },
      { id: 's4b', label: '대화 주제를 바꿔 자연스럽게 이어간다', axis: 'pace', score: 2, p: 2 },
      { id: 's4c', label: '바쁜가 보다 하고 잠시 둔다', axis: 'stability', score: 2, p: 1 },
      { id: 's4d', label: '나도 "ㅋㅋ"로 응수한다. 밀당 시작', axis: 'independence', score: 2, p: -1 },
    ],
  },

  // ══════ PART 2. 관계의 속도 ══════
  {
    id: 't1',
    title: '썸 기간은 어느 정도가 적당할까',
    category: 'personality',
    options: [
      { id: 't1a', label: '2주면 충분. 마음 확인했으면 직진', axis: 'pace', score: 3, p: 3 },
      { id: 't1b', label: '한두 달은 서로 알아가야지', axis: 'stability', score: 2, p: 2 },
      { id: 't1c', label: '기간보다 확신이 중요하다', axis: 'stability', score: 3, p: 1 },
      { id: 't1d', label: '썸 자체가 제일 재밌는 구간인데 왜 끝내', axis: 'independence', score: 2, p: -1 },
      { id: 't1e', label: '썸이 뭔가요? 저는 항상 바로 사귀던데', axis: 'expression', score: 1, p: 1 },
    ],
  },
  {
    id: 't2',
    title: '고백은 누가 해야 할까',
    category: 'personality',
    options: [
      { id: 't2a', label: '내가 한다. 기다리는 시간이 아깝다', axis: 'expression', score: 3, p: 3 },
      { id: 't2b', label: '분위기를 만들어서 상대가 하게 한다', axis: 'pace', score: 2, p: 2 },
      { id: 't2c', label: '확신이 들 때까지는 서로 아껴둔다', axis: 'stability', score: 2, p: 1 },
      { id: 't2d', label: '고백 없이 자연스럽게 되는 게 이상적', axis: 'independence', score: 2, p: 0 },
    ],
  },
  {
    id: 't3',
    title: '부모님께 연인을 소개하는 시점은',
    category: 'personality',
    options: [
      { id: 't3a', label: '확신이 들면 빠를수록 좋다', axis: 'pace', score: 3, p: 3 },
      { id: 't3b', label: '1년쯤 만나보고 나서', axis: 'stability', score: 2, p: 2 },
      { id: 't3c', label: '결혼 얘기가 나올 때쯤', axis: 'stability', score: 1, p: 1 },
      { id: 't3d', label: '소개할 필요가 있나 싶다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 't4',
    title: '연인의 친구 모임에 초대받았다',
    category: 'situation',
    options: [
      { id: 't4a', label: '좋아! 먼저 나서서 친해진다', axis: 'expression', score: 3, p: 2 },
      { id: 't4b', label: '가긴 가는데 긴장은 된다', axis: 'stability', score: 2, p: 2 },
      { id: 't4c', label: '몇 번 더 만난 뒤에 가고 싶다', axis: 'pace', score: 1, p: 1 },
      { id: 't4d', label: '커플은 커플, 친구는 친구 아닌가', axis: 'independence', score: 3, p: -1 },
    ],
  },

  // ══════ PART 3. 일상과 생활 습관 ══════
  {
    id: 'h1',
    title: '주말에 가장 하고 싶은 것은',
    category: 'personality',
    options: [
      { id: 'h1a', label: '좋아하는 사람과 데이트', axis: 'expression', score: 2, p: 3 },
      { id: 'h1b', label: '친구들과 왁자지껄 모임', axis: 'pace', score: 2, p: 1 },
      { id: 'h1c', label: '운동이나 자기계발로 나를 채우기', axis: 'stability', score: 2, p: 1 },
      { id: 'h1d', label: '집에서 완벽한 혼자만의 휴식', axis: 'independence', score: 3, p: -1 },
      { id: 'h1e', label: '침대와 물아일체. 주말은 신성한 충전일', axis: 'independence', score: 1, p: 0 },
    ],
  },
  {
    id: 'h2',
    title: '데이트 계획을 세울 때 나는',
    category: 'personality',
    options: [
      { id: 'h2a', label: '맛집 예약까지 코스를 다 짜둔다', axis: 'stability', score: 3, p: 2 },
      { id: 'h2b', label: '큰 틀만 정하고 흐름에 맡긴다', axis: 'pace', score: 2, p: 2 },
      { id: 'h2c', label: '즉흥이 제일 재밌다. 발길 닿는 대로', axis: 'expression', score: 2, p: 1 },
      { id: 'h2d', label: '상대가 정해주면 따라가는 편', axis: 'independence', score: 1, p: 0 },
    ],
  },
  {
    id: 'h3',
    title: '연인과 여행을 간다면 나의 역할은',
    category: 'personality',
    options: [
      { id: 'h3a', label: '총무 겸 가이드. 엑셀 일정표까지 만든다', axis: 'stability', score: 3, p: 3 },
      { id: 'h3b', label: '분위기 메이커. 사진과 리액션 담당', axis: 'expression', score: 3, p: 2 },
      { id: 'h3c', label: '흘러가는 대로. 길을 잃어도 그게 추억', axis: 'pace', score: 2, p: 1 },
      { id: 'h3d', label: '각자 보고 싶은 걸 보고 저녁에 만나자', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'h4',
    title: '혼자만의 시간, 나에게는',
    category: 'personality',
    options: [
      { id: 'h4a', label: '없어도 그만. 함께가 더 좋다', axis: 'expression', score: 2, p: 2 },
      { id: 'h4b', label: '일주일에 하루 정도는 필요하다', axis: 'stability', score: 2, p: 2 },
      { id: 'h4c', label: '연애 중에도 반드시 지켜야 하는 성역', axis: 'independence', score: 3, p: 0 },
      { id: 'h4d', label: '사실 혼자가 제일 편하다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'h5',
    title: '요즘 뜨거운 "부부 각방" 논쟁, 나의 입장은',
    category: 'personality',
    options: [
      { id: 'h5a', label: '무슨 소리, 한 침대가 국룰이다', axis: 'expression', score: 2, p: 2 },
      { id: 'h5b', label: '평소엔 같이, 코골이 심한 날만 임시 각방', axis: 'stability', score: 2, p: 2 },
      { id: 'h5c', label: '수면의 질이 부부의 질. 각방 찬성', axis: 'independence', score: 2, p: 0 },
      { id: 'h5d', label: '침대는 같이, 이불은 각자 (이게 진리)', axis: 'stability', score: 1, p: 1 },
      { id: 'h5e', label: '각방이 아니라 각집도 가능 (주말부부 로망)', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'h6',
    title: '정리정돈, 나의 스타일은',
    category: 'personality',
    options: [
      { id: 'h6a', label: '물건은 제자리에. 어질러지면 불편하다', axis: 'stability', score: 3, p: 1 },
      { id: 'h6b', label: '주기적으로 몰아서 대청소', axis: 'pace', score: 1, p: 1 },
      { id: 'h6c', label: '적당히 어질러져 있어야 사람 사는 집', axis: 'expression', score: 1, p: 0 },
      { id: 'h6d', label: '내 물건은 내 방식대로. 남이 만지는 건 싫다', axis: 'independence', score: 2, p: -1 },
    ],
  },

  // ══════ PART 4. 갈등과 화해 ══════
  {
    id: 'c1',
    title: '갈등이 생겼을 때 나는',
    category: 'personality',
    options: [
      { id: 'c1a', label: '바로 대화로 풀어야 잠이 온다', axis: 'expression', score: 3, p: 3 },
      { id: 'c1b', label: '하루 정도 정리하고 차분히 말한다', axis: 'stability', score: 3, p: 3 },
      { id: 'c1c', label: '시간이 해결해줄 때까지 둔다 (동굴형)', axis: 'independence', score: 2, p: -1 },
      { id: 'c1d', label: '먼저 사과받기 전엔 말 안 한다', axis: 'pace', score: 1, p: -2 },
      { id: 'c1e', label: '일단 개그로 분위기 풀고 본론은 나중에', axis: 'intimacy', score: 1, p: 1 },
    ],
  },
  {
    id: 'c2',
    title: '연인이 힘들어 보일 때 나는',
    category: 'personality',
    options: [
      { id: 'c2a', label: '무슨 일인지 바로 물어본다', axis: 'expression', score: 3, p: 2 },
      { id: 'c2b', label: '말할 때까지 곁에서 기다린다', axis: 'stability', score: 3, p: 3 },
      { id: 'c2c', label: '맛있는 걸 사들고 간다', axis: 'pace', score: 2, p: 2 },
      { id: 'c2d', label: '혼자 시간이 필요할 테니 둔다', axis: 'independence', score: 3, p: 0 },
    ],
  },
  {
    id: 'c3',
    title: '서운한 게 생겼을 때 나는',
    category: 'personality',
    options: [
      { id: 'c3a', label: '그 자리에서 말한다. 쌓아두면 병 된다', axis: 'expression', score: 3, p: 3 },
      { id: 'c3b', label: '적당한 타이밍을 골라 부드럽게 꺼낸다', axis: 'stability', score: 3, p: 2 },
      { id: 'c3c', label: '세 번까지는 참는다. 네 번째에 폭발', axis: 'pace', score: 1, p: 0 },
      { id: 'c3d', label: '말 안 한다. 대신 마음의 문이 닫힌다', axis: 'independence', score: 2, p: -2 },
    ],
  },
  {
    id: 'c4',
    title: '연인과 의견이 완전히 다를 때',
    category: 'personality',
    options: [
      { id: 'c4a', label: '끝장 토론. 서로를 이해할 때까지', axis: 'expression', score: 2, p: 2 },
      { id: 'c4b', label: '반반 양보해서 중간 지점을 찾는다', axis: 'stability', score: 3, p: 3 },
      { id: 'c4c', label: '중요한 문제 아니면 상대에게 맞춘다', axis: 'pace', score: 2, p: 1 },
      { id: 'c4d', label: '각자 방식대로 하면 된다. 강요 금지', axis: 'independence', score: 3, p: 0 },
    ],
  },
  {
    id: 'c5',
    title: '싸운 뒤 화해는 어떻게 하는 편인가',
    category: 'personality',
    options: [
      { id: 'c5a', label: '잘못했으면 먼저 사과한다. 자존심보다 관계', axis: 'expression', score: 3, p: 3 },
      { id: 'c5b', label: '맛있는 걸 먹자며 화해의 자리를 만든다', axis: 'stability', score: 2, p: 3 },
      { id: 'c5c', label: '시간이 지나면 자연스럽게 풀린 척한다', axis: 'independence', score: 2, p: 0 },
      { id: 'c5d', label: '상대가 풀어줄 때까지 기다린다', axis: 'pace', score: 1, p: -2 },
    ],
  },
  {
    id: 'c6',
    title: '연인이 속상해서 다소 비논리적으로 화를 낸다. 나는',
    category: 'situation',
    options: [
      { id: 'c6a', label: '"많이 속상했구나" 감정부터 안아준다', axis: 'stability', score: 3, p: 3 },
      { id: 'c6b', label: '일단 꼭 안아주고 나중에 차분히 대화한다', axis: 'expression', score: 3, p: 2 },
      { id: 'c6c', label: '사실관계부터 짚는다. 오해는 바로잡아야지', axis: 'pace', score: 1, p: -1 },
      { id: 'c6d', label: '진정될 때까지 거리를 둔다', axis: 'independence', score: 2, p: 0 },
    ],
  },

  // ══════ PART 5. 돈과 가치관 ══════
  {
    id: 'e1',
    title: '월급을 받으면 나는',
    category: 'personality',
    options: [
      { id: 'e1a', label: '저축·투자 비율이 정해져 있다', axis: 'stability', score: 3, p: 3 },
      { id: 'e1b', label: '쓸 건 쓰고 남으면 모은다', axis: 'pace', score: 2, p: 1 },
      { id: 'e1c', label: '경험에 쓰는 게 남는 것', axis: 'expression', score: 2, p: 0 },
      { id: 'e1d', label: '통장 잔고를 잘 안 본다', axis: 'independence', score: 2, p: -2 },
      { id: 'e1e', label: '월급은 통장을 스칠 뿐… (텅장 인증)', axis: 'pace', score: 1, p: -1 },
    ],
  },
  {
    id: 'e2',
    title: '빚(대출)에 대한 나의 생각은',
    category: 'personality',
    options: [
      { id: 'e2a', label: '집·투자를 위한 전략적 대출은 필수', axis: 'pace', score: 2, p: 2 },
      { id: 'e2b', label: '할부도 싫다. 무조건 무(無)빚주의', axis: 'stability', score: 3, p: 1 },
      { id: 'e2c', label: '쓸 땐 쓰고 성실히 갚으면 된다', axis: 'expression', score: 1, p: 1 },
      { id: 'e2d', label: '깊게 생각해본 적 없다', axis: 'independence', score: 1, p: -1 },
    ],
  },
  {
    id: 'e3',
    title: '지금 나의 저축 목표는',
    category: 'personality',
    options: [
      { id: 'e3a', label: '내 집 마련·결혼 자금 등 목표가 명확하다', axis: 'stability', score: 3, p: 3 },
      { id: 'e3b', label: '일단 모으는 중. 목표는 차차', axis: 'pace', score: 1, p: 1 },
      { id: 'e3c', label: '여행·배움 등 경험 자금이 우선', axis: 'expression', score: 1, p: 0 },
      { id: 'e3d', label: '저축보다 현재의 행복', axis: 'independence', score: 1, p: -1 },
    ],
  },
  {
    id: 'e4',
    title: '"사랑이 밥 먹여주냐"는 말에 나는',
    category: 'personality',
    options: [
      { id: 'e4a', label: '사랑이 있어야 밥도 맛있다', axis: 'expression', score: 3, p: 3 },
      { id: 'e4b', label: '사랑과 현실, 둘 다 챙겨야 한다', axis: 'stability', score: 3, p: 2 },
      { id: 'e4c', label: '맞는 말. 현실이 받쳐줘야 사랑도 있다', axis: 'pace', score: 1, p: 1 },
      { id: 'e4d', label: '밥은 내가 벌어서 먹으면 된다', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'm1',
    title: '연인 사이의 "선의의 거짓말"에 대해',
    category: 'personality',
    options: [
      { id: 'm1a', label: '사소한 것도 솔직한 게 원칙', axis: 'expression', score: 2, p: 1 },
      { id: 'm1b', label: '상대를 지키는 거짓말은 배려다', axis: 'stability', score: 2, p: 1 },
      { id: 'm1c', label: '경우에 따라 다르다. 유연하게', axis: 'pace', score: 1, p: 1 },
      { id: 'm1d', label: '들키지 않으면 문제없지 않나', axis: 'independence', score: 1, p: -1 },
    ],
  },
  {
    id: 'm2',
    title: '성공을 위한 약간의 편법, 어디까지 괜찮을까',
    category: 'personality',
    options: [
      { id: 'm2a', label: '원칙주의. 편법은 결국 대가를 치른다', axis: 'stability', score: 3, p: 1 },
      { id: 'm2b', label: '남에게 피해만 없다면 요령은 능력', axis: 'pace', score: 2, p: 1 },
      { id: 'm2c', label: '융통성 있게, 선은 지키면서', axis: 'expression', score: 1, p: 1 },
      { id: 'm2d', label: '각자의 기준이 있는 것', axis: 'independence', score: 1, p: 0 },
    ],
  },
  {
    id: 'e5',
    title: '연인의 가족 행사에 함께 가자는 말, 나의 속마음은',
    category: 'personality',
    options: [
      { id: 'e5a', label: '드디어! 잘 보이고 싶어서 설렌다', axis: 'expression', score: 2, p: 3 },
      { id: 'e5b', label: '관계가 깊어지는 단계구나, 기꺼이', axis: 'stability', score: 3, p: 3 },
      { id: 'e5c', label: '조금 이르지 않나? 부담이 살짝', axis: 'pace', score: 1, p: 0 },
      { id: 'e5d', label: '가족은 가족, 연애는 연애로 두고 싶다', axis: 'independence', score: 3, p: -2 },
    ],
  },
  {
    id: 'e6',
    title: '신혼집 마련, "집은 남자·혼수는 여자" 공식에 대해',
    category: 'personality',
    options: [
      { id: 'e6a', label: '이제 그런 공식은 그만. 둘이 모은 만큼 합친다', axis: 'stability', score: 3, p: 2 },
      { id: 'e6b', label: '형편 되는 쪽이 더 내면 되지, 공식이 왜 필요해', axis: 'expression', score: 2, p: 2 },
      { id: 'e6c', label: '솔직히 관례는 무시 못 한다고 생각한다', axis: 'pace', score: 1, p: 0 },
      { id: 'e6d', label: '부모님 찬스 가능하면 감사히 받는다', axis: 'stability', score: 1, p: 1 },
      { id: 'e6e', label: '집값 얘기 나오는 순간 숨이 막힌다', axis: 'independence', score: 1, p: -1 },
    ],
  },

  // ══════ PART 6. 이상형과 취향 ══════
  {
    id: 'f1',
    title: '선호하는 상대의 나이는',
    category: 'preference',
    options: [
      { id: 'f1a', label: '연상이 좋다', axis: 'stability', score: 0, p: 0 },
      { id: 'f1b', label: '동갑 또는 비슷한 또래', axis: 'stability', score: 0, p: 0 },
      { id: 'f1c', label: '연하가 좋다', axis: 'stability', score: 0, p: 0 },
      { id: 'f1d', label: '사람만 좋으면 나이는 상관없다', axis: 'stability', score: 0, p: 1 },
    ],
  },
  {
    id: 'f2',
    title: '상대에게 가장 끌리는 매력 포인트는',
    category: 'preference',
    options: [
      { id: 'f2a', label: '대화가 잘 통하는 유머 코드', axis: 'expression', score: 0, p: 1 },
      { id: 'f2b', label: '다정하고 세심한 배려', axis: 'stability', score: 0, p: 1 },
      { id: 'f2c', label: '자기 일에 몰입하는 열정', axis: 'independence', score: 0, p: 1 },
      { id: 'f2d', label: '외모·스타일. 일단 눈이 즐거워야', axis: 'pace', score: 0, p: 0 },
    ],
  },
  {
    id: 'f3',
    title: '이상적인 데이트 코스는',
    category: 'preference',
    options: [
      { id: 'f3a', label: '맛집 투어와 카페 수다', axis: 'expression', score: 0, p: 1 },
      { id: 'f3b', label: '집에서 배달시켜 놓고 영화 정주행', axis: 'stability', score: 0, p: 1 },
      { id: 'f3c', label: '등산·러닝·볼링 같은 액티비티', axis: 'pace', score: 0, p: 1 },
      { id: 'f3d', label: '전시·공연 보고 산책하며 대화', axis: 'independence', score: 0, p: 1 },
    ],
  },
  {
    id: 'f4',
    title: '내가 가장 사랑을 느끼는 순간은 (나의 사랑의 언어)',
    category: 'preference',
    options: [
      { id: 'f4a', label: '"보고 싶다", "잘했어" 같은 말 한마디', axis: 'expression', score: 0, p: 1 },
      { id: 'f4b', label: '나를 위해 시간을 내어줄 때', axis: 'stability', score: 0, p: 1 },
      { id: 'f4c', label: '작은 선물과 서프라이즈', axis: 'pace', score: 0, p: 1 },
      { id: 'f4d', label: '손잡기, 포옹 같은 스킨십', axis: 'intimacy', score: 1, p: 1 },
    ],
  },
  {
    id: 'f5',
    title: '상대에게 절대 포기 못 하는 조건 하나를 고른다면',
    category: 'preference',
    options: [
      { id: 'f5a', label: '거짓말하지 않는 정직함', axis: 'stability', score: 0, p: 1 },
      { id: 'f5b', label: '나를 웃게 하는 유머', axis: 'expression', score: 0, p: 1 },
      { id: 'f5c', label: '경제관념과 성실함', axis: 'pace', score: 0, p: 1 },
      { id: 'f5d', label: '나의 시간과 공간에 대한 존중', axis: 'independence', score: 0, p: 0 },
    ],
  },
  {
    id: 'f6',
    title: '운동·취미·자기계발, 연인과는',
    category: 'preference',
    options: [
      { id: 'f6a', label: '무조건 함께. 같이 성장하는 게 로망', axis: 'expression', score: 1, p: 3 },
      { id: 'f6b', label: '몇 개는 같이, 몇 개는 각자', axis: 'stability', score: 1, p: 2 },
      { id: 'f6c', label: '각자 하되 서로 응원해주면 충분', axis: 'independence', score: 1, p: 1 },
      { id: 'f6d', label: '취미만큼은 혼자가 편하다', axis: 'independence', score: 1, p: -1 },
    ],
  },

  // ══════ PART 7. 만약에… ══════
  {
    id: 'x1',
    title: '헤어진 애인에게 "잘 지내?" 연락이 왔다',
    category: 'situation',
    options: [
      { id: 'x1a', label: '읽씹. 과거는 과거다', axis: 'independence', score: 2, p: 1 },
      { id: 'x1b', label: '"잘 지내지~" 예의상 답하고 끝', axis: 'stability', score: 2, p: 1 },
      { id: 'x1c', label: '무슨 일인지 궁금해서 대화가 길어진다', axis: 'expression', score: 2, p: 0 },
      { id: 'x1d', label: '혹시…? 하는 마음에 잠이 안 온다', axis: 'pace', score: 1, p: -1 },
      { id: 'x1e', label: '스크린샷 찍어서 단톡방 긴급 소집', axis: 'expression', score: 1, p: 0 },
    ],
  },
  {
    id: 'x2',
    title: '친구가 "너랑 잘 어울릴 사람 있는데 소개해줄까?"',
    category: 'situation',
    options: [
      { id: 'x2a', label: '"언제? 어디서?" 바로 일정부터 잡는다', axis: 'pace', score: 3, p: 3 },
      { id: 'x2b', label: '사진 말고 어떤 사람인지부터 물어본다', axis: 'stability', score: 2, p: 2 },
      { id: 'x2c', label: '"생각해볼게" 하고 일주일째 고민 중', axis: 'independence', score: 2, p: 0 },
      { id: 'x2d', label: '"괜찮아~" 자연스러운 만남을 원한다', axis: 'independence', score: 2, p: -1 },
      { id: 'x2e', label: '"근데 그분도 내 소개 받는 거 알아?" 역검증 모드', axis: 'stability', score: 1, p: 1 },
    ],
  },
  {
    id: 'x3',
    title: '만난 지 3개월, 상대가 커플링 매장 앞에서 걸음을 멈췄다',
    category: 'situation',
    options: [
      { id: 'x3a', label: '설렌다. 슬쩍 손가락 사이즈를 흘린다', axis: 'expression', score: 2, p: 3 },
      { id: 'x3b', label: '기분은 좋지만 아직 이르다고 생각한다', axis: 'stability', score: 2, p: 1 },
      { id: 'x3c', label: '"구경만 하는 거지?" 확인부터 한다', axis: 'pace', score: 1, p: 0 },
      { id: 'x3d', label: '심장이 철렁. 화제를 돌린다', axis: 'independence', score: 2, p: -2 },
    ],
  },

  // ══════ PART 7.5. 마음의 습관 (애착 이론 기반) ══════
  {
    id: 'at1',
    title: '연인의 연락이 하루 종일 뜸하다. 나의 진짜 속마음은',
    category: 'personality',
    options: [
      { id: 'at1a', label: '솔직하게 서운했다고 말한다', axis: 'expression', score: 3, p: 3 },
      { id: 'at1b', label: '바쁜가 보다, 하던 일 계속한다', axis: 'stability', score: 3, p: 2 },
      { id: 'at1c', label: '불안해서 프로필 사진만 세 번 확인', axis: 'intimacy', score: 2, p: 0 },
      { id: 'at1d', label: '나도 똑같이 뜸해진다. 눈에는 눈', axis: 'independence', score: 2, p: -1 },
      { id: 'at1e', label: '연락 없는 김에 나 혼자 더 재밌게 논다', axis: 'pace', score: 1, p: 0 },
    ],
  },
  {
    id: 'at2',
    title: '관계가 깊어질수록 나는 (솔직하게!)',
    category: 'personality',
    options: [
      { id: 'at2a', label: '점점 더 편안하고 안정감을 느낀다', axis: 'stability', score: 3, p: 3 },
      { id: 'at2b', label: '더 잘해주고 싶어서 애가 탄다', axis: 'intimacy', score: 3, p: 2 },
      { id: 'at2c', label: '상대가 떠날까 봐 가끔 불안해진다', axis: 'expression', score: 1, p: 0 },
      { id: 'at2d', label: '문득 혼자 도망가고 싶은 순간이 온다', axis: 'independence', score: 2, p: -2 },
      { id: 'at2e', label: '깊어진다는 게 뭔지 아직 잘 모르겠다', axis: 'pace', score: 1, p: -1 },
    ],
  },

  // ══════ PART 7.7. 케미와 친밀함 ══════
  {
    id: 'ch1',
    title: '연애에서 스킨십 진도, 나의 스타일은',
    category: 'personality',
    options: [
      { id: 'ch1a', label: '마음이 통하면 자연스럽게. 흐름파', axis: 'intimacy', score: 2, p: 2 },
      { id: 'ch1b', label: '상대의 속도에 맞추는 게 매너', axis: 'stability', score: 3, p: 3 },
      { id: 'ch1c', label: '천천히. 손잡기까지의 설렘도 소중해', axis: 'intimacy', score: 1, p: 1 },
      { id: 'ch1d', label: '진도보다 마음의 교감이 먼저', axis: 'expression', score: 1, p: 1 },
      { id: 'ch1e', label: '이런 질문… 좀 부끄러운데요 🙈', axis: 'independence', score: 1, p: 0 },
    ],
  },
  {
    id: 'ch2',
    title: '애정과 성에 대한 대화, 연인과 나눌 수 있을까',
    category: 'personality',
    options: [
      { id: 'ch2a', label: '필요하면 솔직하게. 건강한 관계의 핵심 대화', axis: 'intimacy', score: 3, p: 3 },
      { id: 'ch2b', label: '신뢰가 쌓이면 조심스럽게 가능', axis: 'stability', score: 2, p: 2 },
      { id: 'ch2c', label: '민망해서 빙빙 돌려 말할 것 같다', axis: 'expression', score: 1, p: 0 },
      { id: 'ch2d', label: '그런 건 말없이 통해야 하는 것', axis: 'independence', score: 2, p: -1 },
      { id: 'ch2e', label: '사랑엔 대화보다 눈빛 아닌가요', axis: 'intimacy', score: 1, p: 1 },
    ],
  },
  {
    id: 'ch3',
    title: '이상적인 애정 표현의 빈도는',
    category: 'personality',
    options: [
      { id: 'ch3a', label: '매일 포옹, 수시로 손잡기. 표현은 습관', axis: 'intimacy', score: 3, p: 2 },
      { id: 'ch3b', label: '만날 때마다 자연스럽게', axis: 'intimacy', score: 2, p: 2 },
      { id: 'ch3c', label: '특별한 날, 특별한 순간에 진하게', axis: 'pace', score: 1, p: 1 },
      { id: 'ch3d', label: 'TPO는 지키자. 공공장소는 손만', axis: 'stability', score: 2, p: 1 },
      { id: 'ch3e', label: '표현은… 마음속으로 (수줍음 주의)', axis: 'independence', score: 1, p: -1 },
    ],
  },
  {
    id: 'ch4',
    title: '잠자리 케미, 오래가는 관계에서 얼마나 중요할까',
    category: 'personality',
    options: [
      { id: 'ch4a', label: '매우 중요. 부부 사이의 온도계다', axis: 'intimacy', score: 3, p: 2 },
      { id: 'ch4b', label: '중요하지만 신뢰와 대화가 우선', axis: 'stability', score: 2, p: 2 },
      { id: 'ch4c', label: '서로 다른 게 당연. 맞춰가면 된다', axis: 'intimacy', score: 2, p: 3 },
      { id: 'ch4d', label: '시간이 지나면 정으로 사는 것', axis: 'pace', score: 1, p: 0 },
      { id: 'ch4e', label: '노코멘트 하겠습니다 😳', axis: 'independence', score: 1, p: 0 },
    ],
  },

  // ══════ PART 7.8. 요즘 연애 화두 🔥 (논쟁 유발 주의) ══════
  {
    id: 'w1',
    title: '🔥 요즘 최대 떡밥, 데이트 비용. 나의 원칙은',
    category: 'personality',
    options: [
      { id: 'w1a', label: '번갈아 내다 보면 계산이 무의미해진다', axis: 'stability', score: 3, p: 2 },
      { id: 'w1b', label: '더 벌거나 더 좋아하는 쪽이 조금 더', axis: 'pace', score: 2, p: 1 },
      { id: 'w1c', label: '무조건 반반. 시작부터 깔끔하게', axis: 'independence', score: 2, p: 1 },
      { id: 'w1d', label: '데이트 통장 개설. 회계는 투명하게', axis: 'stability', score: 2, p: 2 },
      { id: 'w1e', label: '이걸로 싸울 관계면 애초에 끝난 관계', axis: 'independence', score: 1, p: 0 },
    ],
  },
  {
    id: 'w2',
    title: '🔥 결혼 후, 내 부모님이 배우자를 서운하게 했다',
    category: 'situation',
    options: [
      { id: 'w2a', label: '내 부모는 내가 막는다. 배우자 앞에 선다', axis: 'expression', score: 3, p: 3 },
      { id: 'w2b', label: '양쪽 이야기 듣고 중간에서 통역·조율한다', axis: 'stability', score: 2, p: 2 },
      { id: 'w2c', label: '"우리 부모님이 원래 좀 그래…" 하고 넘어간다', axis: 'pace', score: 1, p: -2 },
      { id: 'w2d', label: '배우자가 어른이니 이해해주길 바란다', axis: 'independence', score: 1, p: -2 },
      { id: 'w2e', label: '일단 가족 단톡방부터 조용히 나간다', axis: 'independence', score: 2, p: 0 },
    ],
  },
  {
    id: 'w3',
    title: '🔥 "우리 서로 폰 오픈할까?" 연인의 제안에 나는',
    category: 'situation',
    options: [
      { id: 'w3a', label: '좋아, 어차피 볼 것도 없다. 즉시 오픈', axis: 'expression', score: 2, p: 2 },
      { id: 'w3b', label: '오픈은 하되 서로 예의는 지키기로 약속', axis: 'stability', score: 2, p: 2 },
      { id: 'w3c', label: '신뢰가 있는데 왜? 사생활은 정중히 거절', axis: 'independence', score: 3, p: 0 },
      { id: 'w3d', label: '알겠다고 하고 몰래 대화방부터 정리한다', axis: 'pace', score: 1, p: -2 },
      { id: 'w3e', label: '"그럼 통장도 오픈?" 판을 키운다', axis: 'intimacy', score: 1, p: 1 },
    ],
  },
  {
    id: 'w4',
    title: '🔥 연인이 이성 절친과 단둘이 새벽까지 술을 마셨다',
    category: 'situation',
    options: [
      { id: 'w4a', label: '서운하면 서운하다고 그날 바로 말한다', axis: 'expression', score: 3, p: 2 },
      { id: 'w4b', label: '"다음엔 미리 말해줘" 규칙을 정한다', axis: 'stability', score: 3, p: 2 },
      { id: 'w4c', label: '절친은 절친. 쿨하게 넘긴다', axis: 'independence', score: 2, p: 1 },
      { id: 'w4d', label: '나도 이성 친구와 새벽 술로 맞대응한다', axis: 'pace', score: 1, p: -2 },
      { id: 'w4e', label: '그 절친과 친해져서 내 편으로 만든다', axis: 'intimacy', score: 2, p: 1 },
    ],
  },

  // ══════ PART 8. 결혼이라는 미래 ══════
  {
    id: 'k1',
    title: '"결혼" 하면 가장 먼저 드는 생각은',
    category: 'personality',
    options: [
      { id: 'k1a', label: '좋아하는 사람과의 매일이라니 설렌다', axis: 'expression', score: 2, p: 3 },
      { id: 'k1b', label: '준비가 되면 자연스럽게 하고 싶다', axis: 'stability', score: 3, p: 2 },
      { id: 'k1c', label: '해도 그만 안 해도 그만', axis: 'independence', score: 2, p: -1 },
      { id: 'k1d', label: '내 자유가 사라질까 겁난다', axis: 'independence', score: 3, p: -2 },
      { id: 'k1e', label: '이 테스트를 하는 이유가 바로 그것', axis: 'expression', score: 1, p: 2 },
    ],
  },
  {
    id: 'k2',
    title: '자녀 계획에 대한 나의 생각은',
    category: 'personality',
    options: [
      { id: 'k2a', label: '아이는 꼭 낳고 싶다', axis: 'expression', score: 2, p: 3 },
      { id: 'k2b', label: '배우자와 충분히 맞춰서 정하고 싶다', axis: 'stability', score: 2, p: 2 },
      { id: 'k2c', label: '딩크(무자녀)도 진지하게 고려 중', axis: 'independence', score: 2, p: 0 },
      { id: 'k2d', label: '아이는 낳지 않을 생각이다', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'k3',
    title: '내가 꿈꾸는 부모의 모습은',
    category: 'personality',
    options: [
      { id: 'k3a', label: '친구 같은 부모 — 뭐든 얘기할 수 있는', axis: 'expression', score: 2, p: 2 },
      { id: 'k3b', label: '원칙 있는 부모 — 기준이 흔들리지 않는', axis: 'stability', score: 2, p: 2 },
      { id: 'k3c', label: '아이의 자율을 존중하는 부모', axis: 'independence', score: 2, p: 1 },
      { id: 'k3d', label: '아직 구체적으로 상상해본 적 없다', axis: 'pace', score: 0, p: 0 },
    ],
  },
  {
    id: 'k4',
    title: '결혼 후 양가 부모님과의 관계, 나의 이상은',
    category: 'personality',
    options: [
      { id: 'k4a', label: '자주 왕래하며 대가족처럼 지내고 싶다', axis: 'expression', score: 2, p: 2 },
      { id: 'k4b', label: '적당한 거리에서 정기적으로 챙기기', axis: 'stability', score: 3, p: 3 },
      { id: 'k4c', label: '각자의 부모님은 각자가 챙기는 게 편하다', axis: 'independence', score: 2, p: 0 },
      { id: 'k4d', label: '독립적으로. 왕래는 최소한으로', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'k5',
    title: '명절과 가족 행사는 어떻게 보내고 싶은가',
    category: 'personality',
    options: [
      { id: 'k5a', label: '양가를 번갈아 꼬박꼬박 챙긴다', axis: 'stability', score: 3, p: 3 },
      { id: 'k5b', label: '상황 봐서 유연하게 조율한다', axis: 'pace', score: 2, p: 2 },
      { id: 'k5c', label: '부담 없이 간소하게', axis: 'independence', score: 1, p: 1 },
      { id: 'k5d', label: '명절은 둘만의 여행 기간으로', axis: 'independence', score: 2, p: 0 },
    ],
  },
  {
    id: 'k6',
    title: '스킨십과 애정 표현, 관계에서 얼마나 중요할까',
    category: 'personality',
    options: [
      { id: 'k6a', label: '매우 중요. 애정을 확인하는 핵심 언어', axis: 'intimacy', score: 3, p: 2 },
      { id: 'k6b', label: '중요하지만 깊은 대화가 더 중요', axis: 'stability', score: 2, p: 2 },
      { id: 'k6c', label: '적당한 수준이면 충분', axis: 'intimacy', score: 1, p: 1 },
      { id: 'k6d', label: '표현이 없어도 마음만 있으면 된다', axis: 'independence', score: 2, p: -1 },
    ],
  },
  {
    id: 'k7',
    title: '오래 만나 권태기가 온다면',
    category: 'personality',
    options: [
      { id: 'k7a', label: '솔직하게 터놓고 함께 해법을 찾는다', axis: 'expression', score: 3, p: 3 },
      { id: 'k7b', label: '여행·상담 등 관계 회복에 적극 투자한다', axis: 'stability', score: 3, p: 3 },
      { id: 'k7c', label: '자연스러운 과정이니 흘러가게 둔다', axis: 'independence', score: 2, p: 0 },
      { id: 'k7d', label: '식었다면 그건 끝난 것', axis: 'pace', score: 1, p: -2 },
    ],
  },
  {
    id: 'k8',
    title: '결혼식을 한다면 어떤 모습일까',
    category: 'personality',
    options: [
      { id: 'k8a', label: '모두를 초대하는 성대한 축제', axis: 'expression', score: 3, p: 2 },
      { id: 'k8b', label: '소중한 사람만 모은 아늑한 스몰웨딩', axis: 'stability', score: 2, p: 3 },
      { id: 'k8c', label: '둘이서 떠나는 여행 결혼식', axis: 'independence', score: 2, p: 2 },
      { id: 'k8d', label: '식 자체를 생략하고 싶다', axis: 'independence', score: 2, p: -1 },
      { id: 'k8e', label: '식은 상대가 원하는 대로. 결혼 자체가 중요', axis: 'stability', score: 1, p: 2 },
    ],
  },
  {
    id: 'k9',
    title: '결혼 후 배우자와의 하루, 나의 이상은',
    category: 'personality',
    options: [
      { id: 'k9a', label: '퇴근하면 오늘 있었던 일 다 쏟아내기', axis: 'expression', score: 3, p: 3 },
      { id: 'k9b', label: '저녁 함께 먹고 각자 취미 존중', axis: 'stability', score: 2, p: 2 },
      { id: 'k9c', label: '주말만큼은 무조건 둘이 풀코스', axis: 'pace', score: 2, p: 2 },
      { id: 'k9d', label: '같은 집, 각자의 방. 적당한 거리', axis: 'independence', score: 3, p: -1 },
    ],
  },
  {
    id: 'k10',
    title: '10년 뒤 나의 모습, 가장 가까운 상상은',
    category: 'personality',
    options: [
      { id: 'k10a', label: '배우자와 아이, 북적이는 집', axis: 'expression', score: 2, p: 3 },
      { id: 'k10b', label: '둘이서 단단하게 사는 삶', axis: 'stability', score: 3, p: 3 },
      { id: 'k10c', label: '일과 사랑 모두 현재진행형', axis: 'pace', score: 2, p: 1 },
      { id: 'k10d', label: '자유로운 1인 라이프', axis: 'independence', score: 3, p: -2 },
      { id: 'k10e', label: '상상 불가. 10년 뒤는 10년 뒤의 내가 알아서', axis: 'pace', score: 1, p: 0 },
    ],
  },
]

/** 해당 성별에게 실제 출제되는 문항 목록 */
export function questionsForGender(gender: Gender): QuizQuestion[] {
  return QUESTIONS.filter((q) => !q.genderOnly || q.genderOnly === gender)
}

/** 응답 기준 문항 수 (남녀 동일하게 설계됨) */
export const QUESTION_COUNT = QUESTIONS.filter((q) => !q.genderOnly || q.genderOnly === 'male').length

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
// 69문항 p 합계를 35~95 범위에 맞게 스케일링
const PROBABILITY_SCALE = 0.5

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
    name: '브레이크 고장난 직진기관차',
    emoji: '🚀',
    memeLine: '고백까지 3일, 상견례까지 3개월',
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
    bestMatch: '100시간 우린 곰탕형',
    hardMatch: '썸만 100번째인 환승러',
  },
  'high-pace': {
    name: '혼인신고 3분컷 속도광',
    emoji: '🚄',
    memeLine: '만난 지 100일에 상견례 가능',
    keywords: ['속전속결', '결정장애_그게뭐죠', 'KTX연애', '골인각_재는중'],
    summary:
      '마음의 결정이 서면 실행까지의 속도가 압도적인 타입입니다. 썸에서 연애로, 연애에서 결혼으로 넘어가는 환승 구간에서 머뭇거림이 없습니다. 주변에서 "벌써?"라는 말을 가장 자주 듣지만, 후회도 가장 적게 하는 유형입니다.',
    loveStyle:
      '만남 초반에 상대를 파악하는 스캔 능력이 뛰어납니다. "이 사람이다" 싶으면 관계의 다음 단계를 먼저 제안하는 쪽도 늘 당신. 다만 신중한 상대에게는 그 속도가 압박으로 느껴질 수 있습니다.',
    marriageOutlook:
      '결혼 결심이 서는 순간부터는 일사천리입니다. 상견례, 식장, 신혼집까지 프로젝트 매니저처럼 진행하는 유형. 단, 배우자의 "잠깐만, 생각 좀"을 기다려주는 연습이 행복의 열쇠입니다.',
    strengths: ['기회를 놓치지 않는 결단력', '관계를 정체시키지 않는 추진력', '말보다 빠른 실행'],
    watchouts: ['상대가 준비되기 전에 다음 단계를 밀어붙일 수 있어요', '빠른 결정만큼 빠른 실망도 주의하세요'],
    tips: [
      '중요한 제안 전에 "너는 어떻게 생각해?"를 먼저 물어보세요',
      '속도를 늦추는 게 아니라 보폭을 맞추는 겁니다. 함께 가야 골인입니다',
      '결정 전 하루의 숙성 시간을 가져보세요. 확신은 사라지지 않습니다',
    ],
    bestMatch: '국가공인 배우자감',
    hardMatch: '감나무 밑 거북이',
  },
  'high-stability': {
    name: '국가공인 배우자감',
    emoji: '🏡',
    memeLine: '어른들이 제일 좋아하는 바로 그 유형',
    keywords: ['신뢰적금', '연애도_장기투자', '준비된배우자', '안정감맛집'],
    summary:
      '관계를 벽돌 쌓듯 차곡차곡 만들어가는 타입입니다. 화려한 이벤트보다 매일 같은 시간의 연락, 약속을 지키는 꾸준함으로 사랑을 증명합니다. 시간이 지날수록 진가가 드러나는 사람 — 3개월보다 3년이 더 기대되는 연애를 합니다.',
    loveStyle:
      '요란하지 않지만 빈틈이 없습니다. 상대의 생활 패턴을 기억하고, 힘든 날을 알아채고, 필요한 순간에 정확히 옆에 있습니다. 다만 속마음 표현이 느려서 상대가 답답해할 수 있습니다.',
    marriageOutlook:
      '12유형 중 결혼 준비도 1위. 경제 계획, 주거 계획, 인생 계획이 이미 머릿속에 그려져 있습니다. 결혼 후에는 가정을 시스템처럼 안정적으로 운영하는 배우자가 됩니다.',
    strengths: ['흔들리지 않는 꾸준함', '말보다 행동으로 증명하는 신뢰', '현실 감각과 계획 능력'],
    watchouts: ['표현 절약이 심하면 상대는 확신을 잃어요', '계획에 없던 변수에 유연하지 못할 때가 있어요'],
    tips: [
      '마음의 10%만이라도 말로 꺼내보세요. 상대는 그 한마디를 기다립니다',
      '가끔은 계획 없는 하루를 선물해보세요. 즉흥도 연습하면 늘어요',
      '상대의 감정 기복을 "비효율"로 보지 말고 날씨처럼 받아들여 보세요',
    ],
    bestMatch: '금사빠 전과 12범',
    hardMatch: '연애보다 내 인생 꿀잼파',
  },
  'high-independence': {
    name: '겉바속촉 츤데레',
    emoji: '😼',
    memeLine: '겉은 시크, 속은 이미 웨딩플래너',
    keywords: ['츤데레인증', '무심한듯_다챙김', '속마음은_순정만화', '반전매력'],
    summary:
      '겉으로는 쿨하고 독립적이지만, 속으로는 누구보다 진지하게 평생을 그리는 반전의 타입입니다. 좀처럼 곁을 내주지 않지만, 한번 마음을 정하면 그 사람이 인생의 답이 됩니다.',
    loveStyle:
      '표현은 무뚝뚝해도 행동에는 애정이 배어 있습니다. "밥은 먹었냐"는 퉁명스러운 한마디가 사실 최고 수위의 관심 표현. 문제는 상대가 그 시크함을 무관심으로 오해할 때입니다.',
    marriageOutlook:
      '결혼에 대한 확신이 서기까지는 시간이 걸리지만, 내린 결론은 번복하지 않습니다. 서로의 독립성을 존중하면서도 단단하게 연결된, 어른의 결혼을 만드는 유형입니다.',
    strengths: ['행동으로 스며드는 진심', '집착하지 않는 세련된 거리감각', '한번 정하면 번복 없는 심지'],
    watchouts: ['시크함이 길어지면 상대는 무관심으로 읽어요', '마음을 확인해주지 않으면 좋은 인연이 지쳐 떠날 수 있어요'],
    tips: [
      '열 번의 츤 중에 한 번은 데레를 보여주세요. 그 한 번이 관계를 살립니다',
      '"표현 안 해도 알겠지"는 없습니다. 최소한의 언어화 연습을 하세요',
      '상대의 애정 표현을 부담스러워하지 말고 "고마워" 한마디로 받아주세요',
    ],
    bestMatch: '브레이크 고장난 직진기관차',
    hardMatch: '읽씹 담당 국가대표',
  },
  'mid-expression': {
    name: '금사빠 전과 12범',
    emoji: '💘',
    memeLine: '운명의 상대 만나면 급발진 예정',
    keywords: ['설렘수집가', '잠재력만렙', '아직_간보는중', '급발진주의'],
    summary:
      '사랑에 진심이지만, 아직 "이 사람이다" 싶은 확신을 찾는 중인 타입입니다. 좋은 사람을 만나는 순간 12유형 중 가장 극적인 변화를 보여주는, 잠재력의 유형입니다.',
    loveStyle:
      '연애 초반의 설렘을 그 누구보다 잘 즐깁니다. 리액션이 좋아 상대를 기분 좋게 만듭니다. 하지만 관계가 깊어지는 길목에서 한 번씩 멈칫합니다 — 그 고민의 시간이 길어지면 상대는 지치기 시작합니다.',
    marriageOutlook:
      '지금 당장의 결혼 확률은 중간이지만, 이 수치는 언제든 급등할 수 있습니다. 결혼 후에는 연애 때의 설렘을 일상에서 재생산하는 재주로, 지루할 틈 없는 가정을 만듭니다.',
    strengths: ['순간을 즐길 줄 아는 에너지', '상대를 기분 좋게 만드는 리액션', '새로움에 대한 열린 마음'],
    watchouts: ['간만 보다가 좋은 인연을 놓칠 수 있어요', '설렘이 사라지면 사랑도 끝났다고 착각하기 쉬워요'],
    tips: [
      '100% 확신은 없습니다. 70% 확신이면 한 걸음 내디뎌 보세요',
      '설렘은 시작 신호일 뿐, 편안함이 진짜 본편입니다',
      '비교 대상을 늘리기보다 눈앞의 한 사람을 깊게 들여다보세요',
    ],
    bestMatch: '국가공인 배우자감',
    hardMatch: '안전거리 확보 상습범',
  },
  'mid-pace': {
    name: '읽씹 담당 국가대표',
    emoji: '🎭',
    memeLine: '읽씹도 전략, 답장도 예술',
    keywords: ['밀당장인', '연애는_심리전', '타이밍의신', '어장아님_전략임'],
    summary:
      '관계의 온도를 조절하는 감각이 타고난 타입입니다. 언제 다가가고 언제 물러설지를 본능적으로 아는 사람. 연애를 게임처럼 즐기는 게 아니라, 관계의 리듬을 아는 것뿐입니다.',
    loveStyle:
      '호감이 있어도 전부를 보여주지 않습니다. 그 완급 조절이 상대의 마음을 끌어당기는 원동력입니다. 다만 진심을 보여야 할 결정적 순간에도 습관처럼 밀당을 하다가, 확신을 원하는 상대를 놓치는 것이 최대 리스크입니다.',
    marriageOutlook:
      '진짜 인연을 만나면 서서히 패를 내려놓고 정공법으로 전환하는 유형. 결혼 후에는 그 긴장 조절 능력이 권태기 방어 스킬로 진화합니다 — 10년 차에도 서로를 궁금해하는 부부가 됩니다.',
    strengths: ['상대를 계속 궁금하게 만드는 매력', '관계의 온도를 읽는 감각', '쉽게 지루해지지 않는 연애'],
    watchouts: ['결정적 순간의 밀당은 인연을 끊는 가위가 됩니다', '전략이 길어지면 진심의 타이밍을 놓쳐요'],
    tips: [
      '밀당은 에피타이저까지만. 메인 요리는 진심으로 내세요',
      '상대가 지쳐 보이면 즉시 당기세요. 그 타이밍만은 계산하지 마세요',
      '"나 사실 너 좋아해"를 이길 전략은 없습니다',
    ],
    bestMatch: '연애보다 내 인생 꿀잼파',
    hardMatch: '브레이크 고장난 직진기관차',
  },
  'mid-stability': {
    name: '100시간 우린 곰탕형',
    emoji: '🕯️',
    memeLine: '끓는 데 오래 걸림, 식는 덴 더 오래 걸림',
    keywords: ['느리지만_확실하게', '곰탕같은사랑', '진국인증', '천천히_뜨거워짐'],
    summary:
      '겉은 차분하지만 속은 누구보다 따뜻한 타입입니다. 마음을 여는 데 시간이 걸리지만, 한번 열리면 그 온기가 쉽게 식지 않습니다. 당신의 진가를 아는 사람만이 그 온기를 누릴 수 있습니다.',
    loveStyle:
      '호감이 있어도 티가 잘 나지 않아 상대가 눈치채지 못하는 경우가 많습니다. 하지만 일단 연애가 시작되면 반전 매력이 폭발합니다 — 기억력 좋은 세심함, 위기에서 빛나는 침착함, 변하지 않는 한결같음.',
    marriageOutlook:
      '결혼을 가볍게 생각하지 않기에 신중하지만, 그만큼 결혼 후 만족도는 12유형 중 최상위권입니다. "결혼 잘했다"는 말을 배우자 입에서 가장 자주 듣게 될 유형입니다.',
    strengths: ['깊어질수록 빛나는 진심', '위기에서 드러나는 침착함과 세심함', '쉽게 변하지 않는 한결같음'],
    watchouts: ['마음의 문이 너무 늦게 열리면 기회 자체가 사라져요', '침묵이 길어지면 상대는 거절로 오해해요'],
    tips: [
      '호감의 30%만 미리 보여주세요. 상대에게는 그게 유일한 신호입니다',
      '"천천히"와 "멈춤"은 다릅니다. 느려도 계속 움직이세요',
      '상대의 빠른 속도를 가벼움으로 단정하지 마세요. 스타일 차이일 뿐입니다',
    ],
    bestMatch: '브레이크 고장난 직진기관차',
    hardMatch: '썸만 100번째인 환승러',
  },
  'mid-independence': {
    name: '안전거리 확보 상습범',
    emoji: '📏',
    memeLine: '가까이 오면 한 발, 멀어지면 반 발',
    keywords: ['거리의미학', '고슴도치딜레마', '혼자도_둘도_좋아', '적정온도유지'],
    summary:
      '너무 가깝지도, 너무 멀지도 않은 최적의 거리를 아는 타입입니다. 연애를 원하지만 나를 잃는 연애는 사절. 상대에게 기대지 않는 단단함이 오히려 매력으로 작동하는 사람입니다.',
    loveStyle:
      '연애 중에도 자신의 루틴과 세계를 지킵니다. 부담 주지 않는 편안한 연애가 강점이지만, 애정 확인이 필요한 상대에게는 "우리 사귀는 거 맞아?"라는 질문을 듣게 될 수 있습니다.',
    marriageOutlook:
      '결혼하면 자유가 사라진다는 공식을 거부하는 유형입니다. 서로를 소유하지 않으면서도 신뢰로 묶인 관계 — 요즘 시대가 원하는 결혼의 모범 답안이 될 수 있습니다.',
    strengths: ['상대를 숨 막히게 하지 않는 여유', '자기 관리에서 나오는 단단한 매력', '갈등을 키우지 않는 거리감각'],
    watchouts: ['적정 거리가 상대에겐 미지근함으로 느껴질 수 있어요', '한 발 물러서는 습관이 결정적 순간에도 나올 수 있어요'],
    tips: [
      '일주일에 한 번은 먼저 거리를 좁혀보세요. 균형은 번갈아 잡는 겁니다',
      '"괜찮아"가 아니라 "보고 싶어"라고 말하는 연습을 해보세요',
      '경계선을 지키되, 그 선 위에서 손은 잡아주세요',
    ],
    bestMatch: '겉바속촉 츤데레',
    hardMatch: '혼인신고 3분컷 속도광',
  },
  'low-expression': {
    name: '연애보다 내 인생 꿀잼파',
    emoji: '🔥',
    memeLine: '결혼? 아직은 내 인생이 더 재밌음',
    keywords: ['내인생이_메인디쉬', '자유영혼', '불꽃주의보', '묶이면_도망감'],
    summary:
      '지금은 사랑보다 나의 세계가 우선인 타입입니다. 매력이 없어서가 결코 아닙니다. 오히려 자기 인생을 재밌게 사는 사람 특유의 에너지가 사람을 끌어당깁니다.',
    loveStyle:
      '밀당의 고수라는 오해를 받지만, 사실은 밀당이 아니라 진짜 바쁜 겁니다. 소유하려 들지 않는 쿨함이 매력이지만, 안정형 상대에게는 불안을 줄 수 있습니다.',
    marriageOutlook:
      '지금의 결혼 확률이 낮은 건 능력이 아니라 우선순위의 문제입니다. "부부이자 각자"로 사는 신개념 결혼 생활을 개척하는 유형 — 오히려 요즘 시대와 잘 맞습니다.',
    strengths: ['어디로 튈지 모르는 매력', '자기 인생을 사는 사람의 건강한 에너지', '상대를 소유하려 하지 않는 쿨함'],
    watchouts: ['"바쁨"이 반복되면 상대에게는 거절의 신호로 읽혀요', '자유와 방치는 한 끗 차이입니다'],
    tips: [
      '일주일에 단 하루라도 상대를 1순위에 놓는 날을 만들어보세요',
      '자유를 지키고 싶다면, 그만큼 안심을 선물하세요',
      '"나중에 여유되면 연애해야지"의 나중은 오지 않습니다',
    ],
    bestMatch: '읽씹 담당 국가대표',
    hardMatch: '국가공인 배우자감',
  },
  'low-pace': {
    name: '썸만 100번째인 환승러',
    emoji: '🎢',
    memeLine: '설렘 구간만 무한 환승 중',
    keywords: ['썸신', '시작이_제일_재밌어', '환승의달인', '롤러코스터만_탐'],
    summary:
      '연애의 예고편, 그 아슬아슬한 설렘 구간을 사랑하는 타입입니다. 시작 전문가지만 정착은 아직 미정 — 롤러코스터에서 내리는 법을 배우는 중입니다.',
    loveStyle:
      '썸의 공기를 만드는 데는 12유형 중 최고 수준입니다. 문제는 관계가 확정되는 순간 흥미가 급감한다는 것. 확정이 주는 무게가 아직 낯선 것뿐입니다.',
    marriageOutlook:
      '결혼은 멀게 느껴지지만, 사실 당신에게 필요한 건 설렘이 유지되는 관계일 뿐입니다. 결혼 후에는 그 감각으로 부부 사이의 긴장과 재미를 유지하는 로맨스 담당이 됩니다.',
    strengths: ['상대를 설레게 하는 타고난 감각', '관계 초반의 압도적인 매력', '분위기를 읽고 만드는 능력'],
    watchouts: ['설렘 중독은 진짜 사랑의 문턱에서 발목을 잡아요', '환승이 반복되면 남는 건 피로뿐입니다'],
    tips: [
      '설렘의 끝은 권태가 아니라 편안함입니다. 한 번은 그 구간을 지나보세요',
      '"확정"을 두려워하지 마세요. 썸의 기술은 연애에서도 쓸 수 있습니다',
      '이번에 만나는 사람과는 3개월만 더 가보세요. 본편이 시작됩니다',
    ],
    bestMatch: '금사빠 전과 12범',
    hardMatch: '100시간 우린 곰탕형',
  },
  'low-stability': {
    name: '준비만 N년째 완벽주의자',
    emoji: '⏳',
    memeLine: '준비가 끝나야 사랑도 시작이지',
    keywords: ['준비완료후_출발', '완벽주의연애', '대기만성', '내기준이_높은편'],
    summary:
      '"지금은 때가 아니다"를 스스로에게 말하는 타입입니다. 연애를 못 하는 게 아니라 미루고 있는 것이며, 그 기준의 높이가 곧 당신이 관계를 얼마나 진지하게 여기는지의 증거입니다.',
    loveStyle:
      '어설픈 관계를 시작하느니 혼자를 택하는 사람입니다. 하지만 일단 시작한 연애에서는 준비된 사람 특유의 성숙함과 책임감이 빛납니다. 상대를 실망시키는 일이 거의 없는 견고한 파트너입니다.',
    marriageOutlook:
      '준비가 갖춰지는 순간 12유형 중 가장 안정적인 결혼 생활을 만들 재목입니다. 다만 완벽한 준비란 존재하지 않는다는 것 — 그걸 인정하는 순간이 당신의 결혼 원년이 됩니다.',
    strengths: ['관계에 대한 진지한 책임감', '준비된 사람의 성숙함', '쉽게 흔들리지 않는 자기 기준'],
    watchouts: ['"완벽한 때"를 기다리다 좋은 사람을 그냥 보낼 수 있어요', '높은 기준이 상대에 대한 채점표가 되지 않게 주의하세요'],
    tips: [
      '사랑은 준비된 사람이 아니라 시작한 사람의 것입니다',
      '부족한 채로 만나서 함께 채워가는 것도 계획의 일부로 넣어보세요',
      '스스로에게 관대해지는 만큼 인연의 문도 넓어집니다',
    ],
    bestMatch: '혼인신고 3분컷 속도광',
    hardMatch: '연애보다 내 인생 꿀잼파',
  },
  'low-independence': {
    name: '감나무 밑 거북이',
    emoji: '🐢',
    memeLine: '입 벌리고 감 떨어지길 기다리는 중',
    keywords: ['거북이전략', '조급함제로', '올사람은온다', '마이페이스'],
    summary:
      '서두를 이유가 전혀 없는 타입입니다. "때가 되면 만나겠지"라는 태도는 무심함이 아니라 자신에 대한 깊은 믿음에서 나오는 여유입니다.',
    loveStyle:
      '먼저 다가가는 일은 거의 없지만, 다가온 인연을 밀어내지도 않습니다. 상대를 바꾸려 하지 않는 관대함이 최고의 장점. 다만 이벤트를 기대하는 상대에게는 아쉬움을 남길 수 있습니다.',
    marriageOutlook:
      '자연스럽게 스며드는 인연을 만나면 물 흐르듯 결혼까지 이어지는 유형입니다. 결혼 후에는 함께 있어도 숨 쉴 공간이 있는 편안한 가정을 만듭니다. 롱런 부부의 비결을 타고난 사람입니다.',
    strengths: ['조급함 없는 단단한 페이스', '상대를 바꾸려 하지 않는 관대함', '있는 그대로 편안함을 주는 존재감'],
    watchouts: ['기다림이 길어지면 인연이 지나쳐 갈 수 있어요', '무심함과 여유는 상대 입장에선 구분이 어려워요'],
    tips: [
      '올 사람은 옵니다. 하지만 문은 열어둬야 들어옵니다',
      '한 달에 한 번은 새로운 모임에 나가보세요. 확률은 움직여야 올라갑니다',
      '마음에 드는 사람에게는 평소보다 딱 한 템포만 빠르게 반응해보세요',
    ],
    bestMatch: '연애보다 내 인생 꿀잼파',
    hardMatch: '브레이크 고장난 직진기관차',
  },
}

// 카피 검수용 전체 유형 목록 (key = 확률구간-주도축)
export const RESULT_TYPE_LIST: Array<{ key: string } & ResultTypeDef> = Object.entries(
  RESULT_TYPES,
).map(([key, def]) => ({ key, ...def }))

function parseGender(answers: Answers): Gender | null {
  const value = answers[GENDER_KEY]
  return value === 'male' || value === 'female' ? value : null
}

export function validateAnswers(answers: Answers): boolean {
  const gender = parseGender(answers)
  if (!gender) return false

  const expected = questionsForGender(gender)
  const answeredAll = expected.every((q) => {
    const picked = answers[q.id]
    return typeof picked === 'string' && q.options.some((o) => o.id === picked)
  })

  return answeredAll && Object.keys(answers).length === expected.length + 1
}

// 동점 시 우선순위 — 표현 > 속도 > 안정 > 독립
const DOMINANT_ORDER: AxisKey[] = ['expression', 'pace', 'stability', 'independence']

export function calcQuizResult(answers: Answers): QuizResultData | null {
  const gender = parseGender(answers)
  if (!gender || !validateAnswers(answers)) return null

  const axes: Record<AxisKey, number> = {
    expression: 0,
    pace: 0,
    independence: 0,
    stability: 0,
    intimacy: 0,
  }
  let pSum = 0

  questionsForGender(gender).forEach((q) => {
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
