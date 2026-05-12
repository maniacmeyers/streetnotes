'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { DebriefOutput, DealSegment } from '@/lib/debrief/types'

interface ResultsProps {
  structured: DebriefOutput
  sessionId: string
  email: string
  durationSec: number
  onStartOver: () => void
}

const SEGMENT_LABEL: Record<DealSegment, string> = {
  'injector-check-in': 'Injector check-in',
  'new-practice': 'New practice',
  'practice-manager': 'Practice manager',
  'device-demo': 'Device demo',
  'lunch-learn': 'Lunch & learn',
  conference: 'Conference / event',
}

const PRIORITY_TONE: Record<string, string> = {
  high: 'var(--fg-gilt-deep)',
  medium: 'var(--fg-gilt)',
  low: 'var(--fg-mute)',
}

const SENTIMENT_DOT: Record<string, string> = {
  positive: '#7a9663',
  neutral: 'var(--fg-mute)',
  negative: '#a85a4a',
  unknown: 'var(--fg-line)',
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

/* ── Section heading ── */
function SectionHeading({
  number,
  title,
  count,
}: {
  number: string
  title: string
  count?: number
}) {
  return (
    <header className="mb-7 flex items-baseline gap-5 border-b pb-4"
      style={{ borderColor: 'var(--fg-line)' }}
    >
      <span
        className="fg-folio shrink-0 text-[1.4rem]"
        style={{ color: 'var(--fg-gilt)' }}
      >
        {number}
      </span>
      <h3
        className="fg-display flex-1 text-[1.3rem] leading-[1.25] sm:text-[1.55rem]"
        style={{
          color: 'var(--fg-ink)',
          fontVariationSettings: "'opsz' 24, 'SOFT' 30",
        }}
      >
        {title}
      </h3>
      {count !== undefined && (
        <span
          className="text-[0.78rem] uppercase tracking-[0.24em]"
          style={{ color: 'var(--fg-mute)' }}
        >
          {count}
        </span>
      )}
    </header>
  )
}

/* ── Field row ── */
function FieldRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  const empty = !value || value === 'Not mentioned'
  return (
    <div
      className="flex items-baseline gap-6 border-b py-4 last:border-b-0"
      style={{ borderColor: 'var(--fg-line)' }}
    >
      <span
        className="w-32 shrink-0 text-[0.72rem] uppercase tracking-[0.22em] sm:w-40"
        style={{ color: 'var(--fg-mute)' }}
      >
        {label}
      </span>
      <span
        className="flex-1 text-[1rem] leading-[1.55] sm:text-[1.05rem]"
        style={{
          color: empty ? 'var(--fg-mute)' : 'var(--fg-ink)',
          fontStyle: empty ? 'italic' : 'normal',
          opacity: empty ? 0.6 : 1,
        }}
      >
        {empty ? 'Not mentioned' : value}
      </span>
    </div>
  )
}

/* ── Tag ── */
function Tag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center border px-3 py-1.5 text-[0.85rem] leading-tight"
      style={{
        borderColor: 'var(--fg-line)',
        background: 'var(--fg-cream)',
        color: 'var(--fg-ink-2)',
      }}
    >
      {label}
    </span>
  )
}

