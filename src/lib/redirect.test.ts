import { describe, expect, test } from 'vitest'
import { safeRedirectPath } from './redirect'

describe('safeRedirectPath — 오픈 리다이렉트 방어', () => {
  test('정상 내부 경로는 통과한다', () => {
    expect(safeRedirectPath('/quiz/marriage/complete')).toBe('/quiz/marriage/complete')
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard')
  })

  test('프로토콜 상대 URL(//)은 차단한다', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/dashboard')
  })

  test('백슬래시 우회(/\\evil.com)를 차단한다', () => {
    // 브라우저는 상대 경로의 \\ 를 / 로 정규화하므로 //evil.com과 동일한 공격
    expect(safeRedirectPath('/\\evil.com')).toBe('/dashboard')
    expect(safeRedirectPath('\\\\evil.com')).toBe('/dashboard')
  })

  test('절대 URL은 차단한다', () => {
    expect(safeRedirectPath('https://evil.com')).toBe('/dashboard')
    expect(safeRedirectPath('http://evil.com/x')).toBe('/dashboard')
  })

  test('빈 값·null·비문자열은 기본값을 반환한다', () => {
    expect(safeRedirectPath(null)).toBe('/dashboard')
    expect(safeRedirectPath('')).toBe('/dashboard')
  })

  test('기본값을 바꿀 수 있다', () => {
    expect(safeRedirectPath(null, '/login')).toBe('/login')
  })
})
