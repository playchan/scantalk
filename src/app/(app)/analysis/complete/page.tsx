import Link from 'next/link'

export default async function AnalysisCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  const shortId = id?.slice(0, 8).toUpperCase() ?? '-'

  return (
    <div className="space-y-5">
      {/* 완료 */}
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">신청이 완료되었습니다</h1>
        <p className="text-sm text-gray-400">신청번호: <span className="font-semibold text-gray-700">{shortId}</span></p>
      </div>

      {/* 결제 안내 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">결제 안내</h2>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">계좌번호</span>
            <span className="font-semibold text-gray-900">카카오뱅크 0000-00-0000000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">예금주</span>
            <span className="font-semibold text-gray-900">홍길동</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">입금자명</span>
            <span className="font-semibold text-rose-500">{shortId}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 p-3 bg-gray-50 rounded-xl leading-relaxed">
          입금자명을 반드시 <strong className="text-gray-700">{shortId}</strong>로 입력해주세요. 확인이 빨라집니다.
        </p>
      </div>

      {/* 카카오 채널 안내 */}
      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-2">카카오 채널로 알려주세요</h2>
        <p className="text-xs text-gray-600 leading-relaxed">
          입금 후 카카오톡 채널 <strong>@스캔톡</strong>으로<br />
          <strong>신청번호({shortId}) + 입금 금액</strong>을 보내주시면<br />
          결제 확인 후 분석을 바로 시작합니다.
        </p>
      </div>

      {/* 처리 안내 */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <ul className="space-y-2 text-xs text-gray-500">
          <li className="flex gap-2">
            <span className="text-rose-400 shrink-0">•</span>
            결제 확인 후 24시간 내 분석 리포트가 제공됩니다
          </li>
          <li className="flex gap-2">
            <span className="text-rose-400 shrink-0">•</span>
            리포트 완료 시 카카오 채널로 알림을 드립니다
          </li>
          <li className="flex gap-2">
            <span className="text-rose-400 shrink-0">•</span>
            분석 결과는 마이페이지에서 확인할 수 있습니다
          </li>
        </ul>
      </div>

      <Link
        href="/dashboard"
        className="block text-center py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-2xl transition-colors"
      >
        대시보드로 이동
      </Link>
    </div>
  )
}
