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
import { BrutalToggle } from '@/components/streetnotes/brutal'
import { STORY_TYPE_LABELS, type VaultEntry } from '@/lib/vbrick/story-types'

function scoreColor(score: number): string {
  if (score <= 3) return '#f87171'
  if (score <= 6) return '#fbbf24'
  return '#00E676'
}

function scoreGlow(score: number): string {
  if (score <= 3) return '0 0 16px rgba(248, 113, 113, 0.4)'
  if (score <= 6) return '0 0 16px rgba(251, 191, 36, 0.4)'
  return '0 0 16px rgba(0, 230, 118, 0.5)'
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
    <div className="glass rounded-2xl p-5">
      {/* Header row — clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 text-left border-none bg-transparent cursor-pointer p-0"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-block glass-inset rounded-md px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] font-bold text-volt">
              {STORY_TYPE_LABELS[entry.story_type]}
            </span>
            {entry.is_personal_best && (
              <span
                className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] font-bold text-volt"
                style={{ textShadow: '0 0 8px rgba(0, 230, 118, 0.6)' }}
              >
                <Trophy size={10} />
                Personal Best
              </span>
            )}
          </div>

          <h4 className="font-bold text-lg text-white leading-tight">
            {entry.title}
          </h4>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <Calendar size={11} className="text-white/40" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                {formatDate(entry.created_at)}
              </span>
            </div>
            {showAuthor && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-white/60 font-bold">
                by {entry.bdr_email.split('@')[0].replace('.', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Right: score + expand chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center">
            <span
              className="font-bold text-4xl tabular-nums leading-none"
              style={{
                color: scoreColor(entry.composite_score),
                textShadow: scoreGlow(entry.composite_score),
              }}
            >
              {entry.composite_score.toFixed(1)}
            </span>
            <span className="text-[9px] uppercase tracking-[0.15em] font-mono font-bold text-white/40 mt-1">
              score
            </span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={18} className="text-white/60" />
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
          <div className="mt-4 glass-inset rounded-xl px-4 py-4 font-body text-sm leading-relaxed whitespace-pre-wrap text-white/85">
            {entry.transcript}
          </div>
        </div>
      </div>

      {/* Practice / Adopt buttons */}
      {(onPractice || onAdopt) && expanded && (
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {onPractice && (
            <button
              type="button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onPractice()
              }}
              className="inline-flex items-center gap-1.5 bg-volt text-black font-bold text-xs uppercase tracking-[0.15em] px-4 py-2.5 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-volt min-h-[44px]"
            >
              <Mic size={14} />
              Practice
            </button>
          )}
          {onAdopt && (
            <button
              type="button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onAdopt()
              }}
              disabled={adopting}
              className="inline-flex items-center gap-1.5 bg-volt text-black font-bold text-xs uppercase tracking-[0.15em] px-4 py-2.5 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow-volt disabled:opacity-50 min-h-[44px]"
            >
              {adopting ? (
                'Adding...'
              ) : (
                <>
                  <Plus size={14} />
                  Add &amp; Practice
                </>
              )}
            </button>
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
              className="inline-flex items-center gap-1.5 glass rounded-lg px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/70 hover:text-volt hover:border-volt/40 cursor-pointer transition-all disabled:opacity-50"
            >
              <Link2 size={12} />
              {creatingChallenge ? 'Creating...' : 'Share Challenge'}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt">
              <CheckCircle size={12} />
              {challengeCopied ? 'Link copied!' : 'Challenge link created'}
            </span>
          )}
        </div>
      )}

      {/* Share toggle + delete */}
      {showShare && onToggleShare && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Share2 size={14} className="text-white/50" />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/60">
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
                className="glass rounded-md p-1.5 cursor-pointer transition-all hover:border-red-400/40 hover:text-red-400 text-white/60"
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
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-white/10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="inline-flex items-center gap-1.5 glass rounded-lg px-3 py-2 cursor-pointer transition-all hover:border-red-400/40 hover:text-red-400 text-white/60 font-mono text-[10px] uppercase tracking-[0.15em] font-bold"
            title="Delete from vault"
            aria-label="Delete from vault"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
