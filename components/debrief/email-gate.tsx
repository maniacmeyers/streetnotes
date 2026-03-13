'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'motion/react'

interface EmailGateProps {
  onComplete: (sessionId: string, email: string) => void
}

export default function EmailGate({ onComplete }: EmailGateProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/debrief/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong.')
        return
      }

      onComplete(data.sessionId, email)
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Try again.')
    }
  }

  return (
    <div className="text-center">
      {/* Badge */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, rotate: -4 }}
        animate={{ opacity: 1, rotate: -2 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <span className="sticker -rotate-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold">
          Free tool — no signup required
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="font-display uppercase text-[48px] sm:text-[72px] leading-[0.85] text-white mb-4"
        style={{ textShadow: '4px 4px 0px #000000' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        Post-Call
        <br />
        <span className="text-volt">Brain Dump</span>
      </motion.h1>

      <motion.p
        className="font-body text-lg sm:text-xl text-gray-300 mb-2 max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        Hit the mic. We&apos;ll write the notes.
      </motion.p>
      <motion.p
        className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-gray-500 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        Because &quot;I&apos;ll enter it later&quot; is a lie.
      </motion.p>

      {/* Email form */}
      <motion.form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="flex border-4 border-black neo-shadow bg-white">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="YOUR WORK EMAIL"
            required
            autoComplete="email"
            inputMode="email"
            className="flex-1 px-4 py-4 font-mono text-sm text-black placeholder:text-gray-400 uppercase tracking-wider bg-white outline-none min-h-[44px]"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="border-l-4 border-black bg-volt text-black font-display text-lg px-6 py-4 uppercase hover:bg-white transition-colors duration-100 cursor-pointer whitespace-nowrap disabled:opacity-50 min-h-[44px]"
          >
            {status === 'loading' ? '...' : 'Start'}
          </button>
        </div>

        {status === 'error' && (
          <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-red-400 mt-3">
            {errorMsg}
          </p>
        )}

        <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em] text-gray-500 mt-4">
          60 seconds. Structured deal notes. Free.
        </p>
      </motion.form>

      {/* How it works preview */}
      <motion.div
        className="mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        {[
          { num: '01', label: 'Talk' },
          { num: '02', label: 'Extract' },
          { num: '03', label: 'Download' },
        ].map((s) => (
          <div
            key={s.num}
            className="border-2 border-white/20 p-3 text-center"
          >
            <span className="font-mono text-[10px] text-volt block">
              {s.num}
            </span>
            <span className="font-display text-lg uppercase">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
