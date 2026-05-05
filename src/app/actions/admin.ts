'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { openai } from '@/lib/openai'
import { revalidatePath } from 'next/cache'
import type { PaymentStatus, ProcessStatus } from '@/types'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single()

  if (!data) return null
  return { user, admin }
}

export async function updatePaymentStatus(
  analysisId: string,
  status: PaymentStatus,
): Promise<{ error?: string }> {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: '권한이 없습니다.' }

  const { error } = await ctx.admin
    .from('analyses')
    .update({ payment_status: status })
    .eq('id', analysisId)

  if (error) return { error: '상태 변경에 실패했습니다.' }
  revalidatePath(`/admin/${analysisId}`)
  return {}
}

export async function updateProcessStatus(
  analysisId: string,
  status: ProcessStatus,
): Promise<{ error?: string }> {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: '권한이 없습니다.' }

  const { error } = await ctx.admin
    .from('analyses')
    .update({ process_status: status })
    .eq('id', analysisId)

  if (error) return { error: '상태 변경에 실패했습니다.' }
  revalidatePath(`/admin/${analysisId}`)
  return {}
}

export async function generateAiDraft(
  analysisId: string,
): Promise<{ error?: string; draft?: string }> {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: '권한이 없습니다.' }

  const { data: analysis } = await ctx.admin
    .from('analyses')
    .select('situation, concern, product:products(name)')
    .eq('id', analysisId)
    .single()

  if (!analysis) return { error: '신청 데이터를 찾을 수 없습니다.' }

  const { data: images } = await ctx.admin
    .from('analysis_images')
    .select('storage_path, order_index')
    .eq('analysis_id', analysisId)
    .order('order_index')

  const imageUrls: string[] = []
  for (const img of images ?? []) {
    const { data } = await ctx.admin.storage
      .from('analysis-images')
      .createSignedUrl(img.storage_path, 300)
    if (data?.signedUrl) imageUrls.push(data.signedUrl)
  }

  const systemPrompt = `당신은 연애 심리 전문 상담사입니다.
카카오톡 대화 캡처와 사용자의 고민을 분석하여 아래 JSON 형식으로만 응답하세요.
반드시 가능성 중심의 표현을 사용하고, 단정적인 판단은 절대 금지합니다.

금지 표현: "상대는 당신을 좋아합니다", "관심이 없습니다", "반드시 돌아옵니다", "조종할 수 있습니다"
허용 표현: "호감 가능성이 있는 신호가 보입니다", "관심이 유지되고 있을 가능성이 있습니다"

응답 JSON 스키마 (한국어로 작성):
{
  "situation_summary": "대화 상황 요약 (2~3문장)",
  "interest_level": "상대 관심도 — 높음/보통/낮음/판단어려움 중 하나",
  "positive_signals": ["긍정 신호 문장 1", "긍정 신호 문장 2"],
  "negative_signals": ["주의 신호 문장 1", "주의 신호 문장 2"],
  "do_not_do": ["하지 말아야 할 행동 1", "하지 말아야 할 행동 2"],
  "reply_suggestions": ["추천 답장 예시 1", "추천 답장 예시 2"],
  "coaching_3days": "3일간 구체적 행동 코칭",
  "direction": "전체 방향 조언 (2~3문장)"
}`

  const userContent: { type: string; text?: string; image_url?: { url: string } }[] = [
    {
      type: 'text',
      text: `상황: ${analysis.situation}\n\n고민 내용:\n${analysis.concern}`,
    },
  ]

  for (const url of imageUrls) {
    userContent.push({ type: 'image_url', image_url: { url } })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent as any },
      ],
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(raw)

    // 기존 리포트 유지 (final_content, is_published 보존)
    const { data: existing } = await ctx.admin
      .from('reports')
      .select('final_content, is_published, published_at')
      .eq('analysis_id', analysisId)
      .single()

    await ctx.admin.from('reports').upsert(
      {
        analysis_id: analysisId,
        ai_draft: raw,
        situation_summary: parsed.situation_summary ?? null,
        interest_level: parsed.interest_level ?? null,
        positive_signals: parsed.positive_signals ?? [],
        negative_signals: parsed.negative_signals ?? [],
        do_not_do: parsed.do_not_do ?? [],
        reply_suggestions: parsed.reply_suggestions ?? [],
        coaching_3days: parsed.coaching_3days ?? null,
        direction: parsed.direction ?? null,
        final_content: existing?.final_content ?? null,
        is_published: existing?.is_published ?? false,
        published_at: existing?.published_at ?? null,
      },
      { onConflict: 'analysis_id' },
    )

    revalidatePath(`/admin/${analysisId}`)
    return { draft: raw }
  } catch {
    return { error: 'AI 분석 생성에 실패했습니다. 다시 시도해주세요.' }
  }
}

export async function saveReport(
  analysisId: string,
  data: { final_content: string; is_published: boolean },
): Promise<{ error?: string }> {
  const ctx = await verifyAdmin()
  if (!ctx) return { error: '권한이 없습니다.' }

  const { data: existing } = await ctx.admin
    .from('reports')
    .select('id')
    .eq('analysis_id', analysisId)
    .single()

  const payload = {
    final_content: data.final_content,
    is_published: data.is_published,
    published_at: data.is_published ? new Date().toISOString() : null,
  }

  if (existing) {
    const { error } = await ctx.admin
      .from('reports')
      .update(payload)
      .eq('analysis_id', analysisId)
    if (error) return { error: '리포트 저장에 실패했습니다.' }
  } else {
    const { error } = await ctx.admin
      .from('reports')
      .insert({ analysis_id: analysisId, ...payload })
    if (error) return { error: '리포트 저장에 실패했습니다.' }
  }

  if (data.is_published) {
    await ctx.admin
      .from('analyses')
      .update({ process_status: 'done' })
      .eq('id', analysisId)
  }

  revalidatePath(`/admin/${analysisId}`)
  revalidatePath('/admin')
  return {}
}
