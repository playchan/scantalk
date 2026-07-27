import { describe, expect, test } from 'vitest'
import { FUNNEL_STEPS, periodToSince } from './kpi'

describe('FUNNEL_STEPS', () => {
  test('퍼널 단계는 이어져 있다 (이전 단계의 to = 다음 단계의 from)', () => {
    for (let i = 1; i < FUNNEL_STEPS.length; i++) {
      expect(FUNNEL_STEPS[i].from).toBe(FUNNEL_STEPS[i - 1].to)
    }
  })

  test('목표값은 docs/10 게이트 기준과 일치한다', () => {
    const targets = FUNNEL_STEPS.map((s) => s.target)
    expect(targets).toEqual([60, 70, 30, 30])
  })
})

describe('periodToSince', () => {
  const now = new Date('2026-07-26T15:30:00+09:00')

  test('today는 당일 00:00을 반환한다', () => {
    const since = periodToSince('today', now)!
    expect(since.getHours()).toBe(0)
    expect(since.getMinutes()).toBe(0)
    expect(since.getDate()).toBe(now.getDate())
  })

  test('7d는 정확히 7일 전이다', () => {
    const since = periodToSince('7d', now)!
    expect(now.getTime() - since.getTime()).toBe(7 * 24 * 60 * 60 * 1000)
  })

  test('30d는 정확히 30일 전이다', () => {
    const since = periodToSince('30d', now)!
    expect(now.getTime() - since.getTime()).toBe(30 * 24 * 60 * 60 * 1000)
  })

  test('all은 null (기간 제한 없음)', () => {
    expect(periodToSince('all', now)).toBeNull()
  })
})
