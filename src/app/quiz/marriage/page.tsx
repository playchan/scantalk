import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import QuizFlow from './QuizFlow'

export const metadata: Metadata = {
  title: '내가 결혼할 확률은? — 스캔톡',
  description: '12개 질문으로 알아보는 나의 결혼 확률. 90초면 충분해요.',
  openGraph: {
    title: '내가 결혼할 확률은?',
    description: '12개 질문, 90초. 재미로 보는 나의 결혼 확률 테스트',
  },
}

export default async function MarriageQuizPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <QuizFlow isLoggedIn={user !== null} />
}
