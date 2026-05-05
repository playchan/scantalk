'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type AuthState = { error: string } | { message: string } | null

function toKorean(message: string): string {
  if (message.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.'
  if (message.includes('Email not confirmed')) return '이메일 인증이 필요합니다. 받으신 메일을 확인해주세요.'
  if (message.includes('User already registered')) return '이미 가입된 이메일입니다.'
  if (message.includes('Password should be at least')) return '비밀번호는 6자 이상이어야 합니다.'
  if (message.includes('Unable to validate email address')) return '올바른 이메일 형식이 아닙니다.'
  return '오류가 발생했습니다. 다시 시도해주세요.'
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: toKorean(error.message) }

  redirect('/dashboard')
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) return { error: toKorean(error.message) }

  // 이메일 인증 비활성화 상태면 세션이 바로 생성됨
  if (data.session) redirect('/dashboard')

  return { message: '가입 이메일을 발송했습니다. 메일함을 확인해주세요.' }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
