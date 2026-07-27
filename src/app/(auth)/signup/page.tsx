'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp, type AuthState } from '@/app/actions/auth'
import RedirectField from '@/components/RedirectField'

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(signUp, null)

  const isSuccess = state !== null && 'message' in state

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
        {isSuccess ? (
          /* 이메일 인증 필요 안내 */
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">이메일을 확인해주세요</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              {(state as { message: string }).message}
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-sm text-rose-500 font-semibold hover:underline"
            >
              로그인 페이지로
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-5">회원가입</h2>

            <form action={formAction} className="space-y-4">
              <RedirectField />
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
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="6자 이상 입력해주세요"
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
                {isPending ? '가입 중...' : '가입하기'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-rose-500 font-semibold hover:underline">
                로그인
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
