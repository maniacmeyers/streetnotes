import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Post-Call Brain Dump — Free Sales Debrief Tool | StreetNotes.ai'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#121212',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            display: 'flex',
          }}
        />

        {/* Volt accent bar at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: '#00E676',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              background: '#FFFFFF',
              border: '4px solid #000000',
              padding: '8px 20px',
              transform: 'rotate(-2deg)',
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: '#000000',
                fontFamily: 'monospace',
              }}
            >
              Free Tool
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            }}
          >
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                textTransform: 'uppercase',
                color: '#FFFFFF',
                lineHeight: 0.9,
                textShadow: '4px 4px 0px #000000',
              }}
            >
              Post-Call
            </span>
            <span
              style={{
                fontSize: 72,
                fontWeight: 900,
                textTransform: 'uppercase',
                color: '#00E676',
                lineHeight: 0.9,
                textShadow: '4px 4px 0px #000000',
              }}
            >
              Brain Dump
            </span>
          </div>

          {/* Subline */}
          <span
            style={{
              fontSize: 22,
              color: '#9CA3AF',
              fontStyle: 'italic',
              marginTop: 8,
            }}
          >
            Hit the mic. We&apos;ll write the notes.
          </span>

          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 24,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#00E676',
                fontFamily: 'monospace',
              }}
            >
              StreetNotes.ai
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
