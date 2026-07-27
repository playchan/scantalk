import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import QuizFlow from './QuizFlow'

export const metadata: Metadata = {
  title: '내가 결혼할 확률은? — 스캔톡',
  description: '24개 질문으로 알아보는 나의 결혼 확률과 연애 유형. 5분 심층 테스트.',
  openGraph: {
    title: '내가 결혼할 확률은?',
    description: '24개 질문, 5분. 나의 연애 유형과 결혼 확률 심층 테스트',
  },
}

export default async function MarriageQuizPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <QuizFlow isLoggedIn={user !== null} />
}
