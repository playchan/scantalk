import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResultTypeDef, AXIS_LABELS, type AxisKey } from '@/lib/quiz/marriage'

export const runtime = 'nodejs'

const SQUARE = 1080
const STORY_HEIGHT = 1920

// 펜타그램 SVG 좌표 (12시 방향부터 시계방향) — ResultContent와 동일한 축 순서
const RADAR_ORDER: AxisKey[] = ['expression', 'pace', 'intimacy', 'stability', 'independence']
const RADAR_SIZE = 300
const RADAR_CENTER = RADAR_SIZE / 2
const RADAR_RADIUS = 110
const LABEL_BOX = { width: 360, height: 340 }
const LABEL_RADIUS = 140
const LABEL_CENTER = { x: 180, y: 170 }

function radarPoint(index: number, ratio: number, cx: number, cy: number, r: number): [number, number] {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5
  return [cx + Math.cos(angle) * r * ratio, cy + Math.sin(angle) * r * ratio]
}

function polygonPoints(ratios: number[]): string {
  return ratios
    .map((ratio, i) => radarPoint(i, ratio, RADAR_CENTER, RADAR_CENTER, RADAR_RADIUS).map((v) => v.toFixed(1)).join(','))
    .join(' ')
}

// resvg는 한글 폰트가 없어 SVG 안에는 도형만 그리고, 라벨은 바깥 div로 얹는다
function buildRadarSvg(axes: Record<AxisKey, number>): string {
  const maxValue = Math.max(...RADAR_ORDER.map((a) => axes[a] ?? 0), 1)
  const ratios = RADAR_ORDER.map((a) => Math.max((axes[a] ?? 0) / maxValue, 0.08))

  const rings = [1, 0.66, 0.33]
    .map(
      (ring) =>
        `<polygon points="${polygonPoints([ring, ring, ring, ring, ring])}" fill="${ring === 1 ? 'rgba(224,71,90,0.08)' : 'none'}" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>`,
    )
    .join('')

  const spokes = RADAR_ORDER.map((_, i) => {
    const [x, y] = radarPoint(i, 1, RADAR_CENTER, RADAR_CENTER, RADAR_RADIUS)
    return `<line x1="${RADAR_CENTER}" y1="${RADAR_CENTER}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>`
  }).join('')

  const dots = ratios
    .map((ratio, i) => {
      const [x, y] = radarPoint(i, ratio, RADAR_CENTER, RADAR_CENTER, RADAR_RADIUS)
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#f43f5e"/>`
    })
    .join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${RADAR_SIZE}" height="${RADAR_SIZE}" viewBox="0 0 ${RADAR_SIZE} ${RADAR_SIZE}">${rings}${spokes}<polygon points="${polygonPoints(ratios)}" fill="rgba(244,63,94,0.35)" stroke="#f43f5e" stroke-width="5" stroke-linejoin="round"/>${dots}</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function radarLabelPosition(index: number): { left: number; top: number } {
  const [x, y] = radarPoint(index, 1, LABEL_CENTER.x, LABEL_CENTER.y, LABEL_RADIUS)
  return { left: x - 40, top: y - 16 }
}

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
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const isStory = new URL(request.url).searchParams.get('f') === 'story'

  // 공유용 이미지는 공개 — 확률/유형만 노출, 개인 식별 정보 없음
  const admin = createAdminClient()
  const { data: result } = await admin
    .from('quiz_results')
    .select('probability, result_type, axes')
    .eq('id', id)
    .single()

  if (!result) {
    return new Response('Not found', { status: 404 })
  }

  const typeDef = getResultTypeDef(result.result_type)
  if (!typeDef) {
    return new Response('Not found', { status: 404 })
  }

  const axes = (result.axes ?? {}) as Record<AxisKey, number>
  const radarSrc = buildRadarSvg(axes)
  const fontData = await loadFont()

  const bestDef = getResultTypeDef(typeDef.bestMatch)
  const hardDef = getResultTypeDef(typeDef.hardMatch)
  const keywords = typeDef.keywords.slice(0, 3)

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
          backgroundImage:
            'radial-gradient(700px 500px at 80% 0%, rgba(224,71,90,0.28), transparent 60%), radial-gradient(600px 500px at 10% 100%, rgba(224,71,90,0.14), transparent 55%)',
          fontFamily: 'Pretendard',
          padding: isStory ? '120px 60px' : '50px 60px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 34, color: '#ff8a94', letterSpacing: 8 }}>
          내가 결혼할 확률은?
        </div>

        {/* 확률 + 이모지 */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: isStory ? 40 : 16 }}>
          <div style={{ display: 'flex', fontSize: 130, marginRight: 30 }}>{typeDef.emoji}</div>
          <div style={{ display: 'flex', fontSize: 210, fontWeight: 700, color: '#e0475a', lineHeight: 1 }}>
            {result.probability}%
          </div>
        </div>

        {/* 유형명 + 밈라인 */}
        <div
          style={{
            display: 'flex',
            fontSize: 62,
            fontWeight: 700,
            color: '#f6f2eb',
            marginTop: isStory ? 40 : 18,
            textAlign: 'center',
          }}
        >
          {result.result_type}
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#a49dae', marginTop: 14 }}>
          "{typeDef.memeLine}"
        </div>

        {/* 해시태그 */}
        <div style={{ display: 'flex', marginTop: isStory ? 40 : 24 }}>
          {keywords.map((keyword) => (
            <div
              key={keyword}
              style={{
                display: 'flex',
                fontSize: 26,
                color: '#ff8a94',
                backgroundColor: 'rgba(224,71,90,0.14)',
                borderRadius: 999,
                padding: '10px 24px',
                margin: '0 8px',
              }}
            >
              #{keyword}
            </div>
          ))}
        </div>

        {/* 펜타그램 + 축 라벨 */}
        <div
          style={{
            display: 'flex',
            position: 'relative',
            width: LABEL_BOX.width,
            height: LABEL_BOX.height,
            marginTop: isStory ? 50 : 26,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={radarSrc}
            alt=""
            width={RADAR_SIZE}
            height={RADAR_SIZE}
            style={{ position: 'absolute', left: 30, top: 20 }}
          />
          {RADAR_ORDER.map((axis, i) => {
            const pos = radarLabelPosition(i)
            return (
              <div
                key={axis}
                style={{
                  display: 'flex',
                  position: 'absolute',
                  left: pos.left,
                  top: pos.top,
                  width: 80,
                  justifyContent: 'center',
                  fontSize: 22,
                  color: '#a49dae',
                }}
              >
                {AXIS_LABELS[axis]}
              </div>
            )
          })}
        </div>

        {/* 케미 */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: isStory ? 46 : 22, fontSize: 27, color: '#d8d2df' }}>
          <div style={{ display: 'flex' }}>💚 환상의 케미 · {bestDef ? `${bestDef.emoji} ` : ''}{typeDef.bestMatch}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, fontSize: 27, color: '#d8d2df' }}>
          <div style={{ display: 'flex' }}>🧨 환장의 케미 · {hardDef ? `${hardDef.emoji} ` : ''}{typeDef.hardMatch}</div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: isStory ? 70 : 34 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              fontWeight: 700,
              color: '#f6f2eb',
              backgroundColor: '#e0475a',
              borderRadius: 999,
              padding: '16px 40px',
            }}
          >
            너의 확률은? 👀
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 26, color: '#5c5568', marginTop: 20, letterSpacing: 3 }}>
          scantalk.vercel.app · 스캔톡
        </div>
      </div>
    ),
    {
      width: SQUARE,
      height: isStory ? STORY_HEIGHT : SQUARE,
      fonts: fontData
        ? [{ name: 'Pretendard', data: fontData, weight: 700 as const }]
        : undefined,
    },
  )
}
