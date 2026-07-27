import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 로그인 없이 접근 가능한 경로
const PUBLIC_PATHS = ['/', '/login', '/signup', '/auth/callback']
// 하위 경로 전체가 공개인 프리픽스 (바이럴 검사, 공유 카드 이미지)
const PUBLIC_PREFIXES = ['/quiz', '/api/og', '/auth/']

const SESSION_COOKIE = 'st_sid'
const UTM_COOKIE = 'st_utm'
const ONE_YEAR = 60 * 60 * 24 * 365
const THIRTY_DAYS = 60 * 60 * 24 * 30

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, searchParams } = request.nextUrl
  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 익명 세션 ID — 가입 전후 퍼널을 하나로 연결하는 키 (docs/10 3번)
  if (!request.cookies.get(SESSION_COOKIE)) {
    supabaseResponse.cookies.set(SESSION_COOKIE, crypto.randomUUID(), {
      maxAge: ONE_YEAR,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  // UTM 첫 방문 캡처 (first-touch — 이미 있으면 덮어쓰지 않음)
  const utmSource = searchParams.get('utm_source')
  if (utmSource && !request.cookies.get(UTM_COOKIE)) {
    const utm = {
      source: utmSource.slice(0, 100),
      medium: searchParams.get('utm_medium')?.slice(0, 100) ?? null,
      campaign: searchParams.get('utm_campaign')?.slice(0, 100) ?? null,
      ref: searchParams.get('ref')?.slice(0, 100) ?? null,
    }
    supabaseResponse.cookies.set(UTM_COOKIE, JSON.stringify(utm), {
      maxAge: THIRTY_DAYS,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
