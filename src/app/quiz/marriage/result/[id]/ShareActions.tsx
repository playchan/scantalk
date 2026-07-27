'use client'

import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/app/actions/tracking'

interface ShareActionsProps {
  resultId: string
}

// 공유 링크는 결과가 아닌 검사 입구로 — 받은 사람이 자기 검사를 하게 한다
function buildShareUrl(resultId: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const ref = resultId.slice(0, 8)
  return `${origin}/quiz/marriage?utm_source=share&ref=${ref}`
}

export default function ShareActions({ resultId }: ShareActionsProps) {
  const [copied, setCopied] = useState(false)
  const viewTracked = useRef(false)

  useEffect(() => {
    if (viewTracked.current) return
    viewTracked.current = true
    void trackEvent('result_view')
  }, [])

  async function handleCopyLink() {
    const url = buildShareUrl(resultId)
    void trackEvent('share_click', { method: 'link' })
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard 미지원 브라우저 — prompt 로 대체
      window.prompt('아래 링크를 복사하세요', url)
    }
  }

  async function handleNativeShare() {
    const url = buildShareUrl(resultId)
    void trackEvent('share_click', { method: 'native' })
    if (navigator.share) {
      try {
        await navigator.share({
          title: '내가 결혼할 확률은?',
          text: '나의 연애 유형과 결혼 확률, 너도 해봐 👀',
          url,
        })
      } catch {
        // 사용자가 공유 취소 — 무시
      }
      return
    }
    await handleCopyLink()
  }

  function handleSaveImage() {
    void trackEvent('share_click', { method: 'image' })
    window.open(`/api/og/marriage/${resultId}`, '_blank')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
      <h2 className="text-sm font-bold text-gray-900 mb-4">친구에게 공유하기</h2>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={handleNativeShare}
          className="py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
        >
          공유하기
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="py-3 rounded-xl border border-gray-200 hover:border-rose-200 hover:bg-rose-50/50 text-gray-700 text-xs font-semibold transition-colors"
        >
          {copied ? '복사됨 ✓' : '링크 복사'}
        </button>
        <button
          type="button"
          onClick={handleSaveImage}
          className="py-3 rounded-xl border border-gray-200 hover:border-rose-200 hover:bg-rose-50/50 text-gray-700 text-xs font-semibold transition-colors"
        >
          이미지 저장
        </button>
      </div>
    </div>
  )
}
