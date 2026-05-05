import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { PaymentStatus, ProcessStatus } from '@/types'

const PAYMENT_BADGE: Record<PaymentStatus, { label: string; className: string }> = {
  pending:  { label: '미결제',   className: 'bg-yellow-100 text-yellow-700' },
  paid:     { label: '결제완료', className: 'bg-green-100 text-green-700' },
  refunded: { label: '환불',     className: 'bg-gray-100 text-gray-500' },
}

const PROCESS_BADGE: Record<ProcessStatus, { label: string; className: string }> = {
  waiting:   { label: '대기중', className: 'bg-gray-100 text-gray-500' },
  analyzing: { label: '분석중', className: 'bg-blue-100 text-blue-700' },
  reviewing: { label: '검수중', className: 'bg-purple-100 text-purple-700' },
  done:      { label: '완료',   className: 'bg-emerald-100 text-emerald-700' },
}

export default async function AdminPage() {
  const admin = createAdminClient()

  const { data: analyses } = await admin
    .from('analyses')
    .select(`
      id, situation, payment_status, process_status, created_at,
      product:products(name),
      profile:profiles(email, nickname)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">분석 신청 목록</h1>
        <span className="text-sm text-gray-400">{analyses?.length ?? 0}건</span>
      </div>

      {!analyses || analyses.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-20">신청 내역이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => {
            const pay = PAYMENT_BADGE[a.payment_status as PaymentStatus] ?? PAYMENT_BADGE.pending
            const proc = PROCESS_BADGE[a.process_status as ProcessStatus] ?? PROCESS_BADGE.waiting
            const profile = Array.isArray(a.profile) ? a.profile[0] : a.profile
            const product = Array.isArray(a.product) ? a.product[0] : a.product

            return (
              <Link
                key={a.id}
                href={`/admin/${a.id}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {profile?.nickname ?? profile?.email ?? '알 수 없음'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {product?.name} · {a.situation}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pay.className}`}>
                      {pay.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${proc.className}`}>
                      {proc.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-300">{a.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-300">
                    {new Date(a.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
