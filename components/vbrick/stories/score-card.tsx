'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Trophy, RotateCcw, Check, ChevronDown, ChevronUp, Sparkles, Share2, Copy, CheckCircle } from 'lucide-react'
import { NeuCard, NeuButton, NeuBadge } from '@/components/vbrick/neu'
import { NeuProgress } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer, scaleIn } from '@/lib/vbrick/animations'
import type { StoryScore } from '@/lib/vbrick/story-types'

function scoreColor(score: number): string {
  if (score <= 3) return '#dc2626'
  if (score <= 6) return '#d97706'
  if (score <= 8) return '#6366f1'
  return '#16a34a'
}

interface ScoreCardProps {
  score: StoryScore
  isNewBest: boolean
  xpEarned: number
  onRetry: () => void
  onSaveToVault: () => void
  /** Vault entry ID for creating share challenges */
  vaultEntryId?: string
  /** Email of the current user */
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

export function ScoreCard({ score, isNewBest, xpEarned, onRetry, onSaveToVault, vaultEntryId, email }: ScoreCardProps) {
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
      className="space-y-6"
    >
      {/* Composite Score */}
      <motion.div variants={scaleIn} className="flex flex-col items-center">
        <NeuCard padding="lg" hover={false} className="flex flex-col items-center w-full max-w-xs">
          <span
            className="font-general-sans font-black text-6xl tabular-nums"
            style={{ color: scoreColor(score.composite) }}
          >
            {score.composite.toFixed(1)}
          </span>
          <span
            className="font-satoshi text-sm mt-1"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Composite Score
          </span>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-4">
            {isNewBest && (
              <NeuBadge variant="success" size="md">
                <Trophy size={12} className="mr-1 inline-block" />
                New Personal Best!
              </NeuBadge>
            )}
            <NeuBadge variant="accent" size="md">
              <Sparkles size={12} className="mr-1 inline-block" />
              +{xpEarned} XP
            </NeuBadge>
          </div>
        </NeuCard>
      </motion.div>

      {/* Dimension Scores */}
      <motion.div variants={cascadeIn} custom={1}>
        <NeuCard padding="md" hover={false}>
          <h4
            className="font-general-sans font-bold text-sm uppercase tracking-widest mb-4"
            style={{ color: neuTheme.colors.text.muted }}
          >
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
                    className="w-full flex items-center justify-between mb-1"
                    onClick={() => note && toggleDimension(key)}
                    style={{ cursor: note ? 'pointer' : 'default' }}
                  >
                    <span
                      className="font-satoshi text-sm font-medium"
                      style={{ color: neuTheme.colors.text.body }}
                    >
                      {label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="font-general-sans font-bold text-sm tabular-nums"
                        style={{ color: scoreColor(dimScore) }}
                      >
                        {dimScore.toFixed(1)}
                      </span>
                      {note && (
                        isExpanded
                          ? <ChevronUp size={14} style={{ color: neuTheme.colors.text.subtle }} />
                          : <ChevronDown size={14} style={{ color: neuTheme.colors.text.subtle }} />
                      )}
                    </div>
                  </button>

                  <NeuProgress
                    value={dimScore * 10}
                    color={scoreColor(dimScore)}
                    height={8}
                  />

                  {isExpanded && note && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-satoshi text-xs mt-2 leading-relaxed"
                      style={{ color: neuTheme.colors.text.muted }}
                    >
                      {note}
                    </motion.p>
                  )}
                </div>
              )
            })}
          </div>
        </NeuCard>
      </motion.div>

      {/* Coaching Note */}
      {score.coaching_note && (
        <motion.div variants={cascadeIn} custom={2}>
          <NeuCard variant="inset" padding="md" hover={false}>
            <p
              className="text-xs font-satoshi font-medium uppercase tracking-widest mb-2"
              style={{ color: neuTheme.colors.accent.primary }}
            >
              Coach&apos;s Note
            </p>
            <p
              className="font-satoshi text-sm leading-relaxed"
              style={{ color: neuTheme.colors.text.body }}
            >
              {score.coaching_note}
            </p>
          </NeuCard>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div variants={cascadeIn} custom={3} className="flex items-center justify-center gap-3">
        <NeuButton variant="raised" size="md" onClick={onRetry}>
          <RotateCcw size={16} className="mr-1.5 inline-block" />
          Practice Again
        </NeuButton>
        <NeuButton variant="accent" size="md" onClick={onSaveToVault}>
          <Check size={16} className="mr-1.5 inline-block" />
          Done
        </NeuButton>
      </motion.div>

      {/* Share Challenge */}
      {vaultEntryId && email && (
        <motion.div variants={cascadeIn} custom={4} className="flex flex-col items-center gap-2">
          {!shareUrl ? (
            <NeuButton
              variant="raised"
              size="sm"
              onClick={handleShareChallenge}
              disabled={sharing}
            >
              <Share2 size={14} className="mr-1.5 inline-block" />
              {sharing ? 'Creating...' : 'Share Challenge'}
            </NeuButton>
          ) : (
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="text-xs font-satoshi px-3 py-2 rounded-xl truncate w-56"
                style={{
                  background: neuTheme.colors.bg,
                  boxShadow: neuTheme.shadows.inset,
                  color: neuTheme.colors.text.body,
                }}
              />
              <NeuButton variant="raised" size="sm" onClick={handleCopyUrl}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </NeuButton>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
