'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { NeuCard, NeuButton } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { fadeIn } from '@/lib/vbrick/animations'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import type { StoryType, StoryScore } from '@/lib/vbrick/story-types'

interface PracticeRecorderProps {
  draftId: string
  draftContent: string
  email: string
  storyType: StoryType
  onComplete: (result: { score: StoryScore; isNewBest: boolean; xpEarned: number }) => void
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
}: Omit<PracticeRecorderProps, 'storyType'>) {
  const recorder = useVoiceRecorder()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStopAndScore() {
    recorder.stopRecording()
    // Wait a tick for the blob to populate
    await new Promise((r) => setTimeout(r, 200))
  }

  async function handleSubmit() {
    if (!recorder.audioBlob) return

    setSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      const ext = recorder.mimeType.includes('mp4') ? 'mp4' : 'webm'
      formData.append('audio', new File([recorder.audioBlob], `practice.${ext}`, { type: recorder.mimeType }))
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
      <NeuCard variant="inset" hover={false} padding="md">
        <p
          className="text-xs font-satoshi font-medium uppercase tracking-widest mb-2"
          style={{ color: neuTheme.colors.text.muted }}
        >
          Your script (for reference)
        </p>
        <div
          className="max-h-40 overflow-y-auto font-satoshi text-sm leading-relaxed"
          style={{ color: neuTheme.colors.text.body }}
        >
          <p className="whitespace-pre-wrap">{draftContent}</p>
        </div>
      </NeuCard>

      {/* Recording Controls */}
      <div className="flex flex-col items-center gap-5">
        {/* Timer */}
        <span
          className="font-general-sans font-bold text-4xl tabular-nums"
          style={{ color: isRecording ? neuTheme.colors.accent.primary : neuTheme.colors.text.heading }}
        >
          {formatTime(recorder.durationSec)}
        </span>

        {/* Mic Button */}
        {!isRecording && !isStopped && !submitting && (
          <NeuButton
            variant="accent"
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              borderRadius: neuTheme.radii.full,
              width: 80,
              height: 80,
              minHeight: 80,
            }}
            onClick={() => recorder.startRecording()}
          >
            <Mic size={32} />
          </NeuButton>
        )}

        {/* Recording pulse + stop button */}
        {isRecording && (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: neuTheme.colors.status.danger,
                boxShadow: `0 0 0 0 ${neuTheme.colors.status.danger}40`,
              }}
              animate={{
                boxShadow: [
                  `0 0 0 0px ${neuTheme.colors.status.danger}40`,
                  `0 0 0 16px ${neuTheme.colors.status.danger}00`,
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            >
              <Mic size={32} className="text-white" />
            </motion.div>

            <NeuButton
              variant="raised"
              size="md"
              onClick={handleStopAndScore}
            >
              <Square size={16} className="mr-2 inline-block" style={{ color: neuTheme.colors.status.danger }} />
              Stop & Score
            </NeuButton>
          </div>
        )}

        {/* Stopped: submit for scoring */}
        {isStopped && !submitting && (
          <div className="flex gap-3">
            <NeuButton variant="raised" size="sm" onClick={() => recorder.resetRecording()}>
              Re-record
            </NeuButton>
            <NeuButton variant="accent" size="md" onClick={handleSubmit}>
              Score My Delivery
            </NeuButton>
          </div>
        )}

        {/* Loading */}
        {submitting && (
          <div className="flex flex-col items-center gap-3">
            <Loader2
              size={40}
              className="animate-spin"
              style={{ color: neuTheme.colors.accent.primary }}
            />
            <p
              className="font-satoshi text-sm"
              style={{ color: neuTheme.colors.text.muted }}
            >
              Transcribing and scoring your delivery...
            </p>
          </div>
        )}

        {/* Error */}
        {(error || recorder.error) && (
          <p className="font-satoshi text-sm text-center" style={{ color: neuTheme.colors.status.danger }}>
            {error || recorder.error}
          </p>
        )}
      </div>
    </motion.div>
  )
}
