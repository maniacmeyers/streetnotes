'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { BrutalCard, BrutalButton, BrutalTextarea } from '@/components/streetnotes/brutal'
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
    <BrutalCard variant="white" padded>
      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-black">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-black tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-3 bg-white border-2 border-black">
          <div
            className="h-full bg-volt transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
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
          <h3 className="font-display uppercase text-xl text-black leading-[0.9] mb-1">
            {current.label}
          </h3>
          <p className="font-body text-sm text-black/70 mb-4 italic">{current.hint}</p>

          <BrutalTextarea
            value={answers[current.key] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={current.placeholder}
            rows={5}
            maxLength={current.maxLength}
          />

          {current.maxLength && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/60 text-right tabular-nums mt-1">
              {(answers[current.key] || '').length} / {current.maxLength}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="font-mono text-xs uppercase tracking-wider font-bold text-red-600 mt-3">
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 gap-3">
        <BrutalButton variant="outline" size="sm" onClick={handleBack} disabled={loading}>
          <ArrowLeft size={16} />
          Back
        </BrutalButton>

        <BrutalButton
          variant="volt"
          size="sm"
          onClick={handleNext}
          disabled={!canAdvance || loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
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
        </BrutalButton>
      </div>
    </BrutalCard>
  )
}
