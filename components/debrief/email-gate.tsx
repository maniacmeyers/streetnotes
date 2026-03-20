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

    // Vbrick domain validation
    if (!email.toLowerCase().endsWith('@vbrick.com')) {
      setStatus('error')
      setErrorMsg('Please use your @vbrick.com email address')
      return
    }

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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <span className="inline-block uppercase text-xs tracking-widest text-[#7ed4f7]">
          BDR CALL INTELLIGENCE
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="font-bold text-3xl sm:text-5xl leading-[0.9] text-white mb-3 sm:mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        Vbrick
        <br />
        <span className="text-[#7ed4f7]">Command Center</span>
      </motion.h1>

      <motion.p
        className="text-base sm:text-xl text-gray-400 mb-1.5 sm:mb-2 max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        Debrief every call. Get better every week.
      </motion.p>
      <motion.p
        className="text-xs uppercase tracking-widest text-gray-500 mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        Sign in with your @vbrick.com email
      </motion.p>

      {/* Email form */}
      <motion.form
        onSubmit={handleSubmit}
        className="max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="flex rounded-lg border border-white/20 bg-white/5 overflow-hidden">
          <label htmlFor="debrief-email" className="sr-only">
            Work email address
          </label>
          <input
            id="debrief-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="YOUR @VBRICK.COM EMAIL"
            required
            aria-required="true"
            autoComplete="email"
            inputMode="email"
            className="flex-1 min-w-0 px-3 py-3 sm:px-4 sm:py-4 text-sm text-white placeholder:text-gray-500 uppercase tracking-wider bg-transparent outline-none min-h-[44px]"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-[#7ed4f7] text-[#061222] font-bold text-base sm:text-lg px-5 sm:px-6 py-3 sm:py-4 rounded-r-lg uppercase hover:bg-[#9de0fa] active:bg-[#9de0fa] transition-colors duration-100 cursor-pointer whitespace-nowrap disabled:opacity-50 min-h-[44px]"
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

      {/* How it works preview */}
      <motion.div
        className="mt-8 sm:mt-12 grid grid-cols-3 gap-2 sm:gap-4 max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        {[
          { num: '01', label: 'Debrief' },
          { num: '02', label: 'Score' },
          { num: '03', label: 'Brief' },
        ].map((s) => (
          <div
            key={s.num}
            className="border border-white/10 rounded-lg p-2.5 sm:p-3 text-center"
          >
            <span className="text-[9px] sm:text-[10px] text-[#7ed4f7] block">
              {s.num}
            </span>
            <span className="font-bold text-sm sm:text-lg uppercase">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
