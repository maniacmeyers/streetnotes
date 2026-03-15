'use client'

import { useState, FormEvent } from 'react'

export default function WaitlistForm({ variant = 'dark' }: { variant?: 'dark' | 'light' }) {
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
        <div className="border-4 border-black neo-shadow bg-white p-6 text-center">
          <p className="font-display text-2xl uppercase text-black">You&apos;re in.</p>
          <p className="font-body text-black/70 mt-2">We&apos;ll hit you up when it&apos;s go time.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row border-4 border-black neo-shadow bg-white"
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
          className="flex-1 px-4 py-3.5 sm:py-4 font-mono text-sm text-black placeholder:text-gray-400 uppercase tracking-wider bg-white outline-none min-h-[44px]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="border-t-4 sm:border-t-0 sm:border-l-4 border-black bg-black text-white font-display text-lg sm:text-xl px-6 py-3.5 sm:py-4 uppercase hover:bg-white hover:text-black transition-colors duration-100 cursor-pointer whitespace-nowrap disabled:opacity-50 min-h-[44px] w-full sm:w-auto"
        >
          {status === 'loading' ? '...' : 'Join Waitlist'}
        </button>
      </form>
      {status === 'error' && (
        <p role="alert" className="font-mono text-xs uppercase tracking-[0.1em] text-red-500 mt-2">
          Something went wrong. Try again.
        </p>
      )}
      <p className={`font-mono text-sm sm:text-base uppercase tracking-[0.15em] font-bold ${variant === 'dark' ? 'text-volt' : 'text-black'} mt-3 sm:mt-4`}>
        {variant === 'dark' ? '★ Free early access. No credit card. ★' : '★ Early access is free. Be first. ★'}
      </p>
    </div>
  )
}
