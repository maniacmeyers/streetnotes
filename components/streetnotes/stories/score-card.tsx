'use client'

import { useEffect, useRef, useState } from 'react'
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
  ExternalLink,
  Link2,
} from 'lucide-react'
import { cascadeIn, staggerContainer, scaleIn } from '@/lib/vbrick/animations'
import type { StoryScore } from '@/lib/vbrick/story-types'

function scoreColor(score: number): string {
  if (score <= 3) return '#f87171'
  if (score <= 6) return '#fbbf24'
  return '#00E676'
}

function scoreGlow(score: number): string {
  if (score <= 3) return '0 0 16px rgba(248, 113, 113, 0.5)'
  if (score <= 6) return '0 0 16px rgba(251, 191, 36, 0.5)'
  return '0 0 20px rgba(0, 230, 118, 0.6)'
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

const GLASS_BASE =
  'rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]'
const GLASS_VOLT =
  'rounded-2xl border border-volt/22 bg-gradient-to-br from-volt/8 via-white/5 to-volt/3 backdrop-blur-xl shadow-[0_24px_80px_-20px_rgba(0,230,118,0.25),inset_0_1px_0_rgba(255,255,255,0.22)]'
const BTN_VOLT =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-volt/50 bg-volt/15 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-volt/25 disabled:opacity-40 disabled:cursor-not-allowed'
const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md transition hover:bg-white/10 disabled:opacity-40'

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
  const [copyFeedback, setCopyFeedback] = useState<'copied' | 'failed' | null>(null)
  const copyFeedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeout.current) {
        clearTimeout(copyFeedbackTimeout.current)
      }
    }
  }, [])

  async function handleShareChallenge() {
    if (!vaultEntryId || !email || shareUrl) return
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
      }
    } finally {
      setSharing(false)
    }
  }

  async function copyToClipboard(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopyFeedback('copied')
    } catch {
      setCopyFeedback('failed')
    }
    if (copyFeedbackTimeout.current) {
      clearTimeout(copyFeedbackTimeout.current)
    }
    copyFeedbackTimeout.current = setTimeout(() => {
      setCopyFeedback(null)
      copyFeedbackTimeout.current = null
    }, 2500)
  }

  async function handleNativeShare() {
    if (!shareUrl) return
    const shareData = {
      title: 'Beat this StreetNotes score',
      text: `I scored ${score.composite.toFixed(1)} on StreetNotes Story Vault. Can you beat it?`,
      url: shareUrl,
    }
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(shareUrl)
        }
      }
      return
    }
    await copyToClipboard(shareUrl)
  }

  async function handleCopyUrl() {
    if (!shareUrl) return
    await copyToClipboard(shareUrl)
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
        <div className={`${GLASS_VOLT} p-6 flex flex-col items-center w-full max-w-xs`}>
          <span
            className="font-display text-7xl tabular-nums leading-none"
            style={{
              color: scoreColor(score.composite),
              textShadow: scoreGlow(score.composite),
            }}
          >
            {score.composite.toFixed(1)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50 mt-2">
            Composite Score
          </span>

          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            {isNewBest && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-volt/40 bg-volt/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md">
                <Trophy size={12} />
                New Personal Best
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-md border border-volt/40 bg-volt/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md">
              <Sparkles size={12} />
              +{xpEarned} XP
            </span>
          </div>
        </div>
      </motion.div>

      {/* Dimension Scores */}
      <motion.div variants={cascadeIn} custom={1}>
        <div className={`${GLASS_BASE} p-5`}>
          <h4 className="font-display uppercase text-lg text-white leading-none mb-4">
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
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/70">
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
                          <ChevronUp size={14} className="text-white/50" />
                        ) : (
                          <ChevronDown size={14} className="text-white/50" />
                        ))}
                    </div>
                  </button>

                  {/* Glass-inset track with volt fill */}
                  <div className="w-full h-2 rounded-full overflow-hidden bg-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, dimScore * 10))}%`,
                        background: scoreColor(dimScore),
                        boxShadow: `0 0 8px ${scoreColor(dimScore)}66`,
                      }}
                    />
                  </div>

                  {isExpanded && note && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-body text-xs mt-2 leading-relaxed text-white/70"
                    >
                      {note}
                    </motion.p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Coaching Note */}
      {score.coaching_note && (
        <motion.div variants={cascadeIn} custom={2}>
          <div className={`${GLASS_VOLT} p-5`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt mb-2">
              Coach&apos;s Note
            </p>
            <p className="font-body text-sm leading-relaxed text-white/85">
              {score.coaching_note}
            </p>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        variants={cascadeIn}
        custom={3}
        className="flex items-center justify-center gap-3 flex-wrap"
      >
        <button type="button" onClick={onRetry} className={BTN_GHOST}>
          <RotateCcw size={16} />
          Practice Again
        </button>
        <button type="button" onClick={onSaveToVault} className={BTN_VOLT}>
          <Check size={16} />
          Done
        </button>
      </motion.div>

      {/* Share Challenge */}
      {vaultEntryId && email && (
        <motion.div
          variants={cascadeIn}
          custom={4}
          className="flex flex-col items-center gap-2 w-full"
        >
          {!shareUrl ? (
            <button
              type="button"
              onClick={handleShareChallenge}
              disabled={sharing}
              className={BTN_GHOST}
            >
              <Share2 size={14} />
              {sharing ? 'Creating…' : 'Share Challenge'}
            </button>
          ) : (
            <div className={`${GLASS_BASE} p-3 w-full max-w-md space-y-2.5`}>
              <div className="flex items-center gap-2 min-w-0">
                <Link2 size={12} className="text-volt shrink-0" />
                <span
                  className="font-mono text-[11px] text-white/75 truncate flex-1"
                  title={shareUrl}
                >
                  {shareUrl.replace(/^https?:\/\//, '')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className={BTN_VOLT}
                >
                  <Share2 size={14} />
                  Share
                </button>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className={BTN_GHOST}
                >
                  {copyFeedback === 'copied' ? (
                    <>
                      <CheckCircle size={14} />
                      Copied
                    </>
                  ) : copyFeedback === 'failed' ? (
                    <>
                      <Copy size={14} />
                      Copy failed
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BTN_GHOST} no-underline`}
                >
                  <ExternalLink size={14} />
                  Preview
                </a>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
