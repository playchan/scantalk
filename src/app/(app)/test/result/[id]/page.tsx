import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const TYPE_INFO: Record<string, {
  traits: string[]
  advice: string
  bg: string
  text: string
  border: string
  badge: string
}> = {
  적극형: {
    traits: ['감정 표현이 솔직하고 직접적이에요', '관계 발전을 두려워하지 않아요', '호감을 빠르게 파악하고 행동해요'],
    advice: '상대방의 속도를 존중하며 다가가면 더 큰 효과를 볼 수 있어요.',
    bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', badge: 'bg-rose-500',
  },
  신중형: {
    traits: ['신뢰를 바탕으로 깊은 관계를 추구해요', '감정을 확신한 뒤 행동하는 스타일이에요', '상대방을 배려하는 섬세함이 있어요'],
    advice: '확신이 생겼을 때 용기 있게 표현해보세요.',
    bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', badge: 'bg-blue-500',
  },
  자유형: {
    traits: ['편안하고 자연스러운 분위기를 선호해요', '여유로운 태도가 상대방을 안심시켜요', '집착하지 않아 오히려 매력적이에요'],
    advice: '좋아하는 마음을 조금 더 표현하면 관계가 더 깊어져요.',
    bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', badge: 'bg-emerald-500',
  },
  분석형: {
    traits: ['상황을 정확하게 파악하는 능력이 있어요', '깊이 있는 대화를 추구해요', '논리적 접근으로 관계를 발전시켜요'],
    advice: '느끼는 감정도 솔직하게 표현해보는 연습을 해보세요.',
    bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', badge: 'bg-purple-500',
  },
}

export default async function TestResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('love_tests')
    .select('result_type, result_summary, created_at')
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!data) notFound()

  const info = TYPE_INFO[data.result_type] ?? TYPE_INFO['신중형']
  const date = new Date(data.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-5">
      {/* 결과 타입 카드 */}
      <div className={`rounded-2xl border p-6 text-center ${info.bg} ${info.border}`}>
        <p className="text-xs text-gray-400 mb-2">{date} 테스트 결과</p>
        <div className={`inline-block px-4 py-1.5 rounded-full text-white text-sm font-bold mb-3 ${info.badge}`}>
          {data.result_type}
        </div>
        <p className={`text-3xl font-black mb-4 ${info.text}`}>{data.result_type}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{data.result_summary}</p>
      </div>

      {/* 특징 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">나의 연애 특징</h2>
        <ul className="space-y-2.5">
          {info.traits.map((trait) => (
            <li key={trait} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${info.badge}`}>
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {trait}
            </li>
          ))}
        </ul>
      </div>

      {/* 조언 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">이런 점을 더 해보세요</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{info.advice}</p>
      </div>

      {/* CTA */}
      <div className="space-y-3 pt-2">
        <Link
          href="/analysis/new"
          className="block text-center py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-2xl transition-colors"
        >
          카톡 분석 신청하기
        </Link>
        <Link
          href="/dashboard"
          className="block text-center py-3.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          대시보드로
        </Link>
      </div>
    </div>
  )
}
