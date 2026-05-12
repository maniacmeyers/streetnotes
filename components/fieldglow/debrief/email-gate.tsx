'use client'

import { useState, type FormEvent } from 'react'

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
    <section className="relative overflow-hidden">
      <div className="fg-rake" aria-hidden="true" />

      <div className="relative mx-auto max-w-[1080px] px-6 pb-24 pt-16 sm:px-10 sm:pb-32 sm:pt-24">
        <div className="grid gap-12 sm:grid-cols-12 sm:gap-16">
          {/* Left — pitch */}
          <div className="sm:col-span-7">
            <span className="fg-eyebrow mb-8 block">
              Free brain dump · for aesthetic sales reps
            </span>

            <h1
              className="fg-display text-[clamp(2.6rem,7vw,4.8rem)] leading-[0.95] tracking-tight"
              style={{ color: 'var(--fg-ink)' }}
            >
              You just left the clinic.{' '}
              <span
                className="fg-display-italic leading-[1.5]"
                style={{ color: 'var(--fg-gilt-deep)' }}
              >
                Talk to me about it.
              </span>
            </h1>

            <p
              className="mt-8 max-w-[58ch] text-[1.1rem] leading-[1.65] sm:text-[1.18rem]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              Talk through the provider, the practice, the products you
              discussed, and the competitor moves you overheard. We&apos;ll hand
              back structured Salesforce notes, follow-up tasks, and a
              downloadable PDF.
            </p>

            <ul
              className="mt-10 space-y-4 text-[1rem] leading-[1.55]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              {[
                'Tuned for injectables, lasers, body contouring, devices, skincare.',
                'Knows your category — Allergan, Galderma, Merz, Evolus, Revance, InMode, BTL.',
                'Free. No credit card. No download.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-4">
                  <span
                    className="fg-display-italic mt-1 leading-[1.5]"
                    style={{ color: 'var(--fg-gilt-deep)' }}
                  >
                    —
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — entry form */}
          <div className="sm:col-span-5">
            <div
              className="border p-7 sm:p-9"
              style={{
                background: 'var(--fg-cream)',
                borderColor: 'var(--fg-line)',
              }}
            >
              <p
                className="text-[0.7rem] uppercase tracking-[0.26em]"
                style={{ color: 'var(--fg-gilt)' }}
              >
                Begin
              </p>
              <p
                className="fg-display mt-3 text-[1.5rem] leading-[1.25]"
                style={{ color: 'var(--fg-ink)' }}
              >
                Enter a work email to start.
              </p>

              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-3">
                <label
                  htmlFor="fg-debrief-email"
                  className="text-[0.7rem] uppercase tracking-[0.24em]"
                  style={{ color: 'var(--fg-mute)' }}
                >
                  Work email
                </label>
                <input
                  id="fg-debrief-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rep@medspa.com"
                  required
                  aria-required="true"
                  autoComplete="email"
                  inputMode="email"
                  className="min-h-[52px] w-full bg-transparent px-0 py-3 text-base outline-none transition-colors"
                  style={{
                    borderBottom: '1px solid var(--fg-line)',
                    color: 'var(--fg-ink)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderBottomColor = 'var(--fg-gilt)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderBottomColor = 'var(--fg-line)'
                  }}
                />

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="fg-btn-gilt mt-5 cursor-pointer disabled:cursor-wait disabled:opacity-70"
                >
                  {status === 'loading' ? 'Starting…' : 'Start'}
                </button>

                {status === 'error' && (
                  <p
                    role="alert"
                    className="mt-3 text-[0.85rem]"
                    style={{ color: '#a85a4a' }}
                  >
                    {errorMsg}
                  </p>
                )}

                <p
                  className="mt-4 text-[0.78rem] leading-[1.5]"
                  style={{ color: 'var(--fg-mute)' }}
                >
                  Limit: three brain dumps per email per day. We&apos;ll only
                  email if you ask us to.
                </p>
              </form>
            </div>

            <div
              className="mt-8 grid grid-cols-3 gap-3 border-t pt-6"
              style={{ borderColor: 'var(--fg-line)' }}
            >
              {[
                { n: '01', label: 'Talk' },
                { n: '02', label: 'Review' },
                { n: '03', label: 'Receive' },
              ].map((s) => (
                <div key={s.n}>
                  <span
                    className="fg-folio text-[1.4rem]"
                    style={{ color: 'var(--fg-gilt)' }}
                  >
                    {s.n}
                  </span>
                  <p
                    className="mt-1 text-[0.78rem] uppercase tracking-[0.22em]"
                    style={{ color: 'var(--fg-ink-2)' }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
