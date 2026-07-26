'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QUIZ_SLUG, calcQuizResult, type Answers } from '@/lib/quiz/marriage'
import { trackEvent } from '@/app/actions/tracking'

export type QuizActionState = { error: string } | { success: true } | null

// 검사 결과 저장 — 가입 완료 후 호출됨 (응답은 sessionStorage에서 전달)
export async function saveQuizResult(answers: Answers): Promise<QuizActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect_to=/quiz/marriage/complete')

  const result = calcQuizResult(answers)
  if (!result) return { error: '검사 응답이 올바르지 않습니다. 검사를 다시 진행해주세요.' }

  const cookieStore = await cookies()
  const sessionId = cookieStore.get('st_sid')?.value ?? 'unknown'

  const { data, error } = await supabase
    .from('quiz_results')
    .insert({
      user_id: user.id,
      session_id: sessionId,
      quiz_slug: QUIZ_SLUG,
      answers,
      axes: result.axes,
      probability: result.probability,
      result_type: result.resultType,
    })
    .select('id')
    .single()

  if (error || !data) return { error: '결과 저장에 실패했습니다. 다시 시도해주세요.' }

  redirect(`/quiz/marriage/result/${data.id}`)
}

// "나와 어울리는 사람과 채팅하기" 사전신청 (1인 1건)
export async function preregister(
  _prev: QuizActionState,
  formData: FormData,
): Promise<QuizActionState> {
  const quizResultId = formData.get('quiz_result_id')
  if (typeof quizResultId !== 'string' || !quizResultId) {
    return { error: '잘못된 요청입니다.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { error } = await supabase.from('preregistrations').insert({
    user_id: user.id,
    quiz_result_id: quizResultId,
  })

  // unique 제약 위반(23505) = 이미 신청됨 → 성공으로 처리
  if (error && error.code !== '23505') {
    return { error: '신청에 실패했습니다. 다시 시도해주세요.' }
  }

  if (!error) {
    await trackEvent('prereg_complete')
  }

  return { success: true }
}
