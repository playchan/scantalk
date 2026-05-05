'use client'

import { useState, useRef } from 'react'
import { createAnalysis } from '@/app/actions/analysis'
import type { Product } from '@/types'

const SITUATIONS = ['썸', '소개팅', '연애', '재회'] as const

function StepHeader({
  step, total, title, onBack,
}: {
  step: number; total: number; title: string; onBack?: () => void
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        {onBack && (
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
        <span className="ml-auto text-xs text-gray-400">{step}/{total}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? 'bg-rose-400' : 'bg-gray-100'}`} />
        ))}
      </div>
    </div>
  )
}

export default function AnalysisForm({ products }: { products: Product[] }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [productId, setProductId] = useState('')
  const [situation, setSituation] = useState('')
  const [concern, setConcern] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const addImages = (files: FileList | null) => {
    if (!files) return
    const remaining = 5 - images.length
    const added = Array.from(files).slice(0, remaining)
    setImages((p) => [...p, ...added])
    setPreviews((p) => [...p, ...added.map((f) => URL.createObjectURL(f))])
  }

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i])
    setImages((p) => p.filter((_, idx) => idx !== i))
    setPreviews((p) => p.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    const fd = new FormData()
    fd.set('productId', productId)
    fd.set('situation', situation)
    fd.set('concern', concern)
    fd.set('privacyAgreed', 'true')
    images.forEach((img) => fd.append('images', img))
    const result = await createAnalysis(fd)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  /* ── Step 1: 상품 선택 ── */
  if (step === 1) return (
    <div className="space-y-5">
      <StepHeader step={1} total={3} title="상품 선택" />
      {products.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-10">등록된 상품이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setProductId(p.id)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${
                productId === p.id
                  ? 'border-rose-400 bg-rose-50'
                  : 'border-gray-100 bg-white hover:border-rose-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                </div>
                <p className="text-lg font-black text-rose-500 shrink-0 ml-3">
                  {p.price.toLocaleString()}원
                </p>
              </div>
              <ul className="flex flex-wrap gap-1.5 mt-3">
                {p.features.map((f) => (
                  <li key={f} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{f}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setStep(2)}
        disabled={!productId}
        className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-colors"
      >
        다음
      </button>
    </div>
  )

  /* ── Step 2: 상황 + 고민 ── */
  if (step === 2) return (
    <div className="space-y-5">
      <StepHeader step={2} total={3} title="상황과 고민 입력" onBack={() => setStep(1)} />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-5">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">현재 상황</p>
          <div className="grid grid-cols-2 gap-2">
            {SITUATIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSituation(s)}
                className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                  situation === s
                    ? 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-gray-100 text-gray-600 hover:border-rose-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">고민 내용</p>
          <p className="text-xs text-gray-400 mb-2">자세히 적을수록 더 정확한 분석이 가능합니다.</p>
          <textarea
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            placeholder="예: 3주째 썸 타고 있는데 갑자기 연락이 줄었어요. 제가 너무 자주 먼저 연락하는 게 부담이었을까요?"
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{concern.length}자</p>
        </div>
      </div>
      <button
        onClick={() => setStep(3)}
        disabled={!situation || concern.trim().length < 10}
        className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-colors"
      >
        다음
      </button>
    </div>
  )

  /* ── Step 3: 이미지 + 동의 ── */
  return (
    <div className="space-y-5">
      <StepHeader step={3} total={3} title="카톡 캡처 업로드" onBack={() => setStep(2)} />

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-1">업로드 전 반드시 확인하세요</p>
        <ul className="text-xs text-amber-600 space-y-1">
          <li>• 상대방 이름, 얼굴, 전화번호를 가려주세요</li>
          <li>• 카카오톡 ID, 계정 정보도 가려주세요</li>
          <li>• 최대 5장까지 업로드 가능합니다</li>
        </ul>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square">
              <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
          {previews.length < 5 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-colors"
            >
              <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs">사진 추가</span>
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => addImages(e.target.files)} />
        <p className="text-xs text-gray-400 text-center">{previews.length}/5장</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={privacyAgreed}
            onChange={(e) => setPrivacyAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-rose-500"
          />
          <p className="text-sm text-gray-700 leading-relaxed">
            상대방의 개인정보(이름, 얼굴, 연락처 등)를 모두 가리고 업로드했습니다. 개인정보 보호 정책에 동의합니다.
          </p>
        </label>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !privacyAgreed || images.length === 0}
        className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-sm font-bold rounded-2xl transition-colors"
      >
        {submitting ? '신청 중...' : '분석 신청하기'}
      </button>
    </div>
  )
}
