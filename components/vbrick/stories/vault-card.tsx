'use client'

import { Share2, Calendar } from 'lucide-react'
import { NeuCard, NeuBadge } from '@/components/vbrick/neu'
import { NeuToggle } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { STORY_TYPE_LABELS, type VaultEntry } from '@/lib/vbrick/story-types'

function scoreColor(score: number): string {
  if (score <= 3) return '#dc2626'
  if (score <= 6) return '#d97706'
  if (score <= 8) return '#6366f1'
  return '#16a34a'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface VaultCardProps {
  entry: VaultEntry
  showShare?: boolean
  onToggleShare?: () => void
}

export function VaultCard({ entry, showShare = false, onToggleShare }: VaultCardProps) {
  return (
    <NeuCard padding="md">
      <div className="flex items-start justify-between gap-3">
        {/* Left: type badge + title + date */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <NeuBadge variant="accent">
              {STORY_TYPE_LABELS[entry.story_type]}
            </NeuBadge>
            {entry.is_personal_best && (
              <NeuBadge variant="success" size="sm">PB</NeuBadge>
            )}
          </div>

          <h4
            className="font-general-sans font-bold text-base truncate"
            style={{ color: neuTheme.colors.text.heading }}
          >
            {entry.title}
          </h4>

          <div className="flex items-center gap-1.5 mt-1">
            <Calendar size={12} style={{ color: neuTheme.colors.text.subtle }} />
            <span
              className="font-satoshi text-xs"
              style={{ color: neuTheme.colors.text.subtle }}
            >
              {formatDate(entry.created_at)}
            </span>
          </div>
        </div>

        {/* Right: score */}
        <div className="flex flex-col items-center shrink-0">
          <span
            className="font-general-sans font-black text-3xl tabular-nums"
            style={{ color: scoreColor(entry.composite_score) }}
          >
            {entry.composite_score.toFixed(1)}
          </span>
          <span
            className="text-[9px] uppercase tracking-widest font-satoshi"
            style={{ color: neuTheme.colors.text.subtle }}
          >
            score
          </span>
        </div>
      </div>

      {/* Share toggle */}
      {showShare && onToggleShare && (
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${neuTheme.colors.shadow}30` }}>
          <div className="flex items-center gap-2">
            <Share2 size={14} style={{ color: neuTheme.colors.text.muted }} />
            <span
              className="font-satoshi text-xs"
              style={{ color: neuTheme.colors.text.muted }}
            >
              Share to team
            </span>
          </div>
          <NeuToggle
            checked={entry.shared_to_team}
            onChange={() => onToggleShare()}
          />
        </div>
      )}
    </NeuCard>
  )
}
