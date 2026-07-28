import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { getResultTypeDef } from '@/lib/quiz/marriage'
import { syncStageLabel } from '@/lib/bot/profile'
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

// v2 홈 (docs/09 전체 그림): 검사 → 봇 → 챗(자동사냥) → 매칭 퍼널을 한 화면에
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const nickname = user?.email?.split('@')[0] ?? '회원'

  const admin = createAdminClient()
  const [quizRes, botRes, chatsRes, preregRes, analysesRes] = await Promise.all([
    admin
      .from('quiz_results')
      .select('id, probability, result_type')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin.from('bots').select('id, nickname, sync_rate').eq('user_id', user!.id).maybeSingle(),
    admin
      .from('bot_chats')
      .select('id, affinity, partner_bot_id, bots!bot_chats_partner_bot_id_fkey (user_id)')
      .eq('user_id', user!.id),
    admin.from('preregistrations').select('id').eq('user_id', user!.id).maybeSingle(),
    supabase
      .from('analyses')
      .select('id, situation, payment_status, process_status, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const quiz = quizRes.data
  const bot = botRes.data
  const typeDef = quiz ? getResultTypeDef(quiz.result_type) : null
  const partnerChats = (chatsRes.data ?? []).filter((chat) => {
    const partner = chat.bots as unknown as { user_id: string } | null
    return partner?.user_id !== user!.id
  })
  const bestAffinity = partnerChats.reduce((max, chat) => Math.max(max, chat.affinity), 0)
  const analyses = (analysesRes.data ?? []) as AnalysisSummary[]

  return (
    <div className="space-y-5">
      {/* 인사 */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-400 rounded-2xl p-5 text-white">
        <p className="text-sm opacity-80">안녕하세요, {nickname}님</p>
        <p className="text-lg font-semibold mt-0.5">
          {bot ? '오늘도 봇이 당신 대신 뛰고 있어요' : '나의 AI봇을 만들어보세요'}
        </p>
        <p className="text-xs opacity-70 mt-2">
          검사 → 나의 AI봇 → 봇끼리 대화 → 진짜 매칭
        </p>
      </div>

      {/* STEP 1. 검사 결과 */}
      {quiz && typeDef ? (
        <Link
          href={`/quiz/marriage/result/${quiz.id}`}
          className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-rose-200 transition-colors"
        >
          <div>
            <p className="text-[11px] font-bold text-gray-400 mb-1">나의 결혼 확률</p>
            <p className="text-sm font-bold text-gray-900">
              {typeDef.emoji} {quiz.result_type}
            </p>
          </div>
          <span className="text-2xl font-extrabold text-rose-500">{quiz.probability}%</span>
        </Link>
      ) : (
        <Link
          href="/quiz/marriage"
          className="block bg-white rounded-2xl border border-dashed border-rose-200 p-5 text-center hover:bg-rose-50/50 transition-colors"
        >
          <p className="text-sm font-bold text-gray-900 mb-1">💍 내가 결혼할 확률은?</p>
          <p className="text-xs text-gray-400">검사를 완료하면 나의 AI봇이 만들어져요</p>
        </Link>
      )}

      {/* STEP 2. 나의 AI봇 */}
      {bot ? (
        <div className="bg-gray-950 rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[11px] text-gray-400 mb-0.5">나의 AI봇</p>
              <p className="font-bold">🤖 {bot.nickname}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-400 mb-0.5">싱크로율 · {syncStageLabel(bot.sync_rate)}</p>
              <p className="text-xl font-extrabold text-rose-400">{bot.sync_rate}%</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/chat"
              className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-center text-xs font-semibold transition-colors"
            >
              💬 챗 열기
            </Link>
            <Link
              href="/my-ai"
              className="py-2.5 rounded-xl border border-gray-700 hover:border-rose-400 text-center text-xs font-semibold transition-colors"
            >
              🤖 나의 AI 보기
            </Link>
          </div>
        </div>
      ) : quiz ? (
        <Link
          href="/chat"
          className="block bg-gray-950 rounded-2xl p-5 text-white text-center hover:opacity-90 transition-opacity"
        >
          <p className="text-sm font-bold mb-1">🤖 나의 AI봇 만들기</p>
          <p className="text-[11px] text-gray-400">검사 결과로 나를 닮은 봇이 자동 생성돼요</p>
        </Link>
      ) : null}

      {/* STEP 3. 대화 현황 */}
      {bot && (
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/chat"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:border-rose-200 transition-colors"
          >
            <p className="text-xl font-extrabold text-gray-900">{partnerChats.length}</p>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">대화 중인 상대</p>
          </Link>
          <Link
            href="/my-ai"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:border-rose-200 transition-colors"
          >
            <p className="text-xl font-extrabold text-rose-500">💗 {bestAffinity}%</p>
            <p className="text-[11px] text-gray-400 font-semibold mt-0.5">최고 호감도</p>
          </Link>
        </div>
      )}

      {/* STEP 4. 매칭 */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div>
          <p className="text-sm font-bold text-gray-900">💘 진짜 매칭</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            호감도 75% 도달 시 실제 대화가 열려요
          </p>
        </div>
        {preregRes.data ? (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
            사전신청 완료
          </span>
        ) : (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-400">
            준비 중
          </span>
        )}
      </div>

      {/* 유료 서비스 — 카톡 분석 (기존 MVP, 병행 판매) */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500">카톡 대화 분석 (유료)</h2>
          <Link href="/analysis" className="text-xs text-rose-500 hover:underline">
            전체 보기
          </Link>
        </div>

        {analyses.length === 0 ? (
          <Link
            href="/analysis/new"
            className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center hover:border-rose-200 transition-colors"
          >
            <p className="text-sm font-semibold text-gray-700 mb-1">📱 썸·연애 카톡, AI로 분석받기</p>
            <p className="text-xs text-gray-400">대화 캡처를 올리면 전문 리포트를 받아요</p>
          </Link>
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
