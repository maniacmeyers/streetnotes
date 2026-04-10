'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Trophy,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Share2,
  Copy,
  CheckCircle,
} from 'lucide-react'
import { BrutalCard, BrutalButton, BrutalBadge } from '@/components/streetnotes/brutal'
import { cascadeIn, staggerContainer, scaleIn } from '@/lib/vbrick/animations'
import type { StoryScore } from '@/lib/vbrick/story-types'

function scoreColor(score: number): string {
  if (score <= 3) return '#dc2626'
  if (score <= 6) return '#d97706'
  return '#00E676'
}

interface ScoreCardProps {
  score: StoryScore
  isNewBest: boolean
  xpEarned: number
  onRetry: () => void
  onSaveToVault: () => void
  vaultEntryId?: string
  email?: string
}

const DIMENSION_LABELS: { key: keyof StoryScore['improvements']; label: string }[] = [
  { key: 'framework', label: 'Framework Adherence' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'confidence', label: 'Confidence' },
  { key: 'pacing', label: 'Pacing' },
  { key: 'specificity', label: 'Specificity' },
  { key: 'brevity', label: 'Brevity' },
]

function getDimensionScore(score: StoryScore, key: string): number {
  return (score as unknown as Record<string, number>)[key] ?? 0
}

export function ScoreCard({
  score,
  isNewBest,
  xpEarned,
  onRetry,
  onSaveToVault,
  vaultEntryId,
  email,
}: ScoreCardProps) {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleShareChallenge() {
    if (!vaultEntryId || !email) return
    setSharing(true)
    try {
      const res = await fetch('/api/vbrick/stories/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vault_entry_id: vaultEntryId, email }),
      })
      if (res.ok) {
        const data = await res.json()
        setShareUrl(data.url)
        await navigator.clipboard.writeText(data.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } finally {
      setSharing(false)
    }
  }

  async function handleCopyUrl() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function toggleDimension(key: string) {
    setExpandedDimension((prev) => (prev === key ? null : key))
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Composite Score */}
      <motion.div variants={scaleIn} className="flex flex-col items-center">
        <BrutalCard variant="white" padded className="flex flex-col items-center w-full max-w-xs">
          <span
            className="font-display text-7xl tabular-nums leading-none"
            style={{ color: scoreColor(score.composite) }}
          >
            {score.composite.toFixed(1)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-black/60 mt-2">
            Composite Score
          </span>

          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            {isNewBest && (
              <BrutalBadge variant="black">
                <Trophy size={12} />
                <span className="ml-1">New Personal Best!</span>
              </BrutalBadge>
            )}
            <BrutalBadge variant="volt">
              <Sparkles size={12} />
              <span className="ml-1">+{xpEarned} XP</span>
            </BrutalBadge>
          </div>
        </BrutalCard>
      </motion.div>

      {/* Dimension Scores */}
      <motion.div variants={cascadeIn} custom={1}>
        <BrutalCard variant="white" padded>
          <h4 className="font-display uppercase text-lg text-black leading-none mb-4">
            Score Breakdown
          </h4>

          <div className="space-y-3">
            {DIMENSION_LABELS.map(({ key, label }) => {
              const dimScore = getDimensionScore(score, key)
              const note = score.improvements[key]
              const isExpanded = expandedDimension === key

              return (
                <div key={key}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between mb-1.5"
                    onClick={() => note && toggleDimension(key)}
                    style={{ cursor: note ? 'pointer' : 'default' }}
                  >
                    <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-black">
                      {label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-display text-lg tabular-nums leading-none"
                        style={{ color: scoreColor(dimScore) }}
                      >
                        {dimScore.toFixed(1)}
                      </span>
                      {note &&
                        (isExpanded ? (
                          <ChevronUp size={14} className="text-black/60" />
                        ) : (
                          <ChevronDown size={14} className="text-black/60" />
                        ))}
                    </div>
                  </button>

                  {/* Brutalist progress bar */}
                  <div className="w-full h-2 bg-white border-2 border-black">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, dimScore * 10))}%`,
                        background: scoreColor(dimScore),
                      }}
                    />
                  </div>

                  {isExpanded && note && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-body text-xs mt-2 leading-relaxed text-black/70"
                    >
                      {note}
                    </motion.p>
                  )}
                </div>
              )
            })}
          </div>
        </BrutalCard>
      </motion.div>

      {/* Coaching Note */}
      {score.coaching_note && (
        <motion.div variants={cascadeIn} custom={2}>
          <BrutalCard variant="volt" padded>
            <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-black mb-2">
              Coach&apos;s Note
            </p>
            <p className="font-body text-sm leading-relaxed text-black">
              {score.coaching_note}
            </p>
          </BrutalCard>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        variants={cascadeIn}
        custom={3}
        className="flex items-center justify-center gap-3 flex-wrap"
      >
        <BrutalButton variant="outline" size="md" onClick={onRetry}>
          <RotateCcw size={16} />
          Practice Again
        </BrutalButton>
        <BrutalButton variant="volt" size="md" onClick={onSaveToVault}>
          <Check size={16} />
          Done
        </BrutalButton>
      </motion.div>

      {/* Share Challenge */}
      {vaultEntryId && email && (
        <motion.div
          variants={cascadeIn}
          custom={4}
          className="flex flex-col items-center gap-2"
        >
          {!shareUrl ? (
            <BrutalButton
              variant="outline"
              size="sm"
              onClick={handleShareChallenge}
              disabled={sharing}
            >
              <Share2 size={14} />
              {sharing ? 'Creating...' : 'Share Challenge'}
            </BrutalButton>
          ) : (
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="font-mono text-xs bg-white border-4 border-black px-3 py-2 truncate w-56 text-black"
              />
              <BrutalButton variant="outline" size="sm" onClick={handleCopyUrl}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </BrutalButton>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
