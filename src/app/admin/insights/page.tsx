import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  FUNNEL_STEPS,
  KPI_CARDS,
  PERIOD_LABELS,
  SHARE_RATE_TARGET,
  periodToSince,
  type Period,
} from '@/lib/quiz/kpi'

// MVP 규모(수만 건 이하) 전제의 인메모리 집계 — 초과 시 서버 집계로 전환 (docs/10 8번)
const FETCH_LIMIT = 50000

interface EventRow {
  session_id: string
  name: string
  utm_source: string | null
}

interface PageProps {
  searchParams: Promise<{ period?: string }>
}

function uniqueSessions(rows: EventRow[], name: string): number {
  const set = new Set<string>()
  rows.forEach((r) => {
    if (r.name === name) set.add(r.session_id)
  })
  return set.size
}

function rate(numerator: number, denominator: number): number | null {
  if (denominator === 0) return null
  return Math.round((numerator / denominator) * 100)
}

export default async function InsightsPage({ searchParams }: PageProps) {
  const { period: rawPeriod } = await searchParams
  const period: Period = (['today', '7d', '30d', 'all'] as const).includes(rawPeriod as Period)
    ? (rawPeriod as Period)
    : '7d'

  const since = periodToSince(period, new Date())

  const admin = createAdminClient()
  let query = admin
    .from('events')
    .select('session_id, name, utm_source')
    .limit(FETCH_LIMIT)
  if (since) query = query.gte('created_at', since.toISOString())

  const { data, error } = await query
  const rows: EventRow[] = data ?? []

  const counts = Object.fromEntries(
    KPI_CARDS.map((c) => [c.name, uniqueSessions(rows, c.name)]),
  ) as Record<string, number>

  const shareClicks = uniqueSessions(rows, 'share_click')
  const shareRate = rate(shareClicks, uniqueSessions(rows, 'quiz_complete'))

  // 채널별 방문·가입 (utm_source 기준)
  const channelMap = new Map<string, { visits: Set<string>; signups: Set<string> }>()
  rows.forEach((r) => {
    const channel = r.utm_source ?? '(직접 유입)'
    if (!channelMap.has(channel)) {
      channelMap.set(channel, { visits: new Set(), signups: new Set() })
    }
    const entry = channelMap.get(channel)!
    if (r.name === 'quiz_view') entry.visits.add(r.session_id)
    if (r.name === 'signup_complete') entry.signups.add(r.session_id)
  })
  const channels = [...channelMap.entries()]
    .map(([channel, sets]) => ({ channel, visits: sets.visits.size, signups: sets.signups.size }))
    .sort((a, b) => b.visits - a.visits)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">인사이트</h1>
        {/* 기간 필터 */}
        <div className="flex gap-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <Link
              key={p}
              href={`/admin/insights?period=${p}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                period === p
                  ? 'bg-gray-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600">
          데이터를 불러오지 못했습니다. events 테이블 마이그레이션이 실행되었는지 확인해주세요.
        </div>
      )}

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KPI_CARDS.map((card) => (
          <div key={card.name} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900">{counts[card.name].toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 퍼널 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">퍼널 전환율 (목표 대비)</h2>
        <div className="space-y-4">
          {FUNNEL_STEPS.map((step) => {
            const from = uniqueSessions(rows, step.from)
            const to = uniqueSessions(rows, step.to)
            const value = rate(to, from)
            const passed = value !== null && value >= step.target
            return (
              <div key={step.label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-gray-700">{step.label}</span>
                  <span className={value === null ? 'text-gray-400' : passed ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                    {value === null ? '데이터 없음' : `${value}% / 목표 ${step.target}% ${passed ? '✅' : '❌'}`}
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${passed ? 'bg-emerald-500' : 'bg-rose-400'}`}
                    style={{ width: `${Math.min(value ?? 0, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
          {/* 공유율 */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-gray-700">완료자 공유율</span>
              <span className={shareRate === null ? 'text-gray-400' : shareRate >= SHARE_RATE_TARGET ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
                {shareRate === null ? '데이터 없음' : `${shareRate}% / 목표 ${SHARE_RATE_TARGET}% ${shareRate >= SHARE_RATE_TARGET ? '✅' : '❌'}`}
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${(shareRate ?? 0) >= SHARE_RATE_TARGET ? 'bg-emerald-500' : 'bg-rose-400'}`}
                style={{ width: `${Math.min(shareRate ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 채널별 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">채널별 유입 (utm_source)</h2>
        {channels.length === 0 ? (
          <p className="text-sm text-gray-400">아직 데이터가 없습니다.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">채널</th>
                <th className="text-right pb-2 font-medium">방문</th>
                <th className="text-right pb-2 font-medium">가입</th>
                <th className="text-right pb-2 font-medium">전환율</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.channel} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 font-medium text-gray-700">{c.channel}</td>
                  <td className="py-2.5 text-right text-gray-600">{c.visits.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-gray-600">{c.signups.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-gray-600">
                    {rate(c.signups, c.visits) === null ? '—' : `${rate(c.signups, c.visits)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        기준 데이터: 자체 events 테이블 (세션 단위 고유 집계) · 심층 분석은 PostHog(퍼널·리코딩), GA4(채널)에서
      </p>
    </div>
  )
}
