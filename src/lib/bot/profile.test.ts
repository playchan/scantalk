import { describe, expect, test } from 'vitest'
import {
  buildBotNickname,
  buildBotProfile,
  buildSystemPrompt,
  compatibilityScore,
  nextAffinity,
  nextSyncRate,
} from './profile'
import type { AxisKey } from '@/lib/quiz/marriage'

const AXES_EXPRESSIVE: Record<AxisKey, number> = {
  expression: 40,
  pace: 20,
  intimacy: 15,
  stability: 25,
  independence: 10,
}

const AXES_INDEPENDENT: Record<AxisKey, number> = {
  expression: 8,
  pace: 18,
  intimacy: 14,
  stability: 24,
  independence: 42,
}

describe('buildBotNickname', () => {
  test('주도 축 형용사가 들어가고 결정적이다', () => {
    const a = buildBotNickname(AXES_EXPRESSIVE, 'seed-1')
    const b = buildBotNickname(AXES_EXPRESSIVE, 'seed-1')
    expect(a).toBe(b)
    expect(a).toContain('직진하는')
  })

  test('시드가 다르면 동물이 달라질 수 있다 (형용사는 축 기반 유지)', () => {
    const nick = buildBotNickname(AXES_INDEPENDENT, 'other-seed')
    expect(nick).toContain('시크한')
  })
})

describe('buildBotProfile', () => {
  test('취향 응답에서 관심사를 추출한다', () => {
    const profile = buildBotProfile({ f3: 'f3a', f6: 'f6c' }, AXES_EXPRESSIVE, '금사빠 전과 12범')
    expect(profile.interests).toContain('맛집 탐방')
    expect(profile.interests).toContain('각자의 취미 존중')
    expect(profile.resultType).toBe('금사빠 전과 12범')
  })

  test('관심사 응답이 없어도 기본값이 있다', () => {
    const profile = buildBotProfile({}, AXES_EXPRESSIVE, '테스트')
    expect(profile.interests.length).toBeGreaterThan(0)
  })
})

describe('buildSystemPrompt', () => {
  test('안전 가드레일(연락처·만남 금지)이 포함된다', () => {
    const profile = buildBotProfile({}, AXES_EXPRESSIVE, '테스트')
    const prompt = buildSystemPrompt('직진하는 수달', 'female', profile)
    expect(prompt).toContain('전화번호')
    expect(prompt).toContain('오프라인 만남')
    expect(prompt).toContain('직진하는 수달')
  })
})

describe('compatibilityScore', () => {
  test('0~100 범위이고 대칭이다', () => {
    const ab = compatibilityScore(AXES_EXPRESSIVE, AXES_INDEPENDENT)
    const ba = compatibilityScore(AXES_INDEPENDENT, AXES_EXPRESSIVE)
    expect(ab).toBe(ba)
    expect(ab).toBeGreaterThanOrEqual(0)
    expect(ab).toBeLessThanOrEqual(100)
  })

  test('표현형↔독립형 보완 조합은 동일 성향 쌍보다 낮지 않은 보완 가점을 받는다', () => {
    const complementary = compatibilityScore(AXES_EXPRESSIVE, AXES_INDEPENDENT)
    expect(complementary).toBeGreaterThan(0)
  })
})

describe('호감도·싱크로율', () => {
  test('메시지가 길수록 호감도가 더 오르고 100에서 멈춘다', () => {
    expect(nextAffinity(0, 5)).toBe(1)
    expect(nextAffinity(0, 20)).toBe(2)
    expect(nextAffinity(0, 50)).toBe(3)
    expect(nextAffinity(99, 50)).toBe(100)
  })

  test('싱크로율은 30 미만이어도 30 기준으로 오르고 100에서 멈춘다', () => {
    expect(nextSyncRate(30)).toBe(31)
    expect(nextSyncRate(0)).toBe(31)
    expect(nextSyncRate(100)).toBe(100)
  })
})
