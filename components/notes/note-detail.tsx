'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react'
import type { CRMNote, ConfidenceLevel } from '@/lib/notes/schema'
import type { PushResult } from '@/lib/crm/push/types'
import { BrutalCard, BrutalButton, BrutalBadge } from '@/components/streetnotes/brutal'

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

function confidenceBadge(level: ConfidenceLevel) {
  const variant: Record<ConfidenceLevel, 'volt' | 'amber' | 'red'> = {
    high: 'volt',
    medium: 'amber',
    low: 'red',
  }
  return <BrutalBadge variant={variant[level]}>{level}</BrutalBadge>
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
      <div className="bg-black/60 border-4 border-black px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-wider font-bold text-gray-400">
          Not pushed to CRM
        </p>
      </div>
    )
  }

  if (pushStatus === 'success' && latest) {
    return (
      <div className="bg-volt/20 border-4 border-volt px-4 py-3 flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-wider font-bold text-volt">
          Pushed to {latest.crm_type}
        </p>
        {latest.contact_id && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-volt/80">
            Contact {latest.contact_created ? 'created' : 'found'}
          </p>
        )}
        {latest.deal_id && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-volt/80">
            Deal {latest.deal_created ? 'created' : 'updated'}
          </p>
        )}
        {latest.task_ids && latest.task_ids.length > 0 && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-volt/80">
            {latest.task_ids.length} task{latest.task_ids.length > 1 ? 's' : ''} created
          </p>
        )}
        <p className="font-mono text-[9px] uppercase tracking-wider text-volt/60 mt-1">
          {new Date(latest.updated_at).toLocaleString()}
        </p>
      </div>
    )
  }

  if (pushStatus === 'failed' && latest) {
    return (
      <div className="bg-red-900/40 border-4 border-red-600 px-4 py-3 flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-wider font-bold text-red-400">
          Push failed
        </p>
        {latest.error_message && (
          <p className="font-body text-xs text-red-300">{latest.error_message}</p>
        )}
        <p className="font-mono text-[9px] uppercase tracking-wider text-red-400/60 mt-1">
          {new Date(latest.updated_at).toLocaleString()}
        </p>
      </div>
    )
  }

  if (pushStatus === 'pending') {
    return (
      <div className="bg-amber-900/30 border-4 border-amber-500 px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-wider font-bold text-amber-400">
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
    <div className="flex flex-col gap-0.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-black/60">
        {label}
      </p>
      <p className="font-body text-base text-black flex items-center gap-2">
        {value} {confidence && confidenceBadge(confidence)}
      </p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display uppercase text-lg text-black leading-none">{title}</h3>
      {children}
    </div>
  )
}

function StructuredFields({ data }: { data: CRMNote }) {
  return (
    <div className="flex flex-col gap-6">
      {(data.contactName || data.company) && (
        <Section title="Contact / Company">
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
        <Section title="Deal Snapshot">
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
        <Section title="Attendees">
          {data.attendees.map((att, i) => (
            <div key={i} className="border-l-4 border-black pl-3 py-1">
              <p className="font-body font-bold text-black flex items-center gap-2">
                {att.name || 'Unknown'} {confidenceBadge(att.confidence)}
              </p>
              {att.title && (
                <p className="font-body text-sm text-black/70">{att.title}</p>
              )}
              {att.role && att.role !== 'Unknown' && (
                <p className="font-mono text-[10px] uppercase tracking-wider text-black/60">
                  {att.role} · {att.sentiment}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {data.meetingSummary && data.meetingSummary.length > 0 && (
        <Section title="Meeting Summary">
          <ul className="list-disc list-inside font-body text-base text-black space-y-1">
            {data.meetingSummary.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </Section>
      )}

      {data.nextSteps && data.nextSteps.length > 0 && (
        <Section title="Next Steps">
          {data.nextSteps.map((step, i) => (
            <div key={i} className="border-l-4 border-black pl-3 py-1">
              <p className="font-body text-black flex items-center gap-2">
                <span className="font-bold">{step.task}</span>
                {confidenceBadge(step.confidence)}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-black/60 mt-0.5">
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
        <Section title="CRM Notes">
          <p className="font-body text-base text-black">{data.opportunityNotes}</p>
        </Section>
      )}

      {data.painPoints && data.painPoints.length > 0 && (
        <Section title="Pain Points">
          <ul className="list-disc list-inside font-body text-base text-black space-y-1">
            {data.painPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Section>
      )}

      {data.competitorsMentioned && data.competitorsMentioned.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-black">
            Competitors:
          </span>
          {data.competitorsMentioned.map((c, i) => (
            <BrutalBadge key={i} variant="white">
              {c}
            </BrutalBadge>
          ))}
        </div>
      )}

      {data.productsDiscussed && data.productsDiscussed.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-black">
            Products:
          </span>
          {data.productsDiscussed.map((p, i) => (
            <BrutalBadge key={i} variant="white">
              {p}
            </BrutalBadge>
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
        <div className="h-5 bg-gray-800 w-16" />
        <div className="h-4 bg-gray-900 w-20" />
      </div>
      <div className="h-10 bg-gray-800 w-2/3" />
      <div className="h-16 bg-gray-900 border-4 border-black" />
      <div className="bg-white border-4 border-black p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 w-1/3" />
        <div className="h-4 bg-gray-100 w-full" />
        <div className="h-4 bg-gray-100 w-2/3" />
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
        <p className="font-mono text-sm uppercase tracking-wider font-bold text-red-400">
          {error || 'Note not found'}
        </p>
        <BrutalButton
          type="button"
          onClick={() => router.push('/dashboard')}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to dashboard
        </BrutalButton>
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
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-volt min-w-[44px] min-h-[44px]"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
          {new Date(note.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Title */}
      <h1
        className="font-display uppercase text-3xl sm:text-4xl text-white leading-[0.85]"
        style={{ textShadow: '2px 2px 0px #000000' }}
      >
        {note.title || 'Untitled'}
      </h1>

      {/* CRM Sync Status */}
      <SyncStatus pushStatus={note.push_status} pushLog={pushLog} />

      {/* Push / Retry button */}
      {canPush && (
        <BrutalButton
          type="button"
          onClick={() => void handleRetryPush()}
          disabled={isPushing}
          variant="volt"
          size="lg"
        >
          {isPushing
            ? 'Pushing...'
            : note.push_status === 'failed'
              ? 'Retry push to CRM'
              : 'Push to CRM'}
        </BrutalButton>
      )}

      {pushError && (
        <div className="bg-red-100 border-4 border-red-600 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider font-bold text-red-700">
            {pushError}
          </p>
        </div>
      )}

      {/* Structured fields */}
      {structured && (
        <BrutalCard variant="white" padded>
          <StructuredFields data={structured} />
        </BrutalCard>
      )}

      {/* Transcript (collapsible) */}
      {note.raw_transcript && (
        <div>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            aria-label={showTranscript ? 'Hide transcript' : 'Show transcript'}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-volt min-h-[44px]"
          >
            {showTranscript ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Transcript
          </button>
          {showTranscript && (
            <div className="mt-3 bg-white border-4 border-black p-4">
              <p className="font-body text-base text-black whitespace-pre-wrap">
                {note.raw_transcript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
