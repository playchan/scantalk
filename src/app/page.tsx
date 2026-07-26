import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const STEPS = [
  {
    num: '01',
    title: '카톡 캡처 업로드',
    desc: '상대방 정보를 가린 뒤 대화 스크린샷을 올려주세요. 개인정보는 안전하게 보호됩니다.',
  },
  {
    num: '02',
    title: 'AI 분석 시작',
    desc: '대화 패턴, 반응 속도, 표현 방식을 AI가 분석합니다. 전문가가 초안을 검수합니다.',
  },
  {
    num: '03',
    title: '리포트 확인',
    desc: '호감 신호, 코칭 전략, 답장 예시를 상세 리포트로 받아보세요.',
  },
]

const FEATURES = [
  { title: '호감 신호 분석', desc: '대화에서 상대방의 관심도와 감정 변화를 읽어냅니다.' },
  { title: '맞춤 코칭 플랜', desc: '3일·7일 단계별 전략으로 관계를 자연스럽게 발전시킵니다.' },
  { title: '답장 예시 제공', desc: '상황에 맞는 최적의 답변을 직접 예시로 보여드립니다.' },
  { title: '전문가 검수', desc: 'AI 분석 초안을 전문가가 확인해 신뢰도를 높입니다.' },
]

const PLANS = [
  {
    name: '기본 분석',
    price: '9,900',
    desc: '첫 분석에 딱 맞는 플랜',
    features: ['카톡 대화 분석', '호감도 측정', '3일 코칭 플랜', '전문가 검수'],
    highlight: false,
  },
  {
    name: '심층 분석',
    price: '19,900',
    desc: '완전한 솔루션이 필요할 때',
    features: ['기본 분석 전체 포함', '7일 코칭 플랜', '답장 예시 5개', '우선 처리'],
    highlight: true,
  },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ctaHref = user ? '/dashboard' : '/signup'
  const ctaLabel = user ? '대시보드로 이동' : '지금 시작하기'

  return (
    <div className="min-h-screen bg-white">
      {/* 내비게이션 */}
      <nav className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-[500px] mx-auto px-5 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-rose-500">스캔톡</span>
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors"
              >
                대시보드
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors"
                >
                  시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 바이럴 검사 배너 */}
      <Link
        href="/quiz/marriage"
        className="block bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 transition-colors"
      >
        <div className="max-w-[500px] mx-auto px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-white">
            💍 내가 결혼할 확률은? <span className="font-normal opacity-90">90초 무료 테스트</span>
          </span>
          <span className="text-white text-sm">→</span>
        </div>
      </Link>

      {/* 히어로 */}
      <section className="bg-gray-950 text-white px-5 pt-20 pb-24">
        <div className="max-w-[500px] mx-auto text-center">
          <span className="inline-block text-xs font-semibold tracking-widest text-rose-400 mb-4 uppercase">
            AI 연애 분석 서비스
          </span>
          <h1 className="text-4xl font-bold leading-tight mb-5">
            카톡 대화,<br />
            <span className="text-rose-400">AI로 분석</span>하다
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-8">
            썸·소개팅·연애·재회<br />
            상황별 맞춤 분석으로 연애의 답을 찾아드립니다
          </p>
          <Link
            href={ctaHref}
            className="inline-block px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white text-base font-bold rounded-2xl transition-colors"
          >
            {ctaLabel}
          </Link>
          <p className="text-xs text-gray-500 mt-4">24시간 내 분석 리포트 제공</p>
        </div>
      </section>

      {/* 작동 방식 */}
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-[500px] mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">어떻게 작동하나요?</h2>
          <p className="text-sm text-center text-gray-400 mb-10">딱 3단계면 됩니다</p>
          <div className="space-y-4">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <span className="text-2xl font-black text-rose-200 shrink-0 w-10 leading-none pt-1">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 특징 */}
      <section className="px-5 py-16 bg-white">
        <div className="max-w-[500px] mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">리포트에 포함되는 것</h2>
          <p className="text-sm text-center text-gray-400 mb-10">분석 결과를 최대한 활용할 수 있도록</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-rose-50 rounded-2xl p-4">
                <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center mb-3">
                  <div className="w-3 h-3 bg-rose-400 rounded-full" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 가격 */}
      <section className="px-5 py-16 bg-gray-50">
        <div className="max-w-[500px] mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">가격 안내</h2>
          <p className="text-sm text-center text-gray-400 mb-10">카카오 채널로 결제 안내를 드립니다</p>
          <div className="space-y-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-5 ${
                  plan.highlight
                    ? 'bg-gray-950 border-2 border-rose-500'
                    : 'bg-white border border-gray-100 shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block text-xs font-bold text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full mb-3">
                    추천
                  </span>
                )}
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className={`text-base font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{plan.desc}</p>
                  </div>
                  <p className={`text-2xl font-black ${plan.highlight ? 'text-rose-400' : 'text-gray-900'}`}>
                    {plan.price}
                    <span className="text-sm font-normal ml-0.5">원</span>
                  </p>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckIcon highlight={plan.highlight} />
                      <span className={plan.highlight ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={ctaHref}
                  className={`block text-center py-3 rounded-xl text-sm font-bold transition-colors ${
                    plan.highlight
                      ? 'bg-rose-500 hover:bg-rose-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  신청하기
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="px-5 py-20 bg-white text-center">
        <div className="max-w-[500px] mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            지금 바로 분석 받아보세요
          </h2>
          <p className="text-sm text-gray-400 mb-8">24시간 내 리포트 · 개인정보 안전 보호</p>
          <Link
            href={ctaHref}
            className="inline-block px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white text-base font-bold rounded-2xl transition-colors"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-gray-100 px-5 py-8">
        <div className="max-w-[500px] mx-auto">
          <p className="text-sm font-bold text-gray-900 mb-1">스캔톡</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            AI 분석 결과는 참고용이며, 상대방의 마음을 확정하지 않습니다.<br />
            건강하고 존중 있는 관계를 응원합니다.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/login" className="text-xs text-gray-400 hover:text-gray-600">로그인</Link>
            <Link href="/signup" className="text-xs text-gray-400 hover:text-gray-600">회원가입</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CheckIcon({ highlight }: { highlight: boolean }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 ${highlight ? 'text-rose-400' : 'text-rose-400'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}
