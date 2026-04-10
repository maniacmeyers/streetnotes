'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { VoiceTextInput } from '@/components/ui/voice-text-input'
import { fadeIn } from '@/lib/vbrick/animations'
import type { StoryFrameworkConfig } from '@/lib/vbrick/story-types'

interface DraftingWizardProps {
  draftId: string
  framework: StoryFrameworkConfig
  onComplete: (draftContent: string) => void
  onBack: () => void
}

export function DraftingWizard({ draftId, framework, onComplete, onBack }: DraftingWizardProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const questions = framework.questions
  const current = questions[stepIndex]
  const totalSteps = questions.length
  const isLast = stepIndex === totalSteps - 1
  const progress = ((stepIndex + 1) / totalSteps) * 100

  function handleAnswerChange(value: string) {
    setAnswers((prev) => ({ ...prev, [current.key]: value }))
  }

  function handleBack() {
    if (stepIndex === 0) {
      onBack()
    } else {
      setStepIndex((i) => i - 1)
    }
  }

  async function handleNext() {
    if (!isLast) {
      setStepIndex((i) => i + 1)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/vbrick/stories/drafts/${draftId}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assemble', answers }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Assembly failed' }))
        throw new Error(data.error || 'Assembly failed')
      }

      const data = await res.json()
      onComplete(data.draft_content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const canAdvance = (answers[current.key] || '').trim().length > 10

  return (
    <div className="rounded-2xl border border-volt/22 bg-gradient-to-br from-volt/8 via-white/5 to-volt/3 backdrop-blur-xl shadow-[0_24px_80px_-20px_rgba(0,230,118,0.25),inset_0_1px_0_rgba(255,255,255,0.22)] p-5 sm:p-6">
      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/60">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden bg-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
              background: 'linear-gradient(90deg, #00E676 0%, #7dff9f 100%)',
              boxShadow: '0 0 8px rgba(0, 230, 118, 0.6)',
            }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <h3 className="font-display uppercase text-xl text-white leading-[0.9] mb-1">
            {current.label}
          </h3>
          <p className="font-body text-sm text-white/70 mb-4 italic">{current.hint}</p>

          <VoiceTextInput
            value={answers[current.key] || ''}
            onChange={handleAnswerChange}
            placeholder={current.placeholder}
            maxLength={current.maxLength}
            hint={current.hint}
          />
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-md px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md transition hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-volt/50 bg-volt/15 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-volt/25 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin text-volt" />
              Assembling...
            </>
          ) : isLast ? (
            'Assemble Draft'
          ) : (
            <>
              Next
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
