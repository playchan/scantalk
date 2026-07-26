import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResultTypeDef } from '@/lib/quiz/marriage'

export const runtime = 'nodejs'

const SIZE = 1080

// 한글 렌더링용 폰트 — 요청 간 캐시됨
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/public/static/Pretendard-Bold.otf',
      { cache: 'force-cache' },
    )
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  // 공유용 이미지는 공개 — 확률/유형만 노출, 개인 식별 정보 없음
  const admin = createAdminClient()
  const { data: result } = await admin
    .from('quiz_results')
    .select('probability, result_type')
    .eq('id', id)
    .single()

  if (!result) {
    return new Response('Not found', { status: 404 })
  }

  const typeDef = getResultTypeDef(result.result_type)
  const fontData = await loadFont()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#17141b',
          backgroundImage: 'radial-gradient(700px 500px at 80% 0%, rgba(224,71,90,0.25), transparent 60%)',
          fontFamily: 'Pretendard',
        }}
      >
        <div style={{ display: 'flex', fontSize: 36, color: '#ff8a94', letterSpacing: 8, marginBottom: 30 }}>
          내가 결혼할 확률은?
        </div>
        <div style={{ display: 'flex', fontSize: 260, fontWeight: 700, color: '#e0475a', lineHeight: 1 }}>
          {result.probability}%
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, color: '#f6f2eb', marginTop: 40 }}>
          {result.result_type}
        </div>
        {typeDef && (
          <div style={{ display: 'flex', fontSize: 34, color: '#a49dae', marginTop: 24 }}>
            "{typeDef.memeLine}"
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 28, color: '#5c5568', marginTop: 80, letterSpacing: 4 }}>
          SCANTALK · 스캔톡
        </div>
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      fonts: fontData
        ? [{ name: 'Pretendard', data: fontData, weight: 700 as const }]
        : undefined,
    },
  )
}
