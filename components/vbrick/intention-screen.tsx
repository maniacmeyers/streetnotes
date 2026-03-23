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
      style={{ background: 'linear-gradient(180deg, #061222 0%, #0a1a30 100%)' }}
    >
      {/* Mantra */}
      <motion.p
        className="text-[11px] uppercase tracking-[0.3em] text-[#7ed4f7] font-inter mb-12"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        How you do anything is how you do everything
      </motion.p>

      {/* Question cards */}
      <div className="w-full max-w-lg space-y-5">
        {QUESTIONS.map((q, i) => (
          <motion.div
            key={q.key}
            className="rounded-xl border border-white/[0.08] p-6"
            style={{
              background: '#0d1e3a',
              backdropFilter: 'blur(12px) saturate(150%)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
          >
            <label className="block text-white font-bold text-sm mb-3 font-inter">
              {q.label}
            </label>
            <input
              type="text"
              value={answers[q.key as keyof typeof answers]}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.key]: e.target.value }))
              }
              placeholder={placeholders[q.key as keyof typeof placeholders] || ''}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-base font-inter placeholder:text-gray-500 focus:border-[#7ed4f7] focus:outline-none focus:ring-2 focus:ring-[#7ed4f7]/15 transition-colors duration-200"
            />
          </motion.div>
        ))}
      </div>

      {/* Submit button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!allFilled || submitting}
        className="mt-10 px-10 py-4 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
        style={{
          backgroundColor: '#7ed4f7',
          color: '#061222',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {submitting ? 'Saving...' : "I'm Ready"}
      </motion.button>
    </div>
  )
}
