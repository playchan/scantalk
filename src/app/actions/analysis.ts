'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function createAnalysis(formData: FormData): Promise<{ error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const productId = formData.get('productId') as string
  const situation = formData.get('situation') as string
  const concern = (formData.get('concern') as string).trim()
  const privacyAgreed = formData.get('privacyAgreed') === 'true'
  const images = formData.getAll('images') as File[]

  if (!productId || !situation || !concern) {
    return { error: '모든 항목을 입력해주세요.' }
  }
  if (!privacyAgreed) {
    return { error: '개인정보 가림 처리에 동의해주세요.' }
  }
  if (images.filter((f) => f.size > 0).length === 0) {
    return { error: '카톡 캡처 이미지를 1장 이상 업로드해주세요.' }
  }

  // 분석 신청 레코드 생성
  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .insert({ user_id: user.id, product_id: productId, situation, concern, privacy_agreed: privacyAgreed })
    .select('id')
    .single()

  if (analysisError || !analysis) {
    return { error: '신청 저장에 실패했습니다. 다시 시도해주세요.' }
  }

  // 이미지 업로드 (service_role로 private bucket에 저장)
  const admin = createAdminClient()
  const validImages = images.filter((f) => f.size > 0).slice(0, 5)

  for (let i = 0; i < validImages.length; i++) {
    const file = validImages[i]
    const ext = file.type.includes('png') ? 'png' : 'jpg'
    const path = `${user.id}/${analysis.id}/${i + 1}.${ext}`

    const { error: uploadError } = await admin.storage
      .from('analysis-images')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (!uploadError) {
      await admin.from('analysis_images').insert({
        analysis_id: analysis.id,
        storage_path: path,
        order_index: i + 1,
      })
    }
  }

  redirect(`/analysis/complete?id=${analysis.id}`)
}
