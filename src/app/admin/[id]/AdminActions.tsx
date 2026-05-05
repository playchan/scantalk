'use client'

import { useState, useTransition } from 'react'
import {
  updatePaymentStatus,
  updateProcessStatus,
  generateAiDraft,
  saveReport,
} from '@/app/actions/admin'
import type { PaymentStatus, ProcessStatus, Report } from '@/types'

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'pending', label: '미결제' },
  { value: 'paid', label: '결제완료' },
  { value: 'refunded', label: '환불' },
]

const PROCESS_OPTIONS: { value: ProcessStatus; label: string }[] = [
  { value: 'waiting', label: '대기중' },
  { value: 'analyzing', label: '분석중' },
  { value: 'reviewing', label: '검수중' },
  { value: 'done', label: '완료' },
]

interface Props {
  analysisId: string
  paymentStatus: PaymentStatus
  processStatus: ProcessStatus
  report: Report | null
}

export default function AdminActions({
  analysisId,
  paymentStatus,
  processStatus,
  report,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [aiLoading, setAiLoading] = useState(false)
  const [finalContent, setFinalContent] = useState(
    report?.final_content ?? '',
  )
  const [isPublished, setIsPublished] = useState(report?.is_published ?? false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const showToast = (type: 'ok' | 'err', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3000)
  }

  const handlePayment = (status: PaymentStatus) => {
    startTransition(async () => {
      const { error } = await updatePaymentStatus(analysisId, status)
      if (error) showToast('err', error)
      else showToast('ok', '결제 상태가 변경되었습니다.')
    })
  }

  const handleProcess = (status: ProcessStatus) => {
    startTransition(async () => {
      const { error } = await updateProcessStatus(analysisId, status)
      if (error) showToast('err', error)
      else showToast('ok', '처리 상태가 변경되었습니다.')
    })
  }

  const handleGenerateAi = async () => {
    setAiLoading(true)
    const { error, draft } = await generateAiDraft(analysisId)
    setAiLoading(false)

    if (error) {
      showToast('err', error)
      return
    }

    showToast('ok', 'AI 초안이 생성되었습니다.')

    if (draft) {
      try {
        const p = JSON.parse(draft)
        const lines = [
          `【상황 요약】\n${p.situation_summary ?? ''}`,
          `【관심도】${p.interest_level ?? ''}`,
          `【긍정 신호】\n${(p.positive_signals ?? []).map((s: string) => `• ${s}`).join('\n')}`,
          `【주의 신호】\n${(p.negative_signals ?? []).map((s: string) => `• ${s}`).join('\n')}`,
          `【하지 말 것】\n${(p.do_not_do ?? []).map((s: string) => `• ${s}`).join('\n')}`,
          `【추천 답장】\n${(p.reply_suggestions ?? []).map((s: string) => `• ${s}`).join('\n')}`,
          `【3일 코칭】\n${p.coaching_3days ?? ''}`,
          `【전체 방향】\n${p.direction ?? ''}`,
        ]
        setFinalContent(lines.join('\n\n'))
      } catch {
        setFinalContent(draft)
      }
    }
  }

  const handleSave = () => {
    startTransition(async () => {
      const { error } = await saveReport(analysisId, {
        final_content: finalContent,
        is_published: isPublished,
      })
      if (error) showToast('err', error)
      else showToast('ok', isPublished ? '리포트가 공개되었습니다.' : '리포트가 저장되었습니다.')
    })
  }

  return (
    <div className="space-y-4">
      {/* 상태 관리 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">상태 관리</h2>

        <div>
          <p className="text-xs text-gray-400 mb-2">결제 상태</p>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handlePayment(opt.value)}
                disabled={isPending || opt.value === paymentStatus}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-colors disabled:opacity-50 ${
                  opt.value === paymentStatus
                    ? 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-gray-100 text-gray-600 hover:border-rose-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">처리 상태</p>
          <div className="flex gap-2 flex-wrap">
            {PROCESS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleProcess(opt.value)}
                disabled={isPending || opt.value === processStatus}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border-2 transition-colors disabled:opacity-50 ${
                  opt.value === processStatus
                    ? 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-gray-100 text-gray-600 hover:border-rose-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI 초안 + 최종 리포트 */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">리포트 작성</h2>
          <button
            onClick={handleGenerateAi}
            disabled={aiLoading || isPending}
            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            {aiLoading ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                생성 중...
              </>
            ) : (
              'AI 초안 생성'
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400">
          {report?.ai_draft
            ? 'AI 초안이 있습니다. 다시 생성하면 덮어씁니다.'
            : '아직 AI 초안이 없습니다. 버튼을 눌러 생성하세요.'}
        </p>

        <div>
          <p className="text-xs text-gray-400 mb-1.5">최종 리포트 (직접 수정 가능)</p>
          <textarea
            value={finalContent}
            onChange={(e) => setFinalContent(e.target.value)}
            rows={14}
            placeholder="AI 초안을 생성하거나 직접 입력하세요."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 accent-rose-500"
          />
          <span className="text-sm text-gray-700">사용자에게 리포트 공개</span>
        </label>

        <button
          onClick={handleSave}
          disabled={isPending || !finalContent.trim()}
          className="w-full py-3 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-colors"
        >
          {isPending ? '저장 중...' : '리포트 저장'}
        </button>
      </div>

      {/* 토스트 */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl text-sm font-medium shadow-lg z-50 whitespace-nowrap ${
            toast.type === 'ok' ? 'bg-gray-900 text-white' : 'bg-rose-500 text-white'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  )
}
