'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { fadeIn } from '@/lib/vbrick/animations'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import type { StoryType, StoryScore } from '@/lib/vbrick/story-types'

interface PracticeRecorderProps {
  draftId: string
  draftContent: string
  email: string
  storyType?: StoryType
  onComplete: (result: {
    score: StoryScore
    isNewBest: boolean
    xpEarned: number
    vaultEntryId?: string
  }) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PracticeRecorder({
  draftId,
  draftContent,
  email,
  onComplete,
}: PracticeRecorderProps) {
  const recorder = useVoiceRecorder()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStopAndScore() {
    recorder.stopRecording()
    await new Promise((r) => setTimeout(r, 200))
  }

  async function handleSubmit() {
    if (!recorder.audioBlob) return

    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      const ext = recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'
      formData.append(
        'audio',
        new File([recorder.audioBlob], `practice.${ext}`, { type: recorder.mimeType }),
      )
      formData.append('draftId', draftId)
      formData.append('email', email)

      const res = await fetch('/api/vbrick/stories/practice', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Scoring failed' }))
        throw new Error(data.error || 'Scoring failed')
      }

      const data = await res.json()
      onComplete({
        score: data.score,
        isNewBest: data.is_new_best,
        xpEarned: data.xp_earned,
        vaultEntryId: data.vault_entry_id || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(false)
    }
  }

  const isRecording = recorder.status === 'recording'
  const isStopped = recorder.status === 'stopped'

  const containerClass = isRecording
    ? 'rounded-2xl border border-volt/22 bg-gradient-to-br from-volt/8 via-white/5 to-volt/3 backdrop-blur-xl shadow-[0_24px_80px_-20px_rgba(0,230,118,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] p-5'
    : 'rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] p-5'

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      {/* Reference Script */}
      <div className="rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50 mb-2">
          Your script (for reference)
        </p>
        <div className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-3 max-h-40 overflow-y-auto">
          <p className="font-body text-sm leading-relaxed text-white/85 whitespace-pre-wrap">
            {draftContent}
          </p>
        </div>
      </div>

      {/* Recording Controls */}
      <div className={containerClass}>
        <div className="flex flex-col items-center gap-5">
          {/* Timer */}
          <span
            className={`font-display text-5xl tabular-nums leading-none ${
              isRecording ? 'text-volt drop-shadow-[0_0_12px_rgba(0,230,118,0.6)]' : 'text-white/80'
            }`}
          >
            {formatTime(recorder.durationSec)}
          </span>

          {/* Mic surround */}
          <div className="rounded-2xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] p-6 flex items-center justify-center">
            {/* Mic Button */}
            {!isRecording && !isStopped && !submitting && (
              <button
                type="button"
                onClick={() => recorder.startRecording()}
                className="w-24 h-24 rounded-full border border-volt/50 bg-volt/15 text-volt backdrop-blur-md flex items-center justify-center transition hover:bg-volt/25 shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)]"
                aria-label="Start recording practice"
              >
                <Mic size={36} />
              </button>
            )}

            {/* Recording pulse */}
            {isRecording && (
              <motion.button
                type="button"
                onClick={handleStopAndScore}
                aria-label="Stop and score"
                className="w-24 h-24 rounded-full border border-volt/60 bg-volt/20 text-volt flex items-center justify-center backdrop-blur-md"
                animate={{
                  boxShadow: [
                    '0 0 0 0px rgba(0,230,118,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
                    '0 0 0 22px rgba(0,230,118,0), inset 0 1px 0 rgba(255,255,255,0.25)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              >
                <Square size={32} />
              </motion.button>
            )}

            {/* Loading */}
            {submitting && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={40} className="animate-spin text-volt" />
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
                  Transcribing and scoring...
                </p>
              </div>
            )}

            {/* Stopped: submit */}
            {isStopped && !submitting && (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full border border-white/15 bg-white/5 backdrop-blur-md flex items-center justify-center">
                  <Mic size={32} className="text-white/60" />
                </div>
              </div>
            )}
          </div>

          {/* Recording stop label (legacy) */}
          {isRecording && (
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt/80">
              Tap to stop &amp; score
            </p>
          )}

          {/* Stopped: submit actions */}
          {isStopped && !submitting && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => recorder.resetRecording()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md transition hover:bg-white/10"
              >
                Re-record
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-volt/50 bg-volt/15 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-volt/25"
              >
                Score My Delivery
              </button>
            </div>
          )}

          {/* Error */}
          {(error || recorder.error) && (
            <div
              role="alert"
              className="w-full rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-md px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-red-400 text-center">
                {error || recorder.error}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
