'use client'

import { useState, FormEvent } from 'react'

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" aria-live="polite">
        <div className="glass-volt rounded-2xl p-8 text-center">
          <p className="font-bold text-3xl text-white">You&apos;re in.</p>
          <p className="font-body text-white/70 mt-2">
            We&apos;ll hit you up when it&apos;s go time.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex glass rounded-2xl overflow-hidden p-1.5 gap-1.5"
      >
        <label htmlFor="waitlist-email" className="sr-only">
          Work email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="YOUR WORK EMAIL"
          required
          aria-required="true"
          className="flex-1 min-w-0 px-4 py-3 sm:py-4 text-base sm:text-sm text-white placeholder:text-white/40 uppercase tracking-wider bg-transparent outline-none min-h-[44px] rounded-xl"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-volt text-black font-bold text-base sm:text-lg px-6 sm:px-7 py-3 sm:py-4 rounded-xl uppercase hover:bg-volt/90 active:bg-volt/80 transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 min-h-[44px] shadow-glow-volt"
        >
          {status === 'loading' ? '...' : 'Join Beta'}
        </button>
      </form>
      {status === 'error' && (
        <p
          role="alert"
          className="font-mono text-xs uppercase tracking-[0.15em] text-red-400 mt-3"
        >
          Something went wrong. Try again.
        </p>
      )}
      <p className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-volt/70 mt-4">
        Free early access. No credit card.
      </p>
    </div>
  )
}
