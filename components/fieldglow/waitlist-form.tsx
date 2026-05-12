'use client'

import { useState, type FormEvent } from 'react'
import { ArrowRight, Check } from 'lucide-react'

type Props = {
  buttonLabel?: string
  fineprint?: string
  variant?: 'default' | 'dark'
}

export default function FieldGlowWaitlist({
  buttonLabel = 'Apply',
  fineprint = 'No credit card. We respond within two business days.',
  variant = 'default',
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  )

  const isDark = variant === 'dark'

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
      <div
        role="status"
        aria-live="polite"
        className="flex items-start gap-4 border p-5"
        style={{
          background: isDark
            ? 'rgba(242, 235, 223, 0.06)'
            : 'var(--fg-cream)',
          borderColor: isDark
            ? 'rgba(212, 199, 178, 0.3)'
            : 'var(--fg-gilt)',
        }}
      >
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--fg-gilt)' }}
        >
          <Check
            size={16}
            strokeWidth={2.4}
            style={{ color: 'var(--fg-cream)' }}
          />
        </span>
        <div>
          <p
            className="fg-display text-[1.15rem] leading-[1.3]"
            style={{
              color: isDark ? 'var(--fg-paper)' : 'var(--fg-ink)',
              fontVariationSettings: "'opsz' 24, 'SOFT' 30",
            }}
          >
            Application received.
          </p>
          <p
            className="mt-1 text-[0.88rem] leading-[1.5]"
            style={{
              color: isDark ? 'rgba(242, 235, 223, 0.7)' : 'var(--fg-ink-2)',
            }}
          >
            We&apos;ll respond within two business days.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label
          htmlFor="fg-email"
          className="text-[0.7rem] uppercase tracking-[0.24em]"
          style={{
            color: isDark ? 'rgba(242, 235, 223, 0.6)' : 'var(--fg-mute)',
          }}
        >
          Work email
        </label>
        <input
          id="fg-email"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          required
          aria-required="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="rep@medspa.com"
          className="min-h-[52px] w-full bg-transparent px-0 py-3 text-base outline-none transition-colors"
          style={{
            borderBottom: isDark
              ? '1px solid rgba(212, 199, 178, 0.3)'
              : '1px solid var(--fg-line)',
            color: isDark ? 'var(--fg-paper)' : 'var(--fg-ink)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderBottomColor = 'var(--fg-gilt)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderBottomColor = isDark
              ? 'rgba(212, 199, 178, 0.3)'
              : 'var(--fg-line)'
          }}
        />

        <button
          type="submit"
          disabled={status === 'loading'}
          className={`group mt-4 inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-3 px-6 py-3 text-[0.84rem] uppercase tracking-[0.18em] transition-colors disabled:cursor-wait disabled:opacity-70`}
          style={{
            border: '1px solid',
            borderColor: isDark ? 'var(--fg-paper)' : 'var(--fg-ink)',
            background: isDark ? 'var(--fg-paper)' : 'var(--fg-ink)',
            color: isDark ? 'var(--fg-ink)' : 'var(--fg-paper)',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--fg-gilt)'
            e.currentTarget.style.borderColor = 'var(--fg-gilt)'
            e.currentTarget.style.color = 'var(--fg-cream)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDark
              ? 'var(--fg-paper)'
              : 'var(--fg-ink)'
            e.currentTarget.style.borderColor = isDark
              ? 'var(--fg-paper)'
              : 'var(--fg-ink)'
            e.currentTarget.style.color = isDark
              ? 'var(--fg-ink)'
              : 'var(--fg-paper)'
          }}
        >
          {status === 'loading' ? 'Applying…' : buttonLabel}
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      </form>

      {status === 'error' && (
        <p role="alert" className="mt-4 text-[0.85rem]"
          style={{ color: '#a85a4a' }}
        >
          Something went wrong. Try again in a moment.
        </p>
      )}

      {fineprint && (
        <p
          className="mt-5 text-[0.78rem] leading-[1.5]"
          style={{
            color: isDark ? 'rgba(242, 235, 223, 0.55)' : 'var(--fg-mute)',
          }}
        >
          {fineprint}
        </p>
      )}
    </div>
  )
}
