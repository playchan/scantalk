import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { PaymentStatus, ProcessStatus } from '@/types'

const INTEREST_STYLE: Record<string, { label: string; cls: string }> = {
  높음:       { label: '높음',       cls: 'bg-rose-100 text-rose-600' },
  보통:       { label: '보통',       cls: 'bg-amber-100 text-amber-600' },
  낮음:       { label: '낮음',       cls: 'bg-gray-100 text-gray-500' },
  판단어려움: { label: '판단 어려움', cls: 'bg-blue-100 text-blue-500' },
}

const PROCESS_STEP: Record<ProcessStatus, { step: number; label: string; desc: string }> = {
  waiting:   { step: 1, label: '결제 확인 중',   desc: '입금 확인 후 분석을 시작합니다.' },
  analyzing: { step: 2, label: 'AI 분석 중',     desc: '대화 패턴을 분석하고 있습니다.' },
  reviewing: { step: 3, label: '전문가 검수 중', desc: '최종 리포트를 다듬고 있습니다.' },
  done:      { step: 4, label: '분석 완료',       desc: '리포트가 완성되었습니다.' },
}

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: analysis } = await supabase
    .from('analyses')
    .select(`
      id, situation, concern, payment_status, process_status, created_at,
      product:products(name, price)
    `)
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!analysis) notFound()

  const { data: report } = await supabase
    .from('reports')
    .select('*')
    .eq('analysis_id', id)
    .eq('is_published', true)
    .single()

  const product = Array.isArray(analysis.product) ? analysis.product[0] : analysis.product
  const processStatus = analysis.process_status as ProcessStatus
  const paymentStatus = analysis.payment_status as PaymentStatus
  const step = PROCESS_STEP[processStatus]
  const shortId = id.slice(0, 8).toUpperCase()

  /* ── 리포트 미공개: 대기 화면 ── */
  if (!report) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">분석 현황</h1>
          <span className="text-xs text-gray-400 ml-auto">{shortId}</span>
        </div>

        {/* 진행 단계 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-rose-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base font-bold text-gray-900 mb-1">{step.label}</p>
          <p className="text-sm text-gray-400">{step.desc}</p>

          {/* 단계 바 */}
          <div className="flex items-center gap-1 mt-5">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-1.5 flex-1 rounded-full ${n <= step.step ? 'bg-rose-400' : 'bg-gray-100'}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>결제확인</span>
            <span>분석</span>
            <span>검수</span>
            <span>완료</span>
          </div>
        </div>

        {/* 신청 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">상품</span>
            <span className="font-medium text-gray-800">{product?.name ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">상황</span>
            <span className="font-medium text-gray-800">{analysis.situation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">결제 상태</span>
            <span className={`font-medium ${paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-500'}`}>
              {paymentStatus === 'paid' ? '결제 완료' : '결제 대기'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">신청일</span>
            <span className="font-medium text-gray-800">
              {new Date(analysis.created_at).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        {paymentStatus === 'pending' && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1">입금을 아직 확인 중이에요</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              카카오톡 채널 <strong>@스캔톡</strong>으로<br />
              <strong>신청번호({shortId}) + 입금 금액</strong>을 보내주시면 더 빠르게 확인됩니다.
            </p>
          </div>
        )}

        <p className="text-xs text-center text-gray-400">
          결제 확인 후 24시간 내 리포트가 제공됩니다.<br />
          완료 시 카카오 채널로 알림을 드립니다.
        </p>

        <Link
          href="/dashboard"
          className="block text-center py-3.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          대시보드로
        </Link>
      </div>
    )
  }

  /* ── 리포트 공개: 결과 화면 ── */
  const interest = INTEREST_STYLE[report.interest_level ?? ''] ?? INTEREST_STYLE['판단어려움']

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900">분석 리포트</h1>
        <span className="text-xs text-gray-400 ml-auto">{shortId}</span>
      </div>

      {/* 헤더 카드 */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-400 rounded-2xl p-5 text-white">
        <p className="text-xs opacity-70 mb-1">
          {new Date(analysis.created_at).toLocaleDateString('ko-KR')} · {product?.name}
        </p>
        <p className="text-lg font-bold">
          {analysis.situation} 상황 분석 리포트
        </p>
        {report.interest_level && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs opacity-80">상대 관심도</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${interest.cls}`}>
              {interest.label}
            </span>
          </div>
        )}
      </div>

      {/* 상황 요약 */}
      {report.situation_summary && (
        <Section title="대화 상황 요약">
          <p className="text-sm text-gray-700 leading-relaxed">{report.situation_summary}</p>
        </Section>
      )}

      {/* 긍정 신호 */}
      {report.positive_signals?.length > 0 && (
        <Section title="긍정적인 신호">
          <ul className="space-y-2">
            {report.positive_signals.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 주의 신호 */}
      {report.negative_signals?.length > 0 && (
        <Section title="주의해야 할 신호">
          <ul className="space-y-2">
            {report.negative_signals.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  !
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 하지 말 것 */}
      {report.do_not_do?.length > 0 && (
        <Section title="이것만은 하지 마세요">
          <ul className="space-y-2">
            {report.do_not_do.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✕
                </span>
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 추천 답장 */}
      {report.reply_suggestions?.length > 0 && (
        <Section title="추천 답장 예시">
          <div className="space-y-2">
            {report.reply_suggestions.map((s: string, i: number) => (
              <div key={i} className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                "{s}"
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 3일 코칭 */}
      {report.coaching_3days && (
        <Section title="3일 행동 코칭">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {report.coaching_3days}
          </p>
        </Section>
      )}

      {/* 전체 방향 */}
      {report.direction && (
        <Section title="전체 방향 조언" highlight>
          <p className="text-sm text-gray-700 leading-relaxed">{report.direction}</p>
        </Section>
      )}

      {/* final_content (구조화 필드 없을 때만 표시) */}
      {report.final_content && !report.situation_summary && (
        <Section title="분석 리포트">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {report.final_content}
          </p>
        </Section>
      )}

      {/* CTA */}
      <div className="space-y-3 pt-2">
        <Link
          href="/matching"
          className="block text-center py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-2xl transition-colors"
        >
          매칭 신청하기
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

function Section({
  title,
  children,
  highlight = false,
}: {
  title: string
  children: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border shadow-sm p-5 ${
        highlight
          ? 'bg-rose-50 border-rose-100'
          : 'bg-white border-gray-100'
      }`}
    >
      <h2 className="text-sm font-semibold text-gray-800 mb-3">{title}</h2>
      {children}
    </div>
  )
}
