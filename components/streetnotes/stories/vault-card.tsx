'use client'

import { useState } from 'react'
import {
  Share2,
  Calendar,
  ChevronDown,
  Trophy,
  Mic,
  Plus,
  Trash2,
  Link2,
  CheckCircle,
} from 'lucide-react'
import { motion } from 'motion/react'
import { BrutalCard, BrutalButton, BrutalBadge, BrutalToggle } from '@/components/streetnotes/brutal'
import { STORY_TYPE_LABELS, type VaultEntry } from '@/lib/vbrick/story-types'

function scoreColor(score: number): string {
  if (score <= 3) return '#dc2626'
  if (score <= 6) return '#d97706'
  if (score <= 8) return '#00E676'
  return '#00E676'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface VaultCardProps {
  entry: VaultEntry
  showShare?: boolean
  onToggleShare?: () => void
  showAuthor?: boolean
  onPractice?: () => void
  onAdopt?: () => void
  adopting?: boolean
  onDelete?: () => void
  email?: string
}

export function VaultCard({
  entry,
  showShare = false,
  onToggleShare,
  showAuthor = false,
  onPractice,
  onAdopt,
  adopting = false,
  onDelete,
  email,
}: VaultCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [challengeUrl, setChallengeUrl] = useState<string | null>(null)
  const [creatingChallenge, setCreatingChallenge] = useState(false)
  const [challengeCopied, setChallengeCopied] = useState(false)

  async function handleCreateChallenge(e: React.MouseEvent) {
    e.stopPropagation()
    if (!email) return
    setCreatingChallenge(true)
    try {
      const res = await fetch('/api/vbrick/stories/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vault_entry_id: entry.id, email }),
      })
      if (res.ok) {
        const data = await res.json()
        setChallengeUrl(data.url)
        await navigator.clipboard.writeText(data.url)
        setChallengeCopied(true)
        setTimeout(() => setChallengeCopied(false), 2500)
      }
    } finally {
      setCreatingChallenge(false)
    }
  }

  return (
    <BrutalCard variant="white" padded>
      {/* Header row — clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 text-left border-none bg-transparent cursor-pointer p-0"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <BrutalBadge variant="white">
              {STORY_TYPE_LABELS[entry.story_type]}
            </BrutalBadge>
            {entry.is_personal_best && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider font-bold text-volt">
                <Trophy size={10} />
                Personal Best
              </span>
            )}
          </div>

          <h4 className="font-display uppercase text-xl text-black leading-[0.9]">
            {entry.title}
          </h4>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-black/60" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-black/60">
                {formatDate(entry.created_at)}
              </span>
            </div>
            {showAuthor && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-black/70 font-bold">
                by {entry.bdr_email.split('@')[0].replace('.', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Right: score + expand chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center">
            <span
              className="font-display text-4xl tabular-nums leading-none"
              style={{ color: scoreColor(entry.composite_score) }}
            >
              {entry.composite_score.toFixed(1)}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-black/60 mt-1">
              score
            </span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={18} className="text-black" />
          </motion.div>
        </div>
      </button>

      {/* Expandable story content */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="mt-4 px-4 py-4 bg-black border-4 border-black font-body text-sm leading-relaxed whitespace-pre-wrap text-white">
            {entry.transcript}
          </div>
        </div>
      </div>

      {/* Practice / Adopt buttons */}
      {(onPractice || onAdopt) && expanded && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {onPractice && (
            <BrutalButton
              variant="volt"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onPractice()
              }}
            >
              <Mic size={14} />
              Practice
            </BrutalButton>
          )}
          {onAdopt && (
            <BrutalButton
              variant="volt"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onAdopt()
              }}
              disabled={adopting}
            >
              {adopting ? (
                'Adding...'
              ) : (
                <>
                  <Plus size={14} />
                  Add &amp; Practice
                </>
              )}
            </BrutalButton>
          )}
        </div>
      )}

      {/* Challenge share */}
      {expanded && email && (
        <div className="flex items-center gap-2 mt-3">
          {!challengeUrl ? (
            <button
              onClick={handleCreateChallenge}
              disabled={creatingChallenge}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black font-mono text-[10px] uppercase tracking-widest font-bold text-black hover:bg-volt cursor-pointer transition-colors duration-150 disabled:opacity-50"
            >
              <Link2 size={12} />
              {creatingChallenge ? 'Creating...' : 'Share Challenge'}
            </button>
          ) : (
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest font-bold text-volt">
              <CheckCircle size={12} />
              {challengeCopied ? 'Link copied!' : 'Challenge link created'}
            </span>
          )}
        </div>
      )}

      {/* Share toggle + delete */}
      {showShare && onToggleShare && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-black/20">
          <div className="flex items-center gap-2">
            <Share2 size={14} className="text-black" />
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-black">
              Share to team
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onDelete && expanded && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1.5 border-2 border-black cursor-pointer transition-colors duration-150 bg-white hover:bg-red-600 hover:text-white text-black"
                title="Delete from vault"
                aria-label="Delete from vault"
              >
                <Trash2 size={14} />
              </button>
            )}
            <BrutalToggle checked={entry.shared_to_team} onChange={() => onToggleShare()} />
          </div>
        </div>
      )}

      {/* Delete button standalone */}
      {onDelete && expanded && !(showShare && onToggleShare) && (
        <div className="flex items-center justify-end mt-4 pt-3 border-t-2 border-black/20">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black cursor-pointer transition-colors duration-150 bg-white hover:bg-red-600 hover:text-white text-black font-mono text-[10px] uppercase tracking-widest font-bold"
            title="Delete from vault"
            aria-label="Delete from vault"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </BrutalCard>
  )
}
