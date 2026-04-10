'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { BrutalCard, BrutalButton } from '@/components/streetnotes/brutal'
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

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className="space-y-6">
      {/* Reference Script */}
      <BrutalCard variant="white" padded>
        <p className="font-mono text-[10px] uppercase tracking-widest font-bold text-black/60 mb-2">
          Your script (for reference)
        </p>
        <div className="max-h-40 overflow-y-auto font-body text-sm leading-relaxed text-black">
          <p className="whitespace-pre-wrap">{draftContent}</p>
        </div>
      </BrutalCard>

      {/* Recording Controls */}
      <div className="flex flex-col items-center gap-5">
        {/* Timer */}
        <span
          className={`font-display text-5xl tabular-nums leading-none ${
            isRecording ? 'text-volt' : 'text-white'
          }`}
          style={{ textShadow: '2px 2px 0px #000000' }}
        >
          {formatTime(recorder.durationSec)}
        </span>

        {/* Mic Button */}
        {!isRecording && !isStopped && !submitting && (
          <button
            type="button"
            onClick={() => recorder.startRecording()}
            className="w-24 h-24 bg-volt border-4 border-black shadow-neo hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1 flex items-center justify-center transition-transform duration-100"
            aria-label="Start recording practice"
          >
            <Mic size={36} className="text-black" />
          </button>
        )}

        {/* Recording pulse + stop */}
        {isRecording && (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="w-24 h-24 bg-red-600 border-4 border-black flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(220, 38, 38, 0.4)',
                  '0 0 0 20px rgba(220, 38, 38, 0)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            >
              <Mic size={36} className="text-white" />
            </motion.div>

            <BrutalButton variant="volt" size="md" onClick={handleStopAndScore}>
              <Square size={16} className="text-red-600" />
              Stop &amp; Score
            </BrutalButton>
          </div>
        )}

        {/* Stopped: submit */}
        {isStopped && !submitting && (
          <div className="flex gap-3">
            <BrutalButton variant="outline" size="sm" onClick={() => recorder.resetRecording()}>
              Re-record
            </BrutalButton>
            <BrutalButton variant="volt" size="md" onClick={handleSubmit}>
              Score My Delivery
            </BrutalButton>
          </div>
        )}

        {/* Loading */}
        {submitting && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={40} className="animate-spin text-volt" />
            <p className="font-mono text-xs uppercase tracking-widest font-bold text-gray-400">
              Transcribing and scoring your delivery...
            </p>
          </div>
        )}

        {/* Error */}
        {(error || recorder.error) && (
          <p className="font-mono text-xs uppercase tracking-wider font-bold text-red-400 text-center">
            {error || recorder.error}
          </p>
        )}
      </div>
    </motion.div>
  )
}
