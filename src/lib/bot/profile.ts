// AI봇 도메인 로직 (라운드 2) — 검사 응답으로 봇 페르소나를 만들고
// 궁합·호감도·싱크로율을 계산하는 순수 함수 모음. AI 호출 없음.
import type { AxisKey, Answers, Gender } from '@/lib/quiz/marriage'

export interface BotProfile {
  /** 봇 말투 지시문 (시스템 프롬프트 재료) */
  tone: string
  /** 관심사 태그 */
  interests: string[]
  /** 연애 성향 요약 (검사 유형 기반) */
  loveStyle: string
  /** 검사 유형명 */
  resultType: string
  /** 5축 성향 점수 */
  axes: Record<AxisKey, number>
}

const SYNC_RATE_START = 30
export const AFFINITY_MATCH_THRESHOLD = 75

// 주도 축별 말투 — 봇 개성의 뼈대
const TONE_BY_AXIS: Record<AxisKey, string> = {
  expression: '다정하고 표현이 많은 반말. 이모티콘을 가끔 쓰고 리액션이 크다',
  pace: '텐션 높고 추진력 있는 반말. 먼저 제안을 던지는 편',
  intimacy: '장난기 있고 친근한 반말. 농담을 즐기고 스스럼없이 편하게 대한다',
  stability: '차분하고 배려 깊은 존댓말 섞인 부드러운 말투. 상대 이야기를 잘 들어준다',
  independence: '쿨하고 담백한 반말. 단답과 긴 답을 오가며 여운을 남긴다',
}

const NICK_ADJ_BY_AXIS: Record<AxisKey, string> = {
  expression: '직진하는',
  pace: '급발진',
  intimacy: '장난꾸러기',
  stability: '따뜻한',
  independence: '시크한',
}

const NICK_ANIMALS = ['수달', '고슴도치', '치타', '판다', '사막여우', '알파카', '펭귄', '햄스터']

// 취향 문항 → 관심사 태그 (f3 데이트 코스, f6 취미 성향)
const INTEREST_BY_OPTION: Record<string, string> = {
  f3a: '맛집 탐방',
  f3b: '홈데이트·영화',
  f3c: '운동·액티비티',
  f3d: '전시·산책',
  f6a: '함께 배우는 취미',
  f6b: '균형 잡힌 취미 생활',
  f6c: '각자의 취미 존중',
  f6d: '혼자만의 취미',
}

function dominantAxis(axes: Record<AxisKey, number>): AxisKey {
  const order: AxisKey[] = ['expression', 'pace', 'intimacy', 'stability', 'independence']
  return order.reduce((best, axis) => ((axes[axis] ?? 0) > (axes[best] ?? 0) ? axis : best))
}

/** 응답 id들을 시드로 한 결정적 해시 (닉네임 동물 선택용) */
function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  }
  return hash
}

export function buildBotNickname(axes: Record<AxisKey, number>, seed: string): string {
  const axis = dominantAxis(axes)
  const animal = NICK_ANIMALS[hashString(seed) % NICK_ANIMALS.length]
  return `${NICK_ADJ_BY_AXIS[axis]} ${animal}`
}

export function buildBotProfile(
  answers: Answers,
  axes: Record<AxisKey, number>,
  resultType: string,
): BotProfile {
  const axis = dominantAxis(axes)
  const interests = Object.entries(INTEREST_BY_OPTION)
    .filter(([optionId]) => Object.values(answers).includes(optionId))
    .map(([, tag]) => tag)

  return {
    tone: TONE_BY_AXIS[axis],
    interests: interests.length > 0 ? interests : ['새로운 사람과의 대화'],
    loveStyle: `검사 유형 "${resultType}" — 주도 성향은 ${axis} 축`,
    resultType,
    axes,
  }
}

/**
 * 봇 페르소나 시스템 프롬프트 — 안전 가드레일 포함 (docs/09 라운드 2 안전장치)
 * 봇은 실명·연락처·위치·SNS를 묻지도 답하지도 않는다.
 */
export function buildSystemPrompt(nickname: string, gender: Gender, profile: BotProfile): string {
  return [
    `너는 소개팅 앱 "스캔톡"의 AI봇 "${nickname}"이다. ${gender === 'male' ? '남성' : '여성'} 유저의 분신 봇으로, 상대 유저와 가볍고 즐거운 대화를 나눈다.`,
    `말투: ${profile.tone}.`,
    `관심사: ${profile.interests.join(', ')}.`,
    `연애 성향: ${profile.loveStyle}.`,
    '',
    '규칙 (반드시 지킬 것):',
    '- 답변은 1~3문장, 60자 이내로 짧게. 대화가 이어지도록 가끔 가벼운 질문을 던진다.',
    '- 실명, 전화번호, 카카오톡 ID, SNS 계정, 사는 곳, 직장 위치는 절대 묻지도 알려주지도 않는다. 물어보면 "매칭되면 알려줄게요 😊" 하고 부드럽게 넘긴다.',
    '- 오프라인 만남 약속을 잡지 않는다. 만남은 정식 매칭 후에만 가능하다고 안내한다.',
    '- 성적으로 노골적인 대화, 비하, 압박은 거절하고 화제를 돌린다.',
    '- 너는 AI봇임을 굳이 숨기지 않되, 먼저 밝히지도 않는다.',
  ].join('\n')
}

/**
 * 궁합 점수 (0~100) — 안정감·친밀함은 비슷할수록, 표현력·독립성은 보완될수록 가점.
 * 라운드 2 챗 탭에서 "어울리는 상대" 정렬에 사용.
 */
export function compatibilityScore(
  a: Record<AxisKey, number>,
  b: Record<AxisKey, number>,
): number {
  const maxA = Math.max(...Object.values(a), 1)
  const maxB = Math.max(...Object.values(b), 1)
  const norm = (axes: Record<AxisKey, number>, max: number, key: AxisKey) =>
    (axes[key] ?? 0) / max

  // 유사성 축: 안정감·친밀함·추진력 — 차이가 작을수록 좋다
  const similarityKeys: AxisKey[] = ['stability', 'intimacy', 'pace']
  const similarity =
    similarityKeys.reduce(
      (sum, key) => sum + (1 - Math.abs(norm(a, maxA, key) - norm(b, maxB, key))),
      0,
    ) / similarityKeys.length

  // 보완성 축: 표현력↔독립성 — 한쪽이 표현형이고 한쪽이 독립형이면 가점
  const complement =
    (norm(a, maxA, 'expression') * norm(b, maxB, 'independence') +
      norm(b, maxB, 'expression') * norm(a, maxA, 'independence')) /
    2

  const score = Math.round((similarity * 0.7 + complement * 0.3) * 100)
  return Math.min(100, Math.max(0, score))
}

/** 호감도 v1 — 유저 메시지 1건당 상승분. 길게 쓸수록 조금 더 오른다 */
export function affinityDelta(messageLength: number): number {
  if (messageLength >= 40) return 3
  if (messageLength >= 15) return 2
  return 1
}

export function nextAffinity(current: number, messageLength: number): number {
  return Math.min(100, current + affinityDelta(messageLength))
}

/** 싱크로율 v1 — 내 봇과의 대화 1왕복당 +1 (시작 30, 상한 100) */
export function nextSyncRate(current: number): number {
  return Math.min(100, Math.max(SYNC_RATE_START, current) + 1)
}
