import { ImageResponse } from 'next/og'
import { STORY_TYPE_LABELS } from '@/lib/vbrick/story-types'
import type { StoryType } from '@/lib/vbrick/story-types'

export const runtime = 'edge'
export const alt = 'Beat This Score — StreetNotes Story Vault'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Fetch challenge data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.VERCEL_URL}` || 'http://localhost:3000'
  let displayName = 'Someone'
  let score = '8.5'
  let typeLabel = 'Elevator Pitch'

  try {
    const res = await fetch(`${baseUrl}/api/vbrick/stories/challenge/${token}`)
    if (res.ok) {
      const data = await res.json()
      displayName = data.challenge.display_name
      score = data.vault_entry.composite_score.toFixed(1)
      typeLabel = STORY_TYPE_LABELS[data.vault_entry.story_type as StoryType] || data.vault_entry.story_type
    }
  } catch {
    // Use defaults
  }

  const scoreNum = parseFloat(score)
  const scoreColorHex = scoreNum <= 3 ? '#FF5252' : scoreNum <= 6 ? '#FFB300' : scoreNum <= 8 ? '#818CF8' : '#00E676'

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
          backgroundColor: '#061222',
          position: 'relative',
        }}
      >
        {/* Corner accents */}
        <div style={{ position: 'absolute', top: 24, right: 24, width: 48, height: 48, borderRight: '3px solid #00E676', borderTop: '3px solid #00E676', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24, width: 48, height: 48, borderLeft: '3px solid #00E676', borderBottom: '3px solid #00E676', display: 'flex' }} />

        {/* Header */}
        <div style={{ color: '#00E676', fontSize: 18, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 16, display: 'flex' }}>
          STORY VAULT CHALLENGE
        </div>

        {/* Score */}
        <div style={{ color: scoreColorHex, fontSize: 160, fontWeight: 900, fontFamily: 'monospace', lineHeight: 1, display: 'flex', marginBottom: 8 }}>
          {score}
        </div>

        {/* Type */}
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 40, display: 'flex' }}>
          {typeLabel}
        </div>

        {/* Challenger */}
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24, fontFamily: 'monospace', marginBottom: 8, display: 'flex' }}>
          {displayName} scored {score}
        </div>

        {/* CTA */}
        <div style={{ color: '#00E676', fontSize: 28, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'monospace', display: 'flex' }}>
          Can you beat it?
        </div>

        {/* Branding */}
        <div style={{ position: 'absolute', bottom: 32, color: 'rgba(255,255,255,0.15)', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'monospace', display: 'flex' }}>
          STREETNOTES.AI
        </div>
      </div>
    ),
    { ...size }
  )
}
