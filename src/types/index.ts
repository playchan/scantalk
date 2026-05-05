export type UserRole = 'user' | 'admin'

export type Situation = '썸' | '소개팅' | '연애' | '재회'

export type PaymentStatus = 'pending' | 'paid' | 'refunded'

export type ProcessStatus = 'waiting' | 'analyzing' | 'reviewing' | 'done'

export type MatchStatus = 'pending' | 'reviewing' | 'matched' | 'closed'

export interface Profile {
  id: string
  email: string
  nickname: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface LoveTest {
  id: string
  user_id: string
  answers: Record<string, string>
  result_type: string
  result_summary: string
  created_at: string
}

export interface Analysis {
  id: string
  user_id: string
  product_id: string
  situation: Situation
  concern: string
  privacy_agreed: boolean
  payment_status: PaymentStatus
  process_status: ProcessStatus
  payment_note: string | null
  created_at: string
  updated_at: string
  product?: Product
}

export interface AnalysisImage {
  id: string
  analysis_id: string
  storage_path: string
  order_index: number
  created_at: string
}

export interface Report {
  id: string
  analysis_id: string
  ai_draft: string | null
  final_content: string | null
  situation_summary: string | null
  interest_level: string | null
  positive_signals: string[]
  negative_signals: string[]
  do_not_do: string[]
  reply_suggestions: string[]
  coaching_3days: string | null
  coaching_7days: string | null
  direction: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface MatchRequest {
  id: string
  user_id: string
  love_test_id: string | null
  status: MatchStatus
  note: string | null
  created_at: string
}

export interface AnalysisWithDetails extends Analysis {
  report: Report | null
  images: AnalysisImage[]
}
