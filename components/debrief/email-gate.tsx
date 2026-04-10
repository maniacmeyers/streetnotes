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
    <div className="text-center relative">
      {/* Ambient volt glow behind the whole card */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[520px] h-[520px] pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(circle, rgba(0,230,118,0.18) 0%, rgba(0,230,118,0.04) 40%, transparent 70%)',
        }}
      />

      <div className="relative">
        {/* Badge */}
        <motion.div
          className="mb-5 sm:mb-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-volt">
            <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse" />
            Free Post-Call Tool
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-bold text-3xl sm:text-5xl leading-[0.9] text-white mb-3 sm:mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Post-Call
          <br />
          <span className="text-volt drop-shadow-[0_0_20px_rgba(0,230,118,0.4)]">Brain Dump</span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-xl text-gray-400 mb-1.5 sm:mb-2 max-w-sm sm:max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          60 seconds of talking. Structured CRM notes.
        </motion.p>
        <motion.p
          className="text-xs uppercase tracking-widest text-gray-500 mb-6 sm:mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Enter your work email to start
        </motion.p>

        {/* Email form — glass-framed */}
        <motion.form
          onSubmit={handleSubmit}
          className="max-w-sm sm:max-w-md mx-auto"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="flex glass rounded-2xl overflow-hidden p-1.5 gap-1.5">
            <label htmlFor="debrief-email" className="sr-only">
              Work email address
            </label>
            <input
              id="debrief-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOUR WORK EMAIL"
              required
              aria-required="true"
              autoComplete="email"
              inputMode="email"
              className="flex-1 min-w-0 px-4 py-3 sm:py-4 text-base sm:text-sm text-white placeholder:text-gray-500 uppercase tracking-wider bg-transparent outline-none min-h-[44px] rounded-xl"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-volt text-black font-bold text-base sm:text-lg px-5 sm:px-6 py-3 sm:py-4 rounded-xl uppercase hover:bg-volt/90 active:bg-volt/80 transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 min-h-[44px] shadow-glow-volt"
            >
              {status === 'loading' ? '...' : 'Start'}
            </button>
          </div>

          {status === 'error' && (
            <p role="alert" className="text-xs uppercase tracking-widest text-red-400 mt-3">
              {errorMsg}
            </p>
          )}

          <p className="text-xs uppercase tracking-widest text-gray-500 mt-3 sm:mt-4">
            60 seconds. Structured deal notes. Free.
          </p>
        </motion.form>

        {/* How it works preview — glass tiles */}
        <motion.div
          className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {[
            { num: '01', label: 'Talk' },
            { num: '02', label: 'Extract' },
            { num: '03', label: 'Review' },
          ].map((s) => (
            <div
              key={s.num}
              className="glass rounded-xl p-3 sm:p-4 text-center"
            >
              <span className="font-mono text-[9px] sm:text-[10px] text-volt block tracking-widest">
                {s.num}
              </span>
              <span className="font-bold text-sm sm:text-lg uppercase text-white">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
