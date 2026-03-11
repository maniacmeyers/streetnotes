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
      <div>
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
        className="flex border-4 border-black neo-shadow bg-white"
      >
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="YOUR WORK EMAIL"
          required
          className="flex-1 px-4 py-4 font-mono text-sm text-black placeholder:text-gray-400 uppercase tracking-wider bg-white outline-none"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="border-l-4 border-black bg-black text-white font-display text-lg sm:text-xl px-6 py-4 uppercase hover:bg-white hover:text-black transition-colors duration-100 cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Join Waitlist'}
        </button>
      </form>
      {status === 'error' && (
        <p className="font-mono text-xs uppercase tracking-[0.1em] text-red-500 mt-2">
          Something went wrong. Try again.
        </p>
      )}
      <p className={`font-mono text-sm sm:text-base uppercase tracking-[0.15em] font-bold ${variant === 'dark' ? 'text-volt' : 'text-black'} mt-4`}>
        {variant === 'dark' ? '★ Free early access. No credit card. ★' : '★ Early access is free. Be first. ★'}
      </p>
    </div>
  )
}
