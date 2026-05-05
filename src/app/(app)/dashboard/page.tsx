import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { PaymentStatus, ProcessStatus } from '@/types'

const PAYMENT_LABEL: Record<PaymentStatus, { label: string; cls: string }> = {
  pending:  { label: '결제 대기', cls: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  paid:     { label: '결제 완료', cls: 'bg-green-50 text-green-600 border-green-100' },
  refunded: { label: '환불',     cls: 'bg-gray-50 text-gray-400 border-gray-100' },
}

const PROCESS_LABEL: Record<ProcessStatus, { label: string; cls: string }> = {
  waiting:   { label: '대기중', cls: 'bg-blue-50 text-blue-500 border-blue-100' },
  analyzing: { label: '분석중', cls: 'bg-purple-50 text-purple-500 border-purple-100' },
  reviewing: { label: '검수중', cls: 'bg-orange-50 text-orange-500 border-orange-100' },
  done:      { label: '완료',   cls: 'bg-rose-50 text-rose-500 border-rose-100' },
}

type AnalysisSummary = {
  id: string
  situation: string
  payment_status: PaymentStatus
  process_status: ProcessStatus
  created_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('analyses')
    .select('id, situation, payment_status, process_status, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const analyses = (data ?? []) as AnalysisSummary[]
  const nickname = user?.email?.split('@')[0] ?? '회원'

  return (
    <div className="space-y-6">
      {/* 인사 카드 */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-400 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80">안녕하세요</p>
        <p className="text-lg font-semibold mt-0.5">{nickname}님</p>
        <p className="text-xs opacity-70 mt-2">오늘도 좋은 인연이 생기길 바랍니다</p>
      </div>

      {/* 빠른 메뉴 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">빠른 메뉴</h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickLink href="/analysis/new" icon={<ChatIcon />} label="카톡 분석" />
          <QuickLink href="/test" icon={<TestIcon />} label="성향 테스트" />
          <QuickLink href="/matching" icon={<HeartIcon />} label="매칭 신청" />
        </div>
      </section>

      {/* 최근 분석 내역 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500">최근 분석 내역</h2>
          <Link href="/analysis" className="text-xs text-rose-500 hover:underline">
            전체 보기
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-sm text-gray-400">아직 분석 신청 내역이 없어요</p>
            <Link
              href="/analysis/new"
              className="inline-block mt-4 px-5 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors"
            >
              첫 분석 신청하기
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {analyses.map((item) => {
              const pay = PAYMENT_LABEL[item.payment_status]
              const proc = PROCESS_LABEL[item.process_status]
              const date = new Date(item.created_at).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })
              return (
                <li key={item.id}>
                  <Link
                    href={`/analysis/${item.id}`}
                    className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 hover:border-rose-200 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-gray-800 shrink-0">
                        {item.situation}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${pay.cls}`}>
                        {pay.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${proc.cls}`}>
                        {proc.label}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 ml-2 shrink-0">{date}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:border-rose-200 transition-colors"
    >
      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-2">
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </Link>
  )
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  )
}

function TestIcon() {
  return (
    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}
