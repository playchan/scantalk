'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function Field() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect_to') ?? ''
  if (!redirectTo) return null
  return <input type="hidden" name="redirect_to" value={redirectTo} />
}

// 로그인/가입 폼에서 ?redirect_to= 를 hidden input으로 전달
export default function RedirectField() {
  return (
    <Suspense fallback={null}>
      <Field />
    </Suspense>
  )
}
