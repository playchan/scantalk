import type { Metadata } from 'next'
import QuizFlow from '../QuizFlow'

export const metadata: Metadata = {
  title: '[테스트] 내가 결혼할 확률은? — 스캔톡',
  robots: { index: false, follow: false },
}

// 카피 검수용 테스트 페이지 — 가입 없이 결과 확인, 저장·이벤트 집계 없음
export default function MarriageQuizPreviewPage() {
  return <QuizFlow isLoggedIn={false} previewMode />
}
