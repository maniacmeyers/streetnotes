'use client'

import { useEffect, useRef, useState } from 'react'
import { Share2, Calendar, ChevronDown, Trophy, Mic, Plus, Trash2, Link2, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { motion } from 'motion/react'
import { NeuCard, NeuBadge, NeuButton } from '@/components/vbrick/neu'
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
  /** Show BDR name (for team vault view) */
  showAuthor?: boolean
  /** Called when user wants to practice this story */
  onPractice?: () => void
  /** Called when user wants to adopt a team story and practice it */
  onAdopt?: () => void
  /** True while adopt API is in flight */
  adopting?: boolean
  /** Called when user wants to delete this vault entry */
  onDelete?: () => void
  /** Email for creating share challenges */
  email?: string
}

export function VaultCard({ entry, showShare = false, onToggleShare, showAuthor = false, onPractice, onAdopt, adopting = false, onDelete, email }: VaultCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [challengeUrl, setChallengeUrl] = useState<string | null>(null)
  const [creatingChallenge, setCreatingChallenge] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState<'copied' | 'failed' | null>(null)
  const copyFeedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeout.current) {
        clearTimeout(copyFeedbackTimeout.current)
      }
    }
  }, [])

  async function handleCreateChallenge(e: React.MouseEvent) {
    e.stopPropagation()
    if (!email || challengeUrl) return
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
      }
    } finally {
      setCreatingChallenge(false)
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

  async function handleNativeShare(e: React.MouseEvent) {
    e.stopPropagation()
    if (!challengeUrl) return
    const shareData = {
      title: 'Beat this StreetNotes score',
      text: `I scored ${entry.composite_score.toFixed(1)} on ${STORY_TYPE_LABELS[entry.story_type]}. Can you beat it?`,
      url: challengeUrl,
    }
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await copyToClipboard(challengeUrl)
        }
      }
      return
    }
    await copyToClipboard(challengeUrl)
  }

  async function handleCopyLink(e: React.MouseEvent) {
    e.stopPropagation()
    if (!challengeUrl) return
    await copyToClipboard(challengeUrl)
  }

  return (
    <NeuCard padding="md">
      {/* Header row — clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 text-left border-none bg-transparent cursor-pointer p-0"
      >
        {/* Left: type badge + title + date */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <NeuBadge variant="accent">
              {STORY_TYPE_LABELS[entry.story_type]}
            </NeuBadge>
            {entry.is_personal_best && (
              <span className="inline-flex items-center gap-1 text-[10px] font-satoshi font-medium" style={{ color: '#16a34a' }}>
                <Trophy size={10} />
                Personal Best
              </span>
            )}
          </div>

          <h4
            className="font-general-sans font-bold text-base"
            style={{ color: neuTheme.colors.text.heading }}
          >
            {entry.title}
          </h4>

          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} style={{ color: neuTheme.colors.text.subtle }} />
              <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.subtle }}>
                {formatDate(entry.created_at)}
              </span>
            </div>
            {showAuthor && (
              <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.muted }}>
                by {entry.bdr_email.split('@')[0].replace('.', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Right: score + expand chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center">
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
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown size={18} style={{ color: neuTheme.colors.text.muted }} />
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
          <div
            className="mt-4 px-4 py-4 font-satoshi text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              color: neuTheme.colors.text.body,
              borderRadius: neuTheme.radii.md,
              boxShadow: neuTheme.shadows.inset,
            }}
          >
            {entry.transcript}
          </div>
        </div>
      </div>

      {/* Practice / Adopt buttons */}
      {(onPractice || onAdopt) && expanded && (
        <div className="flex items-center gap-3 mt-4">
          {onPractice && (
            <NeuButton
              variant="accent"
              size="sm"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onPractice() }}
            >
              <Mic size={14} className="mr-1.5 inline-block" />
              Practice This Story
            </NeuButton>
          )}
          {onAdopt && (
            <NeuButton
              variant="accent"
              size="sm"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onAdopt() }}
              disabled={adopting}
            >
              {adopting ? (
                <>Adding...</>
              ) : (
                <>
                  <Plus size={14} className="mr-1.5 inline-block" />
                  Add to My Vault &amp; Practice
                </>
              )}
            </NeuButton>
          )}
        </div>
      )}

      {/* Challenge share */}
      {expanded && email && (
        <div className="mt-3">
          {!challengeUrl ? (
            <button
              onClick={handleCreateChallenge}
              disabled={creatingChallenge}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-satoshi font-medium border-none cursor-pointer transition-all duration-150 disabled:opacity-50 min-h-[40px]"
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raisedSm,
                color: neuTheme.colors.accent.primary,
              }}
            >
              <Link2 size={12} />
              {creatingChallenge ? 'Creating…' : 'Share Challenge'}
            </button>
          ) : (
            <div
              className="rounded-xl p-3 space-y-2.5"
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.inset,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Link2 size={12} style={{ color: neuTheme.colors.accent.primary }} className="shrink-0" />
                <span
                  className="font-satoshi text-xs truncate flex-1"
                  style={{ color: neuTheme.colors.text.body }}
                  title={challengeUrl}
                >
                  {challengeUrl.replace(/^https?:\/\//, '')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-satoshi font-medium border-none cursor-pointer transition-all duration-150 min-h-[40px]"
                  style={{
                    background: neuTheme.colors.accent.primary,
                    color: '#ffffff',
                    boxShadow: neuTheme.shadows.raisedSm,
                  }}
                >
                  <Share2 size={12} />
                  Share
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-satoshi font-medium border-none cursor-pointer transition-all duration-150 min-h-[40px]"
                  style={{
                    background: neuTheme.colors.bg,
                    boxShadow: neuTheme.shadows.raisedSm,
                    color:
                      copyFeedback === 'copied'
                        ? neuTheme.colors.accent.primary
                        : neuTheme.colors.text.body,
                  }}
                >
                  {copyFeedback === 'copied' ? (
                    <>
                      <CheckCircle size={12} />
                      Copied
                    </>
                  ) : copyFeedback === 'failed' ? (
                    <>
                      <Copy size={12} />
                      Copy failed
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
                <a
                  href={challengeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-satoshi font-medium border-none cursor-pointer transition-all duration-150 no-underline min-h-[40px]"
                  style={{
                    background: neuTheme.colors.bg,
                    boxShadow: neuTheme.shadows.raisedSm,
                    color: neuTheme.colors.text.body,
                  }}
                >
                  <ExternalLink size={12} />
                  Preview
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share toggle + delete */}
      {showShare && onToggleShare && (
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${neuTheme.colors.shadow}30` }}>
          <div className="flex items-center gap-2">
            <Share2 size={14} style={{ color: neuTheme.colors.text.muted }} />
            <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.muted }}>
              Share to team
            </span>
          </div>
          <div className="flex items-center gap-3">
            {onDelete && expanded && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="p-1.5 rounded-lg border-none cursor-pointer transition-colors duration-150"
                style={{ background: 'transparent', color: neuTheme.colors.text.muted }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#dc262610' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = neuTheme.colors.text.muted; e.currentTarget.style.background = 'transparent' }}
                title="Delete from vault"
              >
                <Trash2 size={14} />
              </button>
            )}
            <NeuToggle
              checked={entry.shared_to_team}
              onChange={() => onToggleShare()}
            />
          </div>
        </div>
      )}

      {/* Delete button standalone (when no share toggle) */}
      {onDelete && expanded && !(showShare && onToggleShare) && (
        <div className="flex items-center justify-end mt-4 pt-3" style={{ borderTop: `1px solid ${neuTheme.colors.shadow}30` }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="flex items-center gap-1.5 p-1.5 rounded-lg border-none cursor-pointer transition-colors duration-150 font-satoshi text-xs"
            style={{ background: 'transparent', color: neuTheme.colors.text.muted }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = '#dc262610' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = neuTheme.colors.text.muted; e.currentTarget.style.background = 'transparent' }}
            title="Delete from vault"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}
    </NeuCard>
  )
}
