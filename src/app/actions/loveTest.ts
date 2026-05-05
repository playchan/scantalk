'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type Answers = Record<string, string>

const RESULT_MAP: Record<string, { type: string; summary: string }> = {
  A: {
    type: '적극형',
    summary:
      '먼저 다가가고 감정을 적극적으로 표현하는 타입입니다. 관계 발전을 두려워하지 않으며 상대방의 관심을 이끌어내는 데 능숙합니다. 상대방의 속도도 존중하며 다가가면 더 큰 효과를 볼 수 있어요.',
  },
  B: {
    type: '신중형',
    summary:
      '관계를 천천히, 안전하게 발전시키는 타입입니다. 감정을 확신한 뒤 행동하며 깊은 신뢰를 중요시합니다. 확신이 생겼을 때 용기 있게 표현해보세요.',
  },
  C: {
    type: '자유형',
    summary:
      '자연스럽고 부담 없는 연애를 추구하는 타입입니다. 여유로운 태도가 상대방을 안심시키며 집착하지 않아 오히려 매력적입니다. 좋아하는 마음을 조금 더 표현하면 관계가 더 깊어져요.',
  },
  D: {
    type: '분석형',
    summary:
      '관계를 이성적으로 이해하고 접근하는 타입입니다. 상황을 정확하게 파악하고 깊이 있는 대화를 추구합니다. 느끼는 감정도 솔직하게 표현해보는 연습을 해보세요.',
  },
}

function calcResult(answers: Answers) {
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
  Object.values(answers).forEach((v) => { if (v in counts) counts[v]++ })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
  return RESULT_MAP[top] ?? RESULT_MAP['B']
}

export async function saveLoveTest(
  answers: Answers,
): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { type, summary } = calcResult(answers)

  const { data, error } = await supabase
    .from('love_tests')
    .insert({ user_id: user.id, answers, result_type: type, result_summary: summary })
    .select('id')
    .single()

  if (error || !data) return { error: '저장에 실패했습니다. 다시 시도해주세요.' }

  redirect(`/test/result/${data.id}`)
}
