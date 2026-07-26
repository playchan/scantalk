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

const MAX_PROPERTIES_BYTES = 1024

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

  const serialized = JSON.stringify(properties)
  if (serialized.length > MAX_PROPERTIES_BYTES) return

  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('st_sid')?.value ?? 'unknown'
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
