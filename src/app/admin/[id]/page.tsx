import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminActions from './AdminActions'
import type { PaymentStatus, ProcessStatus, Report } from '@/types'

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: analysis } = await admin
    .from('analyses')
    .select(`
      id, situation, concern, payment_status, process_status, created_at,
      product:products(name, price),
      profile:profiles(email, nickname)
    `)
    .eq('id', id)
    .single()

  if (!analysis) notFound()

  const { data: images } = await admin
    .from('analysis_images')
    .select('storage_path, order_index')
    .eq('analysis_id', id)
    .order('order_index')

  const signedImages: { url: string; order: number }[] = []
  for (const img of images ?? []) {
    const { data } = await admin.storage
      .from('analysis-images')
      .createSignedUrl(img.storage_path, 3600)
    if (data?.signedUrl) {
      signedImages.push({ url: data.signedUrl, order: img.order_index })
    }
  }

  const { data: report } = await admin
    .from('reports')
    .select('*')
    .eq('analysis_id', id)
    .single()

  const profile = Array.isArray(analysis.profile) ? analysis.profile[0] : analysis.profile
  const product = Array.isArray(analysis.product) ? analysis.product[0] : analysis.product

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900">신청 상세</h1>
        <span className="text-xs text-gray-400 ml-auto">{id.slice(0, 8).toUpperCase()}</span>
      </div>

      {/* 신청자 정보 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">신청자 정보</h2>
        <div className="space-y-2">
          <InfoRow label="이메일" value={profile?.email ?? '-'} />
          <InfoRow label="닉네임" value={profile?.nickname ?? '-'} />
          <InfoRow
            label="상품"
            value={`${product?.name ?? '-'} (${product?.price != null ? product.price.toLocaleString() + '원' : '-'})`}
          />
          <InfoRow label="상황" value={analysis.situation} />
          <InfoRow
            label="신청일"
            value={new Date(analysis.created_at).toLocaleString('ko-KR')}
          />
        </div>
      </div>

      {/* 고민 내용 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">고민 내용</h2>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {analysis.concern}
        </p>
      </div>

      {/* 카톡 캡처 이미지 */}
      {signedImages.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            카톡 캡처 ({signedImages.length}장)
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {signedImages.map((img) => (
              <a
                key={img.order}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={img.url}
                  alt={`캡처 ${img.order}`}
                  className="w-full rounded-xl border border-gray-100 object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 관리 액션 */}
      <AdminActions
        analysisId={id}
        paymentStatus={analysis.payment_status as PaymentStatus}
        processStatus={analysis.process_status as ProcessStatus}
        report={report as Report | null}
      />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-800 font-medium text-right">{value}</span>
    </div>
  )
}
