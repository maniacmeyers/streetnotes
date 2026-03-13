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
        className="mb-4 sm:mb-6"
        initial={{ opacity: 0, rotate: -4 }}
        animate={{ opacity: 1, rotate: -2 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <span className="inline-block bg-white border-2 sm:border-3 border-black px-2.5 py-1 sm:px-3 sm:py-1.5 -rotate-2 font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]">
          Free tool — no signup
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="font-display uppercase text-[40px] sm:text-[72px] leading-[0.85] text-white mb-3 sm:mb-4"
        style={{ textShadow: '3px 3px 0px #000000' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        Post-Call
        <br />
        <span className="text-volt">Brain Dump</span>
      </motion.h1>

      <motion.p
        className="font-body text-base sm:text-xl text-gray-300 mb-1.5 sm:mb-2 max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        Hit the mic. We&apos;ll write the notes.
      </motion.p>
      <motion.p
        className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-gray-500 mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        Because &quot;I&apos;ll enter it later&quot; is a lie.
      </motion.p>

      {/* Email form */}
      <motion.form
        onSubmit={handleSubmit}
        className="max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="flex border-3 sm:border-4 border-black bg-white shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="YOUR WORK EMAIL"
            required
            autoComplete="email"
            inputMode="email"
            className="flex-1 min-w-0 px-3 py-3.5 sm:px-4 sm:py-4 font-mono text-[13px] sm:text-sm text-black placeholder:text-gray-400 uppercase tracking-wider bg-white outline-none min-h-[44px]"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="border-l-3 sm:border-l-4 border-black bg-volt text-black font-display text-base sm:text-lg px-5 sm:px-6 py-3.5 sm:py-4 uppercase hover:bg-white transition-colors duration-100 cursor-pointer whitespace-nowrap disabled:opacity-50 min-h-[44px]"
          >
            {status === 'loading' ? '...' : 'Start'}
          </button>
        </div>

        {status === 'error' && (
          <p className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-red-400 mt-3">
            {errorMsg}
          </p>
        )}

        <p className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-gray-500 mt-3 sm:mt-4">
          60 seconds. Structured deal notes. Free.
        </p>
      </motion.form>

      {/* How it works preview */}
      <motion.div
        className="mt-8 sm:mt-12 grid grid-cols-3 gap-2 sm:gap-4 max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        {[
          { num: '01', label: 'Talk' },
          { num: '02', label: 'Extract' },
          { num: '03', label: 'Get PDF' },
        ].map((s) => (
          <div
            key={s.num}
            className="border border-white/20 sm:border-2 p-2.5 sm:p-3 text-center"
          >
            <span className="font-mono text-[9px] sm:text-[10px] text-volt block">
              {s.num}
            </span>
            <span className="font-display text-sm sm:text-lg uppercase">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