export default function Results({
  structured,
  sessionId,
  email,
  durationSec,
  onStartOver,
}: ResultsProps) {
  const d = structured
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadPDF() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/debrief/pdf?sessionId=${sessionId}`)
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fieldglow-brain-dump-${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // soft-fail; the user already has the data on screen
    } finally {
      setDownloading(false)
    }
  }

  return (
    <section className="relative">
      <div className="mx-auto max-w-[1080px] px-6 pb-24 pt-12 sm:px-10 sm:pt-16">
        {/* Header */}
        <header
          className="mb-12 flex flex-col items-start justify-between gap-5 border-b pb-8 sm:flex-row sm:items-end"
          style={{ borderColor: 'var(--fg-line)' }}
        >
          <div>
            <span className="fg-eyebrow mb-4 block">
              Your brain dump · structured
            </span>
            <h2
              className="fg-display text-[clamp(2rem,4.5vw,3.4rem)] leading-[1] tracking-tight"
              style={{ color: 'var(--fg-ink)' }}
            >
              {d.dealSnapshot.companyName || 'The call'}
              {d.dealSegment && (
                <>
                  ,{' '}
                  <span
                    className="fg-display-italic leading-[1.5]"
                    style={{ color: 'var(--fg-gilt-deep)' }}
                  >
                    {SEGMENT_LABEL[d.dealSegment].toLowerCase()}.
                  </span>
                </>
              )}
            </h2>
            <p
              className="mt-3 text-[0.78rem] uppercase tracking-[0.22em]"
              style={{ color: 'var(--fg-mute)' }}
            >
              {email} · {formatDuration(durationSec)} of voice ·{' '}
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="fg-btn-primary cursor-pointer disabled:cursor-wait disabled:opacity-70"
            >
              {downloading ? 'Building PDF…' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={onStartOver}
              className="fg-link cursor-pointer self-center py-2"
            >
              Start over
            </button>
          </div>
        </header>

        {/* Content grid */}
        <div className="grid gap-12 sm:grid-cols-12 sm:gap-x-14 sm:gap-y-16">
          {/* Deal snapshot */}
          <article className="sm:col-span-7">
            <SectionHeading number="01" title="Deal snapshot" />
            <FieldRow label="Practice / company" value={d.dealSnapshot.companyName} />
            <FieldRow label="Stage" value={d.dealSnapshot.dealStage} />
            <FieldRow label="Estimated value" value={d.dealSnapshot.estimatedValue} />
            <FieldRow label="Close date" value={d.dealSnapshot.closeDate} />
            <FieldRow label="Next step" value={d.dealSnapshot.nextStep} />
          </article>

          {/* Attendees */}
          <article className="sm:col-span-5">
            <SectionHeading
              number="02"
              title="Attendees"
              count={d.attendees.length}
            />
            {d.attendees.length === 0 ? (
              <p
                className="text-[0.95rem] italic"
                style={{ color: 'var(--fg-mute)' }}
              >
                None identified.
              </p>
            ) : (
              <ul className="space-y-5">
                {d.attendees.map((a, i) => (
                  <li
                    key={`${a.name}-${i}`}
                    className="flex items-start gap-4 border-b pb-5 last:border-b-0"
                    style={{ borderColor: 'var(--fg-line)' }}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ background: SENTIMENT_DOT[a.sentiment] }}
                    />
                    <div className="flex-1">
                      <p
                        className="fg-display text-[1.05rem] leading-[1.3]"
                        style={{
                          color: 'var(--fg-ink)',
                          fontVariationSettings: "'opsz' 24, 'SOFT' 30",
                        }}
                      >
                        {a.name || 'Unnamed'}
                      </p>
                      <p
                        className="mt-1 text-[0.88rem]"
                        style={{ color: 'var(--fg-ink-2)' }}
                      >
                        {a.title}
                        {a.role && (
                          <>
                            {' · '}
                            <span style={{ color: 'var(--fg-mute)' }}>
                              {a.role}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className="text-[0.7rem] uppercase tracking-[0.2em]"
                      style={{ color: SENTIMENT_DOT[a.sentiment] }}
                    >
                      {a.sentiment}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          {/* Call summary */}
          <article className="sm:col-span-12">
            <SectionHeading number="03" title="Call summary" />
            <ul className="space-y-3">
              {d.callSummary.map((line, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-4 text-[1.02rem] leading-[1.7]"
                  style={{ color: 'var(--fg-ink)' }}
                >
                  <span
                    className="fg-display-italic shrink-0 text-[0.95rem] leading-[1.5]"
                    style={{ color: 'var(--fg-gilt-deep)' }}
                  >
                    —
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Follow-up tasks */}
          <article className="sm:col-span-7">
            <SectionHeading
              number="04"
              title="Follow-up tasks"
              count={d.followUpTasks.length}
            />
            {d.followUpTasks.length === 0 ? (
              <p
                className="text-[0.95rem] italic"
                style={{ color: 'var(--fg-mute)' }}
              >
                None identified.
              </p>
            ) : (
              <ul>
                {d.followUpTasks.map((t, i) => (
                  <li
                    key={i}
                    className="border-l-2 py-4 pl-5"
                    style={{
                      borderColor: PRIORITY_TONE[t.priority] || 'var(--fg-line)',
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <p
                        className="text-[1rem] leading-[1.55]"
                        style={{ color: 'var(--fg-ink)' }}
                      >
                        {t.task}
                      </p>
                      <span
                        className="shrink-0 text-[0.68rem] uppercase tracking-[0.22em]"
                        style={{
                          color: PRIORITY_TONE[t.priority] || 'var(--fg-mute)',
                        }}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <p
                      className="mt-2 text-[0.82rem]"
                      style={{ color: 'var(--fg-mute)' }}
                    >
                      Owner: {t.owner === 'rep' ? 'You' : 'Prospect'} · Due:{' '}
                      {t.dueDate || 'unspecified'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </article>

          {/* Products + competitors + risks */}
          <aside className="sm:col-span-5">
            <SectionHeading number="05" title="Signal" />

            {d.productsDiscussed.length > 0 && (
              <div className="mb-7">
                <p
                  className="mb-3 text-[0.7rem] uppercase tracking-[0.24em]"
                  style={{ color: 'var(--fg-gilt)' }}
                >
                  Products discussed
                </p>
                <div className="flex flex-wrap gap-2">
                  {d.productsDiscussed.map((p) => (
                    <Tag key={p} label={p} />
                  ))}
                </div>
              </div>
            )}

            {d.competitorsMentioned.length > 0 && (
              <div className="mb-7">
                <p
                  className="mb-3 text-[0.7rem] uppercase tracking-[0.24em]"
                  style={{ color: 'var(--fg-gilt)' }}
                >
                  Competitors mentioned
                </p>
                <div className="flex flex-wrap gap-2">
                  {d.competitorsMentioned.map((c) => (
                    <Tag key={c} label={c} />
                  ))}
                </div>
              </div>
            )}

            {d.painPoints.length > 0 && (
              <div className="mb-7">
                <p
                  className="mb-3 text-[0.7rem] uppercase tracking-[0.24em]"
                  style={{ color: 'var(--fg-gilt)' }}
                >
                  Pain points
                </p>
                <ul className="space-y-2">
                  {d.painPoints.map((p, i) => (
                    <li
                      key={i}
                      className="text-[0.95rem] leading-[1.55]"
                      style={{ color: 'var(--fg-ink-2)' }}
                    >
                      — {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {d.risks.length > 0 && (
              <div>
                <p
                  className="mb-3 text-[0.7rem] uppercase tracking-[0.24em]"
                  style={{ color: '#8a3a2c' }}
                >
                  Risks
                </p>
                <ul className="space-y-2">
                  {d.risks.map((r, i) => (
                    <li
                      key={i}
                      className="text-[0.95rem] leading-[1.55]"
                      style={{ color: 'var(--fg-ink-2)' }}
                    >
                      — {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>

          {/* Opportunity notes */}
          <article className="sm:col-span-12">
            <SectionHeading number="06" title="Opportunity notes — paste into CRM" />
            <div
              className="border p-7 sm:p-9"
              style={{
                background: 'var(--fg-cream)',
                borderColor: 'var(--fg-line)',
              }}
            >
              <p
                className="text-[1.02rem] leading-[1.75]"
                style={{ color: 'var(--fg-ink)' }}
              >
                {d.opportunityNotes}
              </p>
            </div>
          </article>
        </div>

        {/* Bridge CTA */}
        <div
          className="mt-24 grid gap-10 border-t pt-14 sm:grid-cols-12 sm:gap-12"
          style={{ borderColor: 'var(--fg-line)' }}
        >
          <div className="sm:col-span-7">
            <span className="fg-eyebrow mb-5 block">
              Liked it? Here&apos;s what you didn&apos;t get free
            </span>
            <h3
              className="fg-display text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.05]"
              style={{ color: 'var(--fg-ink)' }}
            >
              FieldGlow does this{' '}
              <span
                className="fg-display-italic leading-[1.5]"
                style={{ color: 'var(--fg-gilt-deep)' }}
              >
                after every call
              </span>{' '}
              — and pushes it straight to Salesforce.
            </h3>
            <p
              className="mt-5 max-w-[58ch] text-[1.02rem] leading-[1.7]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              Plus a live competitor-intel dashboard for your VP, a Story
              Vault that scores your best pitches, and a memory that learns
              your territory call by call. Apply for a Salesforce pilot when
              you are ready to turn this into a team workflow.
            </p>
          </div>
          <div className="sm:col-span-5 sm:flex sm:items-end sm:justify-end">
            <Link
              href="/fieldglow#apply"
              className="fg-btn-gilt inline-flex w-full cursor-pointer justify-center sm:w-auto"
            >
              Apply for pilot access
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
