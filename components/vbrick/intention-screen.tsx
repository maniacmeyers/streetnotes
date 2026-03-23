'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'

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
      style={{ background: 'linear-gradient(180deg, #0c1a2e 0%, #060e1a 100%)' }}
    >
      {/* Subtle glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)' }}
      />

      {/* Mantra */}
      <motion.p
        className="relative text-xs uppercase tracking-[0.25em] text-blue-400/70 font-inter mb-12"
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
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            style={{ backdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
          >
            <label className="block text-white font-semibold text-sm mb-3 font-inter">
              {q.label}
            </label>
            <input
              type="text"
              value={answers[q.key as keyof typeof answers]}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
              }
              placeholder={placeholders[q.key as keyof typeof placeholders] || ''}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-base font-inter placeholder:text-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all duration-200"
            />
          </motion.div>
        ))}
      </div>

      {/* Submit button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!allFilled || submitting}
        className="relative mt-10 px-10 py-4 rounded-xl font-bold text-sm cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {submitting ? 'Saving...' : "I'm Ready"}
      </motion.button>
    </div>
  )
}
