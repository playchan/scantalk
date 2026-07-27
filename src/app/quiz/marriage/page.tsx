import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import QuizFlow from './QuizFlow'

export const metadata: Metadata = {
  title: '내가 결혼할 확률은? — 스캔톡',
  description: '수많은 사람들의 통계 기반으로 알아보는 나의 결혼 확률과 12가지 연애 유형.',
  openGraph: {
    title: '내가 결혼할 확률은?',
    description: '수많은 사람들의 통계 기반 결혼 확률 테스트 · 12가지 연애 유형',
  },
}

export default async function MarriageQuizPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <QuizFlow isLoggedIn={user !== null} />
}
