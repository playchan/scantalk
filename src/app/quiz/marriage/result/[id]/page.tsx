import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getResultTypeDef, AXIS_LABELS, type AxisKey } from '@/lib/quiz/marriage'
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
      description: '12개 질문, 90초. 나의 결혼 확률과 연애 유형을 확인해보세요',
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
  const axes = result.axes as Record<AxisKey, number>
  const maxAxisScore = Math.max(...Object.values(axes), 1)

  const { data: prereg } = await supabase
    .from('preregistrations')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white px-5 py-10">
      <div className="max-w-[420px] mx-auto">
        {/* 결과 헤더 */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-2">나의 결혼 확률은</p>
          <p className="text-7xl font-extrabold text-rose-500 mb-3">{result.probability}%</p>
          <h1 className="text-2xl font-bold text-gray-900">{result.result_type}</h1>
          {typeDef && (
            <p className="text-sm text-rose-400 font-semibold mt-1">"{typeDef.memeLine}"</p>
          )}
        </div>

        {/* 유형 설명 */}
        {typeDef && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{typeDef.summary}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-rose-500 font-semibold">💪 나의 강점</span>
              <span className="text-gray-700">{typeDef.strength}</span>
            </div>
          </div>
        )}

        {/* 성향 축 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-4">나의 연애 성향</h2>
          <div className="space-y-3">
            {(Object.keys(AXIS_LABELS) as AxisKey[]).map((axis) => (
              <div key={axis} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16">{AXIS_LABELS[axis]}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full"
                    style={{ width: `${Math.round((axes[axis] / maxAxisScore) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

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
