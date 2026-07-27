'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 허용 이벤트 8종 — 임의 추가 금지 (docs/10-v2-mvp-spec.md 7번)
const EVENT_NAMES = [
  'quiz_view',
  'quiz_start',
  'quiz_complete',
  'signup_start',
  'signup_complete',
  'result_view',
  'share_click',
  'prereg_complete',
] as const

export type EventName = (typeof EVENT_NAMES)[number]

type EventProperties = Record<string, string | number | boolean>

// 이벤트별 허용 속성 스키마 — 여기 없는 키/타입은 전부 거부 (PII 유입 차단)
const PROPERTY_SCHEMA: Record<EventName, Record<string, 'string' | 'number'>> = {
  quiz_view: {},
  quiz_start: {},
  quiz_complete: { probability: 'number', result_type: 'string' },
  signup_start: {},
  signup_complete: {},
  result_view: {},
  share_click: { method: 'string' },
  prereg_complete: {},
}

const MAX_PROPERTY_STRING_LENGTH = 100

// 세션당 속도 제한 — 인스턴스별 인메모리 (서버리스에선 인스턴스마다 별도 카운트지만
// 단일 세션의 남용을 막는 1차 방어로 충분. 초과 트래픽 발생 시 Upstash 등으로 교체)
const RATE_LIMIT_PER_MINUTE = 60
const RATE_WINDOW_MS = 60 * 1000
const rateBuckets = new Map<string, { count: number; windowStart: number }>()

function isRateLimited(sessionId: string, now: number): boolean {
  if (rateBuckets.size > 10000) rateBuckets.clear()

  const bucket = rateBuckets.get(sessionId)
  if (!bucket || now - bucket.windowStart > RATE_WINDOW_MS) {
    rateBuckets.set(sessionId, { count: 1, windowStart: now })
    return false
  }
  if (bucket.count >= RATE_LIMIT_PER_MINUTE) return true
  rateBuckets.set(sessionId, { ...bucket, count: bucket.count + 1 })
  return false
}

function isValidProperties(name: EventName, properties: EventProperties): boolean {
  const schema = PROPERTY_SCHEMA[name]
  return Object.entries(properties).every(([key, value]) => {
    const expected = schema[key]
    if (!expected) return false
    if (typeof value !== expected) return false
    return String(value).length <= MAX_PROPERTY_STRING_LENGTH
  })
}

interface UtmCookie {
  source?: string | null
  medium?: string | null
  campaign?: string | null
  ref?: string | null
}

function parseUtmCookie(raw: string | undefined): UtmCookie {
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed as UtmCookie
    return {}
  } catch {
    return {}
  }
}

export async function trackEvent(
  name: EventName,
  properties: EventProperties = {},
): Promise<void> {
  if (!EVENT_NAMES.includes(name)) return
  if (!isValidProperties(name, properties)) return

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('st_sid')?.value ?? 'unknown'

    if (isRateLimited(sessionId, Date.now())) return

    const utm = parseUtmCookie(cookieStore.get('st_utm')?.value)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const admin = createAdminClient()
    const { error } = await admin.from('events').insert({
      session_id: sessionId,
      user_id: user?.id ?? null,
      name,
      properties,
      utm_source: utm.source ?? null,
      utm_medium: utm.medium ?? null,
      utm_campaign: utm.campaign ?? null,
      ref: utm.ref ?? null,
    })

    if (error) {
      console.error('[trackEvent] insert failed:', name, error.message)
    }
  } catch (error: unknown) {
    // 측정 실패가 사용자 플로우를 막으면 안 됨 — 로그만 남긴다
    console.error('[trackEvent] unexpected error:', name, error)
  }
}
