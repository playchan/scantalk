// 라운드 1 게이트 기준 (docs/09 라운드 1 / docs/10 1번) — 인사이트 대시보드에서 목표 대비 표시에 사용
export interface FunnelStep {
  from: string
  to: string
  label: string
  /** 통과 기준 (%) */
  target: number
}

export const FUNNEL_STEPS: FunnelStep[] = [
  { from: 'quiz_view', to: 'quiz_start', label: '방문 → 시작', target: 60 },
  { from: 'quiz_start', to: 'quiz_complete', label: '시작 → 완료', target: 70 },
  { from: 'quiz_complete', to: 'signup_complete', label: '완료 → 가입', target: 30 },
  { from: 'signup_complete', to: 'prereg_complete', label: '가입 → 사전신청', target: 30 },
]

export const SHARE_RATE_TARGET = 20

export const KPI_CARDS = [
  { name: 'quiz_view', label: '방문' },
  { name: 'quiz_complete', label: '검사 완료' },
  { name: 'signup_complete', label: '가입' },
  { name: 'prereg_complete', label: '사전신청' },
] as const

export type Period = 'today' | '7d' | '30d' | 'all'

export const PERIOD_LABELS: Record<Period, string> = {
  today: '오늘',
  '7d': '7일',
  '30d': '30일',
  all: '전체',
}

export function periodToSince(period: Period, now: Date): Date | null {
  const day = 24 * 60 * 60 * 1000
  if (period === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return start
  }
  if (period === '7d') return new Date(now.getTime() - 7 * day)
  if (period === '30d') return new Date(now.getTime() - 30 * day)
  return null
}
