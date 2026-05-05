'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn, type AuthState } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(signIn, null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center px-5 py-12">
      {/* 브랜드 */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-2xl font-bold">S</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">스캔톡</h1>
        <p className="text-sm text-gray-400 mt-1">AI 연애 분석 서비스</p>
      </div>

      {/* 카드 */}
      <div className="w-full max-w-[360px] bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">로그인</h2>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              이메일
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="비밀번호를 입력해주세요"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
            />
          </div>

          {'error' in (state ?? {}) && (
            <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600">
              {(state as { error: string }).error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors mt-1"
          >
            {isPending ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-rose-500 font-semibold hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  )
}
