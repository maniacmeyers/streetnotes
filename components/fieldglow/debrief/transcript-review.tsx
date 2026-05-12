'use client'

import { useState } from 'react'

interface TranscriptReviewProps {
  transcript: string
  onConfirm: (editedTranscript: string) => void
  onReRecord: () => void
}

export default function TranscriptReview({
  transcript,
  onConfirm,
  onReRecord,
}: TranscriptReviewProps) {
  const [edited, setEdited] = useState(transcript)

  return (
    <section className="relative">
      <div className="mx-auto max-w-[820px] px-6 pb-20 pt-16 sm:px-10 sm:pt-24">
        <header className="mb-10">
          <span className="fg-eyebrow mb-5 block">Step 03 — Review</span>
          <h2
            className="fg-display text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.05] tracking-tight"
            style={{ color: 'var(--fg-ink)' }}
          >
            Read it back.{' '}
            <span
              className="fg-display-italic leading-[1.5]"
              style={{ color: 'var(--fg-gilt-deep)' }}
            >
              Fix anything wrong.
            </span>
          </h2>
          <p
            className="mt-5 max-w-[60ch] text-[1.02rem] leading-[1.65]"
            style={{ color: 'var(--fg-ink-2)' }}
          >
            We&apos;ll only structure what&apos;s in the box below. Names of
            providers, products, and competitors are the most common things
            to correct.
          </p>
        </header>

        <textarea
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          rows={14}
          spellCheck={true}
          className="fg-display w-full resize-y border p-6 text-[1.05rem] leading-[1.7] outline-none transition-colors sm:p-8"
          style={{
            background: 'var(--fg-cream)',
            borderColor: 'var(--fg-line)',
            color: 'var(--fg-ink)',
            fontVariationSettings: "'opsz' 24, 'SOFT' 30",
            fontStyle: 'normal',
            minHeight: '320px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--fg-gilt)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--fg-line)'
          }}
        />

        <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onReRecord}
            className="fg-link cursor-pointer self-start py-3 sm:self-center"
          >
            ← Re-record
          </button>

          <button
            type="button"
            onClick={() => onConfirm(edited)}
            disabled={!edited.trim()}
            className="fg-btn-gilt cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Looks right · Extract
          </button>
        </div>
      </div>
    </section>
  )
}
