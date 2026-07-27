import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getResultTypeDef, type AxisKey } from '@/lib/quiz/marriage'
import ResultContent from '../../ResultContent'
import ShareActions from './ShareActions'
import PreregSection from './PreregSection'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  return {
    title: '내가 결혼할 확률은? — 스캔톡',
    openGraph: {
      title: '내가 결혼할 확률은?',
      description: '24개 질문으로 알아보는 나의 결혼 확률과 연애 유형',
      images: [{ url: `${siteUrl}/api/og/marriage/${id}`, width: 1080, height: 1080 }],
    },
  }
}

export default async function QuizResultPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?redirect_to=/quiz/marriage/result/${id}`)

  // RLS로 본인 결과만 조회됨 — 타인 결과 접근 시 not found
  const { data: result } = await supabase
    .from('quiz_results')
    .select('id, probability, result_type, axes, created_at')
    .eq('id', id)
    .single()

  if (!result) redirect('/quiz/marriage')

  const typeDef = getResultTypeDef(result.result_type)
  if (!typeDef) redirect('/quiz/marriage')

  const axes = result.axes as Record<AxisKey, number>

  const { data: prereg } = await supabase
    .from('preregistrations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white px-5 py-10">
      <div className="max-w-[420px] mx-auto">
        <ResultContent probability={result.probability} typeDef={typeDef} axes={axes} />

        {/* 공유 */}
        <ShareActions resultId={result.id} />

        {/* 사전신청 CTA */}
        <PreregSection quizResultId={result.id} alreadyRegistered={prereg !== null} />

        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          이 결과는 재미를 위한 검사로, 실제 미래를 예측하지 않습니다.
        </p>
      </div>
    </main>
  )
}
