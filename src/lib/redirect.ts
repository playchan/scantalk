// 오픈 리다이렉트 방지 — 내부 경로만 허용.
// 주의: 브라우저는 상대 경로의 '\'를 '/'로 정규화하므로 '/\evil.com'은
// '//evil.com'과 동일하게 외부로 나간다. 백슬래시도 반드시 차단해야 한다.
const SAFE_INTERNAL_PATH = /^\/(?![/\\])/

export function safeRedirectPath(
  value: FormDataEntryValue | string | null,
  fallback = '/dashboard',
): string {
  const path = typeof value === 'string' ? value : ''
  if (SAFE_INTERNAL_PATH.test(path)) return path
  return fallback
}
