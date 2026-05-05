'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createMatchRequest(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const note = (formData.get('note') as string | null)?.trim() ?? null

  // 이미 활성 신청이 있으면 중복 방지
  const { data: existing } = await supabase
    .from('match_requests')
    .select('id, status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'reviewing', 'matched'])
    .single()

  if (existing) {
    return { error: '이미 진행 중인 매칭 신청이 있습니다.' }
  }

  // 최신 성향 테스트 결과 연결
  const { data: loveTest } = await supabase
    .from('love_tests')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const { error } = await supabase
    .from('match_requests')
    .insert({
      user_id: user.id,
      love_test_id: loveTest?.id ?? null,
      status: 'pending',
      note,
    })

  if (error) return { error: '신청 중 오류가 발생했습니다. 다시 시도해주세요.' }

  redirect('/matching?applied=1')
}
