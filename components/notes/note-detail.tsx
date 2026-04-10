'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react'
import type { CRMNote, ConfidenceLevel } from '@/lib/notes/schema'
import type { PushResult } from '@/lib/crm/push/types'

interface NoteData {
  id: string
  title: string
  raw_transcript: string
  structured_output: CRMNote | null
  status: string
  push_status: string | null
  created_at: string
}

interface PushLogEntry {
  id: string
  crm_type: string
  status: string
  contact_id: string | null
  contact_created: boolean
  deal_id: string | null
  deal_created: boolean
  task_ids: string[]
  error_message: string | null
  created_at: string
  updated_at: string
}

const GLASS_BASE =
  'rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]'
const GLASS_VOLT =
  'rounded-2xl border border-volt/22 bg-gradient-to-br from-volt/8 via-white/5 to-volt/3 backdrop-blur-xl shadow-[0_24px_80px_-20px_rgba(0,230,118,0.25),inset_0_1px_0_rgba(255,255,255,0.22)]'
const BTN_VOLT =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-volt/50 bg-volt/15 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-volt/25 disabled:opacity-40 disabled:cursor-not-allowed'
const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md transition hover:bg-white/10 disabled:opacity-40'

function confidencePill(level: ConfidenceLevel) {
  const styles: Record<ConfidenceLevel, string> = {
    high: 'border-volt/40 bg-volt/15 text-volt',
    medium: 'border-white/20 bg-white/5 text-white/60',
    low: 'border-white/10 bg-white/[0.03] text-white/40',
  }
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] font-bold backdrop-blur-md ${styles[level]}`}
    >
      {level}
    </span>
  )
}

function SyncStatus({
  pushStatus,
  pushLog,
}: {
  pushStatus: string | null
  pushLog: PushLogEntry[]
}) {
  const latest = pushLog[0]

  if (!pushStatus && !latest) {
    return (
      <div className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
          Not pushed to CRM
        </p>
      </div>
    )
  }

  if (pushStatus === 'success' && latest) {
    return (
      <div className={`${GLASS_VOLT} px-4 py-3 flex flex-col gap-1`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt">
          Pushed to {latest.crm_type}
        </p>
        {latest.contact_id && (
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-volt/80">
            Contact {latest.contact_created ? 'created' : 'found'}
          </p>
        )}
        {latest.deal_id && (
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-volt/80">
            Deal {latest.deal_created ? 'created' : 'updated'}
          </p>
        )}
        {latest.task_ids && latest.task_ids.length > 0 && (
          <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-volt/80">
            {latest.task_ids.length} task{latest.task_ids.length > 1 ? 's' : ''} created
          </p>
        )}
        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-volt/60 mt-1">
          {new Date(latest.updated_at).toLocaleString()}
        </p>
      </div>
    )
  }

  if (pushStatus === 'failed' && latest) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-md px-4 py-3 flex flex-col gap-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-red-400">
          Push failed
        </p>
        {latest.error_message && (
          <p className="font-body text-xs text-red-300">{latest.error_message}</p>
        )}
        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-red-400/60 mt-1">
          {new Date(latest.updated_at).toLocaleString()}
        </p>
      </div>
    )
  }

  if (pushStatus === 'pending') {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-amber-300">
          Push pending...
        </p>
      </div>
    )
  }

  return null
}

function ReadOnlyField({
  label,
  value,
  confidence,
}: {
  label: string
  value?: string
  confidence?: ConfidenceLevel
}) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
        {label}
      </p>
      <p className="font-body text-base text-white/90 flex items-center gap-2">
        {value} {confidence && confidencePill(confidence)}
      </p>
    </div>
  )
}

function Section({
  title,
  index,
  children,
}: {
  title: string
  index?: number
  children: React.ReactNode
}) {
  return (
    <div className={`${GLASS_BASE} p-5 flex flex-col gap-3`}>
      <h3 className="font-display uppercase text-lg text-white leading-none">
        {index !== undefined && (
          <span className="text-volt">{String(index).padStart(2, '0')} </span>
        )}
        {title}
      </h3>
      {children}
    </div>
  )
}

function StructuredFields({ data }: { data: CRMNote }) {
  let idx = 1
  return (
    <div className="flex flex-col gap-5">
      {(data.contactName || data.company) && (
        <Section title="Contact / Company" index={idx++}>
          <ReadOnlyField
            label="Name"
            value={data.contactName}
            confidence={data.contactNameConfidence}
          />
          <ReadOnlyField
            label="Company"
            value={data.company}
            confidence={data.companyConfidence}
          />
        </Section>
      )}

      {(data.dealStage || data.estimatedValue || data.closeDate) && (
        <Section title="Deal Snapshot" index={idx++}>
          <ReadOnlyField
            label="Stage"
            value={data.dealStage}
            confidence={data.dealStageConfidence}
          />
          <ReadOnlyField
            label="Value"
            value={data.estimatedValue}
            confidence={data.estimatedValueConfidence}
          />
          <ReadOnlyField
            label="Close date"
            value={data.closeDate}
            confidence={data.closeDateConfidence}
          />
        </Section>
      )}

      {data.attendees && data.attendees.length > 0 && (
        <Section title="Attendees" index={idx++}>
          {data.attendees.map((att, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-3"
            >
              <p className="font-body font-bold text-white flex items-center gap-2">
                {att.name || 'Unknown'} {confidencePill(att.confidence)}
              </p>
              {att.title && (
                <p className="font-body text-sm text-white/70">{att.title}</p>
              )}
              {att.role && att.role !== 'Unknown' && (
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 mt-1">
                  {att.role} · {att.sentiment}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {data.meetingSummary && data.meetingSummary.length > 0 && (
        <Section title="Meeting Summary" index={idx++}>
          <ul className="list-disc list-inside font-body text-base text-white/85 space-y-1">
            {data.meetingSummary.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </Section>
      )}

      {data.nextSteps && data.nextSteps.length > 0 && (
        <Section title="Next Steps" index={idx++}>
          {data.nextSteps.map((step, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-3"
            >
              <p className="font-body text-white/90 flex items-center gap-2">
                <span className="font-bold">{step.task}</span>
                {confidencePill(step.confidence)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 mt-1">
                {step.owner === 'rep' ? 'You' : 'Prospect'}
                {step.dueDate ? ` · ${step.dueDate}` : ''}
                {' · '}
                {step.priority} priority
              </p>
            </div>
          ))}
        </Section>
      )}

      {data.opportunityNotes && (
        <Section title="CRM Notes" index={idx++}>
          <p className="font-body text-base text-white/85">{data.opportunityNotes}</p>
        </Section>
      )}

      {data.painPoints && data.painPoints.length > 0 && (
        <Section title="Pain Points" index={idx++}>
          <ul className="list-disc list-inside font-body text-base text-white/85 space-y-1">
            {data.painPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Section>
      )}

      {data.competitorsMentioned && data.competitorsMentioned.length > 0 && (
        <div className={`${GLASS_BASE} p-5 flex flex-wrap items-center gap-2`}>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
            Competitors:
          </span>
          {data.competitorsMentioned.map((c, i) => (
            <span
              key={i}
              className="inline-block rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {data.productsDiscussed && data.productsDiscussed.length > 0 && (
        <div className={`${GLASS_BASE} p-5 flex flex-wrap items-center gap-2`}>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
            Products:
          </span>
          {data.productsDiscussed.map((p, i) => (
            <span
              key={i}
              className="inline-block rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="px-4 py-6 flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-white/10 rounded w-16" />
        <div className="h-4 bg-white/5 rounded w-20" />
      </div>
      <div className="h-10 bg-white/10 rounded w-2/3" />
      <div className={`${GLASS_BASE} h-16`} />
      <div className={`${GLASS_BASE} p-4 flex flex-col gap-3`}>
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
      </div>
    </div>
  )
}

export default function NoteDetail({ noteId }: { noteId: string }) {
  const router = useRouter()
  const [note, setNote] = useState<NoteData | null>(null)
  const [pushLog, setPushLog] = useState<PushLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isPushing, setIsPushing] = useState(false)
  const [pushError, setPushError] = useState<string | null>(null)

  const [showTranscript, setShowTranscript] = useState(false)

  useEffect(() => {
    fetch(`/api/notes/${noteId}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(data => {
        setNote(data.note)
        setPushLog(data.pushLog)
      })
      .catch(() => setError('Note not found'))
      .finally(() => setLoading(false))
  }, [noteId])

  const handleRetryPush = async () => {
    if (!note) return
    setIsPushing(true)
    setPushError(null)

    try {
      const res = await fetch('/api/crm/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: note.id }),
      })

      const data = (await res.json()) as PushResult & { error?: string }

      if (!res.ok || !data.success) {
        setPushError(data.error || 'Push failed')
        return
      }

      const refreshRes = await fetch(`/api/notes/${noteId}`)
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        setNote(refreshData.note)
        setPushLog(refreshData.pushLog)
      }
    } catch {
      setPushError('Network error. Try again.')
    } finally {
      setIsPushing(false)
    }
  }

  if (loading) return <DetailSkeleton />

  if (error || !note) {
    return (
      <div className="px-4 py-6 flex flex-col gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-red-400">
          {error || 'Note not found'}
        </p>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className={BTN_GHOST}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to dashboard
        </button>
      </div>
    )
  }

  const structured = note.structured_output as CRMNote | null
  const canPush =
    !isPushing && note.push_status !== 'success' && note.push_status !== 'pending'

  return (
    <div className="px-4 py-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className={BTN_GHOST}
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
          {new Date(note.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Title */}
      <h1 className="font-display uppercase text-4xl sm:text-5xl text-white leading-[0.85]">
        {note.title || 'Untitled'}
      </h1>

      {/* CRM Sync Status */}
      <SyncStatus pushStatus={note.push_status} pushLog={pushLog} />

      {/* Push / Retry button */}
      {canPush && (
        <button
          type="button"
          onClick={() => void handleRetryPush()}
          disabled={isPushing}
          className={BTN_VOLT}
        >
          {isPushing
            ? 'Pushing...'
            : note.push_status === 'failed'
              ? 'Retry push to CRM'
              : 'Push to CRM'}
        </button>
      )}

      {pushError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-md px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-red-400">
            {pushError}
          </p>
        </div>
      )}

      {/* Structured fields */}
      {structured && <StructuredFields data={structured} />}

      {/* Transcript (collapsible) */}
      {note.raw_transcript && (
        <div>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            aria-label={showTranscript ? 'Hide transcript' : 'Show transcript'}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/60 hover:text-volt min-h-[44px]"
          >
            {showTranscript ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Transcript
          </button>
          {showTranscript && (
            <div className={`mt-3 ${GLASS_BASE} p-5`}>
              <div className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-3">
                <p className="font-body text-base text-white/85 whitespace-pre-wrap">
                  {note.raw_transcript}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
