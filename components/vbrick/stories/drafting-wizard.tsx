'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { NeuCard, NeuButton, NeuTextarea } from '@/components/vbrick/neu'
import { NeuProgress } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
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

    // Final step: assemble the draft
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
    <NeuCard padding="lg" hover={false}>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-satoshi font-medium uppercase tracking-widest"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <span
            className="text-xs font-satoshi tabular-nums"
            style={{ color: neuTheme.colors.text.subtle }}
          >
            {Math.round(progress)}%
          </span>
        </div>
        <NeuProgress value={progress} color={neuTheme.colors.accent.primary} height={8} />
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
          <h3
            className="font-general-sans font-bold text-lg mb-1"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            {current.label}
          </h3>
          <p
            className="font-satoshi text-sm mb-4"
            style={{ color: neuTheme.colors.text.muted }}
          >
            {current.hint}
          </p>

          <NeuTextarea
            value={answers[current.key] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={current.placeholder}
            rows={5}
            maxLength={current.maxLength}
            className="mb-2"
          />

          {current.maxLength && (
            <p
              className="text-xs font-satoshi text-right tabular-nums"
              style={{ color: neuTheme.colors.text.subtle }}
            >
              {(answers[current.key] || '').length} / {current.maxLength}
            </p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <p className="font-satoshi text-sm mt-3" style={{ color: neuTheme.colors.status.danger }}>
          {error}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <NeuButton variant="raised" size="sm" onClick={handleBack} disabled={loading}>
          <ArrowLeft size={16} className="mr-1.5 inline-block" />
          Back
        </NeuButton>

        <NeuButton
          variant="accent"
          size="sm"
          onClick={handleNext}
          disabled={!canAdvance || loading}
          style={{ opacity: canAdvance && !loading ? 1 : 0.5 }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-1.5 inline-block animate-spin" />
              Assembling...
            </>
          ) : isLast ? (
            'Assemble Draft'
          ) : (
            <>
              Next
              <ArrowRight size={16} className="ml-1.5 inline-block" />
            </>
          )}
        </NeuButton>
      </div>
    </NeuCard>
  )
}
