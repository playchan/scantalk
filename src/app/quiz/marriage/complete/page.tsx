import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CompleteClient from './CompleteClient'

// 가입 완료 후 복귀 지점 — sessionStorage의 응답을 서버에 저장하고 결과로 이동
export default async function QuizCompletePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect_to=/quiz/marriage/complete')

  return <CompleteClient />
}
