import { Metadata } from 'next'
import { STORY_TYPE_LABELS } from '@/lib/vbrick/story-types'
import type { StoryType } from '@/lib/vbrick/story-types'

interface ChallengeData {
  challenge: {
    share_token: string
    display_name: string
    view_count: number
  }
  vault_entry: {
    story_type: StoryType
    title: string
    composite_score: number
  }
}

async function fetchChallenge(token: string): Promise<ChallengeData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'

  try {
    const res = await fetch(`${baseUrl}/api/vbrick/stories/challenge/${token}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function scoreColor(score: number): string {
  if (score <= 3) return '#FF5252'
  if (score <= 6) return '#FFB300'
  if (score <= 8) return '#818CF8'
  return '#00E676'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>
}): Promise<Metadata> {
  const { token } = await params
  const data = await fetchChallenge(token)

  if (!data) {
    return { title: 'Challenge Not Found | StreetNotes' }
  }

  const { challenge, vault_entry } = data
  const typeLabel = STORY_TYPE_LABELS[vault_entry.story_type] || vault_entry.story_type
  const title = `${challenge.display_name} scored ${vault_entry.composite_score.toFixed(1)} on ${typeLabel}. Can you beat it?`

  return {
    title: `Beat This Score | StreetNotes Story Vault`,
    description: title,
    openGraph: {
      title: `Beat This Score | StreetNotes`,
      description: title,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Beat This Score | StreetNotes`,
      description: title,
    },
  }
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const data = await fetchChallenge(token)

  if (!data) {
    return (
      <div className="min-h-screen bg-[#061222] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-mono font-bold text-white uppercase tracking-widest mb-4">
            Challenge Not Found
          </h1>
          <p className="text-white/50 font-body text-sm">
            This challenge may have been removed or the link is invalid.
          </p>
        </div>
      </div>
    )
  }

  const { challenge, vault_entry } = data
  const typeLabel = STORY_TYPE_LABELS[vault_entry.story_type] || vault_entry.story_type
  const color = scoreColor(vault_entry.composite_score)

  return (
    <div className="min-h-screen bg-[#061222] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Challenge Card */}
        <div className="border-2 border-white/10 bg-[#1a1a1a] p-8 relative">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-[#00E676] font-mono text-xs uppercase tracking-[0.3em] mb-2">
              Story Vault Challenge
            </p>
            <h1 className="text-white font-mono text-lg uppercase tracking-widest">
              Beat This Score
            </h1>
          </div>

          {/* Score Display */}
          <div className="text-center mb-8">
            <div
              className="text-7xl font-mono font-black tabular-nums inline-block"
              style={{ color }}
            >
              {vault_entry.composite_score.toFixed(1)}
            </div>
            <p className="text-white/30 font-mono text-xs uppercase tracking-widest mt-2">
              Composite Score
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-white/40 font-body text-sm">Challenger</span>
              <span className="text-white font-body text-sm font-medium">
                {challenge.display_name}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-white/40 font-body text-sm">Story Type</span>
              <span className="text-white font-body text-sm font-medium">
                {typeLabel}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/40 font-body text-sm">Views</span>
              <span className="text-white/60 font-body text-sm">
                {challenge.view_count}
              </span>
            </div>
          </div>

          {/* CTA */}
          <a
            href="/debrief"
            className="block w-full py-4 text-center font-mono text-sm uppercase tracking-widest font-bold transition-all duration-200 bg-[#00E676] text-[#061222] hover:translate-y-[-2px] hover:shadow-[0_4px_0_#00E676]"
          >
            Try Story Vault Free
          </a>

          {/* Decorative corner */}
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#00E676]" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#00E676]" />
        </div>

        {/* Branding */}
        <p className="text-center mt-6 text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">
          Powered by StreetNotes.ai
        </p>
      </div>
    </div>
  )
}
