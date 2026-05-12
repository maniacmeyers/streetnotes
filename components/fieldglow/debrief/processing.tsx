'use client'

import { motion } from 'motion/react'

interface ProcessingProps {
  phase: 'transcribing' | 'extracting' | 'complete'
  error: string | null
  onRetry: () => void
}

const PHASES = [
  { key: 'transcribing', label: 'Transcribing your voice', detail: 'Whisper is listening word-by-word.' },
  { key: 'extracting', label: 'Extracting structured fields', detail: 'Reading for provider, products, deal stage, next step, competitor signal.' },
  { key: 'complete', label: 'Done', detail: 'Bringing it on screen.' },
] as const

export default function Processing({ phase, error, onRetry }: ProcessingProps) {
  if (error) {
    return (
      <section className="relative">
        <div className="mx-auto max-w-[680px] px-6 pb-20 pt-24 text-center sm:px-10">
          <span className="fg-eyebrow mb-6 block" style={{ color: '#8a3a2c' }}>
            Something went wrong
          </span>
          <h2
            className="fg-display text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.1]"
            style={{ color: 'var(--fg-ink)' }}
          >
            We hit a snag.{' '}
            <span
              className="fg-display-italic leading-[1.5]"
              style={{ color: 'var(--fg-gilt-deep)' }}
            >
              Try again.
            </span>
          </h2>
          <p
            className="mt-6 text-[1rem] leading-[1.65]"
            style={{ color: 'var(--fg-ink-2)' }}
          >
            {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="fg-btn-gilt mt-8 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="relative">
      <div className="mx-auto max-w-[720px] px-6 pb-20 pt-24 sm:px-10 sm:pt-28">
        <span className="fg-eyebrow mb-8 block">Working</span>

        <h2
          className="fg-display text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.05]"
          style={{ color: 'var(--fg-ink)' }}
        >
          One moment.{' '}
          <span
            className="fg-display-italic leading-[1.5]"
            style={{ color: 'var(--fg-gilt-deep)' }}
          >
            We&apos;re reading the call.
          </span>
        </h2>

        <ol className="mt-12 space-y-6">
          {PHASES.map((p, i) => {
            const isActive = phase === p.key
            const isDone =
              (phase === 'extracting' && p.key === 'transcribing') ||
              (phase === 'complete' && p.key !== 'complete')
            const isPending = !isActive && !isDone

            return (
              <li
                key={p.key}
                className="flex items-baseline gap-6 border-b pb-6 last:border-b-0"
                style={{ borderColor: 'var(--fg-line)' }}
              >
                <span
                  className="fg-folio shrink-0 text-[1.4rem]"
                  style={{
                    color: isActive
                      ? 'var(--fg-gilt)'
                      : isDone
                      ? 'var(--fg-gilt-deep)'
                      : 'var(--fg-mute)',
                    opacity: isPending ? 0.4 : 1,
                  }}
                >
                  0{i + 1}
                </span>

                <div className="flex-1">
                  <p
                    className="fg-display text-[1.25rem] leading-[1.3] sm:text-[1.45rem]"
                    style={{
                      color: isPending
                        ? 'var(--fg-mute)'
                        : 'var(--fg-ink)',
                      fontVariationSettings: "'opsz' 24, 'SOFT' 30",
                    }}
                  >
                    {p.label}
                    {isActive && p.key !== 'complete' && (
                      <motion.span
                        aria-hidden="true"
                        className="ml-2 inline-block"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        …
                      </motion.span>
                    )}
                    {isDone && (
                      <span
                        className="ml-3 inline-block text-[0.75rem] uppercase tracking-[0.22em]"
                        style={{ color: 'var(--fg-gilt-deep)' }}
                      >
                        ✓ done
                      </span>
                    )}
                  </p>
                  <p
                    className="mt-2 text-[0.95rem] leading-[1.55]"
                    style={{
                      color: 'var(--fg-mute)',
                      opacity: isPending ? 0.6 : 1,
                    }}
                  >
                    {p.detail}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
