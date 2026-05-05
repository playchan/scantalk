import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MatchingForm from './MatchingForm'
import type { MatchStatus } from '@/types'

const STATUS_INFO: Record<MatchStatus, { label: string; desc: string; color: string }> = {
  pending:   {
    label: '검토 대기 중',
    desc: '신청이 접수되었습니다. 담당자가 검토 후 연락드립니다.',
    color: 'bg-amber-50 border-amber-100 text-amber-700',
  },
  reviewing: {
    label: '매칭 진행 중',
    desc: '적합한 분을 찾고 있습니다. 조금만 기다려 주세요.',
    color: 'bg-blue-50 border-blue-100 text-blue-700',
  },
  matched:   {
    label: '매칭 완료',
    desc: '매칭이 완료되었습니다! 카카오 채널로 연락드렸습니다.',
    color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  },
  closed:    {
    label: '종료된 신청',
    desc: '해당 매칭 신청이 종료되었습니다.',
    color: 'bg-gray-50 border-gray-100 text-gray-500',
  },
}

const TYPE_EMOJI: Record<string, string> = {
  적극형: '🔥',
  신중형: '💙',
  자유형: '🌿',
  분석형: '🔍',
}

export default async function MatchingPage({
  searchParams,
}: {
  searchParams: Promise<{ applied?: string }>
}) {
  const { applied } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 기존 매칭 신청 (활성 상태 우선)
  const { data: matchRequest } = await supabase
    .from('match_requests')
    .select('id, status, note, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 성향 테스트 최신 결과
  const { data: loveTest } = await supabase
    .from('love_tests')
    .select('result_type, result_summary, id')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // 완료된 분석 건수 (신뢰 지표)
  const { count: doneCount } = await supabase
    .from('analyses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .eq('process_status', 'done')

  const activeStatuses: MatchStatus[] = ['pending', 'reviewing', 'matched']
  const hasActiveRequest =
    matchRequest && activeStatuses.includes(matchRequest.status as MatchStatus)

  /* ── 신청 완료 후 리다이렉트 ── */
  if (applied === '1' || hasActiveRequest) {
    const status = matchRequest?.status as MatchStatus
    const info = STATUS_INFO[status] ?? STATUS_INFO.pending

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">매칭 신청</h1>
        </div>

        <div className={`rounded-2xl border p-5 ${info.color}`}>
          <p className="text-sm font-bold mb-1">{info.label}</p>
          <p className="text-xs leading-relaxed">{info.desc}</p>
        </div>

        {loveTest && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-1">내 연애 성향</p>
            <p className="text-base font-bold text-gray-900">
              {TYPE_EMOJI[loveTest.result_type] ?? ''} {loveTest.result_type}
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
              {loveTest.result_summary}
            </p>
          </div>
        )}

        {matchRequest?.note && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-2">내가 남긴 자기소개</p>
            <p className="text-sm text-gray-700 leading-relaxed">{matchRequest.note}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-4">
          <ul className="space-y-2 text-xs text-gray-500">
            <li className="flex gap-2">
              <span className="text-rose-400 shrink-0">•</span>
              매칭 완료 시 카카오 채널 <strong>@스캔톡</strong>으로 안내드립니다
            </li>
            <li className="flex gap-2">
              <span className="text-rose-400 shrink-0">•</span>
              매칭은 신청 순서대로 진행됩니다
            </li>
          </ul>
        </div>

        <Link
          href="/dashboard"
          className="block text-center py-3.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          대시보드로
        </Link>
      </div>
    )
  }

  /* ── 신청 폼 ── */
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-gray-900">매칭 신청</h1>
      </div>

      {/* 소개 */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-400 rounded-2xl p-5 text-white">
        <p className="text-base font-bold mb-1">진짜 인연을 찾아드립니다</p>
        <p className="text-xs opacity-80 leading-relaxed">
          성향 테스트 결과를 바탕으로<br />
          잘 맞는 분을 직접 연결해 드립니다.
        </p>
      </div>

      {/* 내 성향 */}
      {loveTest ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 mb-1">매칭에 활용될 내 성향</p>
          <p className="text-base font-bold text-gray-900">
            {TYPE_EMOJI[loveTest.result_type] ?? ''} {loveTest.result_type}
          </p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{loveTest.result_summary}</p>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-amber-700 mb-1">성향 테스트를 먼저 해주세요</p>
          <p className="text-xs text-amber-600 mb-3 leading-relaxed">
            성향 테스트 결과가 있으면 더 정확한 매칭이 가능합니다.
          </p>
          <Link
            href="/test"
            className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors"
          >
            성향 테스트 하러 가기
          </Link>
        </div>
      )}

      {/* 분석 완료 건수 뱃지 */}
      {(doneCount ?? 0) > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 rounded-2xl border border-rose-100">
          <span className="text-rose-400 text-lg">✓</span>
          <p className="text-xs text-rose-600">
            카톡 분석 완료 <strong>{doneCount}건</strong> — 분석 기반 매칭에 우선 참여합니다
          </p>
        </div>
      )}

      {/* 안내 */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <ul className="space-y-2 text-xs text-gray-500">
          <li className="flex gap-2">
            <span className="text-rose-400 shrink-0">•</span>
            매칭 완료 시 카카오 채널 <strong>@스캔톡</strong>으로 안내드립니다
          </li>
          <li className="flex gap-2">
            <span className="text-rose-400 shrink-0">•</span>
            신청 후 취소를 원하시면 카카오 채널로 문의해 주세요
          </li>
          <li className="flex gap-2">
            <span className="text-rose-400 shrink-0">•</span>
            중복 신청은 불가합니다
          </li>
        </ul>
      </div>

      <MatchingForm />
    </div>
  )
}
