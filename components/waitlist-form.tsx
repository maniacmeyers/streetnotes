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
        className="glass flex flex-col gap-1.5 overflow-hidden rounded-2xl p-1.5 sm:flex-row"
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
          className="min-h-[48px] min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-base uppercase tracking-wider text-white outline-none placeholder:text-white/40 sm:min-h-[44px] sm:py-4 sm:text-sm"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="min-h-[48px] cursor-pointer whitespace-nowrap rounded-xl bg-volt px-6 py-3 text-base font-bold uppercase text-black shadow-glow-volt transition-all duration-200 hover:bg-volt/90 active:bg-volt/80 disabled:opacity-50 sm:min-h-[44px] sm:px-7 sm:py-4 sm:text-lg"
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
