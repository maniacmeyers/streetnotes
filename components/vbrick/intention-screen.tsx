'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { neuTheme } from '@/lib/vbrick/theme'

interface IntentionScreenProps {
  email: string
  onComplete: () => void
}

const QUESTIONS = [
  { key: 'know', label: 'What do I want this person to know?' },
  { key: 'feel', label: 'What do I want this person to feel?' },
  { key: 'do', label: 'What do I want this person to do?' },
]

export function IntentionScreen({ email, onComplete }: IntentionScreenProps) {
  const [answers, setAnswers] = useState({ know: '', feel: '', do: '' })
  const [placeholders, setPlaceholders] = useState({ know: '', feel: '', do: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/vbrick/intentions?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.previous) {
          setPlaceholders({
            know: data.previous.know_answer || '',
            feel: data.previous.feel_answer || '',
            do: data.previous.do_answer || '',
          })
        }
        if (data.today) {
          onComplete()
        }
      })
      .catch(() => {})
  }, [email, onComplete])

  const allFilled = answers.know.trim() && answers.feel.trim() && answers.do.trim()

  async function handleSubmit() {
    if (!allFilled || submitting) return
    setSubmitting(true)

    try {
      await fetch('/api/vbrick/intentions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          know_answer: answers.know.trim(),
          feel_answer: answers.feel.trim(),
          do_answer: answers.do.trim(),
        }),
      })
      onComplete()
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: neuTheme.colors.bg }}
    >
      {/* Mantra */}
      <motion.p
        className="relative text-xs uppercase tracking-[0.25em] font-inter mb-12"
        style={{ color: `${neuTheme.colors.accent.primary}B0` }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        How you do anything is how you do everything
      </motion.p>

      {/* Question cards */}
      <div className="relative w-full max-w-lg space-y-4">
        {QUESTIONS.map((q, i) => (
          <motion.div
            key={q.key}
            className="rounded-xl p-6"
            style={{
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.raised,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
          >
            <label
              className="block font-semibold text-sm mb-3 font-inter"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {q.label}
            </label>
            <input
              type="text"
              value={answers[q.key as keyof typeof answers]}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
              }
              placeholder={placeholders[q.key as keyof typeof placeholders] || ''}
              className="w-full rounded-xl px-4 py-3 text-base font-inter focus:outline-none transition-all duration-200"
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.inset,
                color: neuTheme.colors.text.heading,
                border: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `${neuTheme.shadows.inset}, 0 0 0 2px ${neuTheme.colors.accent.primary}40`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = neuTheme.shadows.inset
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Submit button — neumorphic accent */}
      <motion.button
        onClick={handleSubmit}
        disabled={!allFilled || submitting}
        className="relative mt-10 px-10 py-4 rounded-xl font-bold text-sm cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-white"
        style={{
          backgroundColor: neuTheme.colors.accent.primary,
          boxShadow: neuTheme.shadows.raisedSm,
        }}
        whileHover={allFilled && !submitting ? { scale: 1.02, boxShadow: neuTheme.shadows.raised } : undefined}
        whileTap={allFilled && !submitting ? { scale: 0.98, boxShadow: neuTheme.shadows.pressed } : undefined}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {submitting ? 'Saving...' : "I'm Ready"}
      </motion.button>
    </div>
  )
}
