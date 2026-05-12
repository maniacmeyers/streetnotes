'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react'
import type { CRMNote, ConfidenceLevel } from '@/lib/notes/schema'
import type { PushResult } from '@/lib/crm/push/types'
import PushPlanReview from './push-plan-review'
import type { PushPlan, CrmSchema } from '@/lib/crm/schema/types'

interface NoteData {
  id: string
  title: string
  raw_transcript: string
  structured_output: Record<string, unknown> | null
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
  'fg-card'
const GLASS_VOLT =
  'fg-featured-card'
const BTN_VOLT =
  'fg-action'
const BTN_GHOST =
  'fg-secondary-action px-4'

function confidencePill(level: ConfidenceLevel) {
  const styles: Record<ConfidenceLevel, string> = {
    high: 'bg-[#A8855A] text-[#FAF6EE]',
    medium: 'bg-[#D4A28A]/28 text-[#8B6B40]',
    low: 'bg-[#F2EBDF] text-[#8B6B40]',
  }
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold ${styles[level]}`}
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
      <div className="fg-inset px-4 py-3">
        <p className="text-sm font-bold text-[#3D332A]">
          Not pushed to CRM
        </p>
      </div>
    )
  }

  if (pushStatus === 'success' && latest) {
    return (
      <div className={`${GLASS_VOLT} flex flex-col gap-1 px-4 py-3`}>
        <p className="text-sm font-extrabold text-[#8B6B40]">
          Pushed to {latest.crm_type}
        </p>
        {latest.contact_id && (
          <p className="text-xs font-bold text-[#3D332A]">
            Contact {latest.contact_created ? 'created' : 'found'}
          </p>
        )}
        {latest.deal_id && (
          <p className="text-xs font-bold text-[#3D332A]">
            Deal {latest.deal_created ? 'created' : 'updated'}
          </p>
        )}
        {latest.task_ids && latest.task_ids.length > 0 && (
          <p className="text-xs font-bold text-[#3D332A]">
            {latest.task_ids.length} task{latest.task_ids.length > 1 ? 's' : ''} created
          </p>
        )}
        <p className="mt-1 text-xs font-medium text-[#3D332A]/75">
          {new Date(latest.updated_at).toLocaleString()}
        </p>
      </div>
    )
  }

  if (pushStatus === 'failed' && latest) {
    return (
      <div className="fg-inset flex flex-col gap-1 px-4 py-3">
        <p className="text-sm font-extrabold text-[#8B6B40]">
          Push failed
        </p>
        {latest.error_message && (
          <p className="text-xs text-[#3D332A]">{latest.error_message}</p>
        )}
        <p className="mt-1 text-xs font-medium text-[#3D332A]/75">
          {new Date(latest.updated_at).toLocaleString()}
        </p>
      </div>
    )
  }

  if (pushStatus === 'pending') {
    return (
      <div className="fg-inset px-4 py-3">
        <p className="text-sm font-extrabold text-[#8B6B40]">
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
      <p className="text-xs font-extrabold text-[#3D332A]">
        {label}
      </p>
      <p className="flex items-center gap-2 text-base text-[#1A1410]">
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
    <div className={`${GLASS_BASE} flex flex-col gap-3 p-[22px]`}>
      <h3 className="text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-[#1A1410]">
        {index !== undefined && (
          <span className="text-[#A8855A]">{String(index).padStart(2, '0')} </span>
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
              className="fg-inset px-4 py-3"
            >
              <p className="flex items-center gap-2 font-bold text-[#1A1410]">
                {att.name || 'Unknown'} {confidencePill(att.confidence)}
              </p>
              {att.title && (
                <p className="text-sm text-[#3D332A]">{att.title}</p>
              )}
              {att.role && att.role !== 'Unknown' && (
                <p className="mt-1 text-xs font-bold text-[#3D332A]">
                  {att.role} · {att.sentiment}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {data.meetingSummary && data.meetingSummary.length > 0 && (
        <Section title="Meeting Summary" index={idx++}>
          <ul className="space-y-2 text-base text-[#3D332A]">
            {data.meetingSummary.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8855A]" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.nextSteps && data.nextSteps.length > 0 && (
        <Section title="Next Steps" index={idx++}>
          {data.nextSteps.map((step, i) => (
            <div
              key={i}
              className="fg-inset px-4 py-3"
            >
              <p className="flex items-center gap-2 text-[#1A1410]">
                <span className="font-bold">{step.task}</span>
                {confidencePill(step.confidence)}
              </p>
              <p className="mt-1 text-xs font-bold text-[#3D332A]">
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
          <p className="text-base leading-7 text-[#3D332A]">{data.opportunityNotes}</p>
        </Section>
      )}

      {data.painPoints && data.painPoints.length > 0 && (
        <Section title="Pain Points" index={idx++}>
          <ul className="space-y-2 text-base text-[#3D332A]">
            {data.painPoints.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A8855A]" aria-hidden="true" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {data.competitorsMentioned && data.competitorsMentioned.length > 0 && (
        <div className={`${GLASS_BASE} flex flex-wrap items-center gap-2 p-[22px]`}>
          <span className="text-xs font-extrabold text-[#3D332A]">
            Competitors:
          </span>
          {data.competitorsMentioned.map((c, i) => (
            <span
              key={i}
              className="inline-block rounded-full bg-[#D4A28A]/24 px-3 py-1 text-xs font-extrabold text-[#8B6B40]"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {data.productsDiscussed && data.productsDiscussed.length > 0 && (
        <div className={`${GLASS_BASE} flex flex-wrap items-center gap-2 p-[22px]`}>
          <span className="text-xs font-extrabold text-[#3D332A]">
            Products:
          </span>
          {data.productsDiscussed.map((p, i) => (
            <span
              key={i}
              className="inline-block rounded-full bg-[#D4A28A]/24 px-3 py-1 text-xs font-extrabold text-[#8B6B40]"
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
    <div className="fg-page flex animate-pulse flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="h-5 w-16 rounded bg-[#A8855A]/15" />
        <div className="h-4 w-20 rounded bg-[#A8855A]/10" />
      </div>
      <div className="h-10 w-2/3 rounded bg-[#A8855A]/15" />
      <div className={`${GLASS_BASE} h-16`} />
      <div className={`${GLASS_BASE} flex flex-col gap-3 p-4`}>
        <div className="h-4 w-1/3 rounded bg-[#A8855A]/15" />
        <div className="h-4 w-full rounded bg-[#A8855A]/10" />
        <div className="h-4 w-2/3 rounded bg-[#A8855A]/10" />
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
  const [schema, setSchema] = useState<CrmSchema | null>(null)
  const [showPlanReview, setShowPlanReview] = useState(false)

  const parsedOutput = useMemo(() => {
    if (!note?.structured_output) return { crmNote: null, pushPlan: undefined }
    const so = note.structured_output as Record<string, unknown>
    if ('crmNote' in so) {
      return {
        crmNote: so.crmNote as CRMNote,
        pushPlan: so.pushPlan as PushPlan | undefined,
      }
    }
    return { crmNote: so as unknown as CRMNote, pushPlan: undefined }
  }, [note?.structured_output])

  const structured = parsedOutput.crmNote
  const pushPlan = parsedOutput.pushPlan

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

  useEffect(() => {
    if (!pushPlan || pushPlan.crmType === 'none') return
    fetch(`/api/crm/schema?crmType=${pushPlan.crmType}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.schema) setSchema(data.schema) })
      .catch(() => {})
  }, [pushPlan])

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
      <div className="fg-page flex flex-col gap-4">
        <p className="text-sm font-extrabold text-[#8B6B40]">
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

  const canPush =
    !isPushing && note.push_status !== 'success' && note.push_status !== 'pending'

  return (
    <div className="fg-page flex flex-col gap-5">
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
        <p className="text-sm font-bold text-[#3D332A]">
          {new Date(note.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Title */}
      <h1 className="fg-title">
        {note.title || 'Untitled'}
      </h1>

      {/* CRM Sync Status */}
      <SyncStatus pushStatus={note.push_status} pushLog={pushLog} />

      {/* Push / Retry button */}
      {canPush && !showPlanReview && (
        <button
          type="button"
          onClick={() => {
            if (pushPlan) {
              setShowPlanReview(true)
            } else {
              void handleRetryPush()
            }
          }}
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

      {/* Push Plan Review */}
      {showPlanReview && pushPlan && structured && (
        <PushPlanReview
          crmNote={structured}
          pushPlan={pushPlan}
          schema={schema}
          isPushing={isPushing}
          onConfirm={async (finalPlan, newRules) => {
            setIsPushing(true)
            setPushError(null)
            try {
              // Save sticky rules if any
              if (newRules.length > 0) {
                await fetch('/api/crm/rules', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ crmType: finalPlan.crmType, rules: newRules }),
                })
              }
              // Push with the confirmed plan
              const res = await fetch('/api/crm/push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId: note.id }),
              })
              const data = await res.json()
              if (!res.ok || !data.success) {
                setPushError(data.error || 'Push failed')
              } else {
                setShowPlanReview(false)
                // Refresh note data
                const refreshRes = await fetch(`/api/notes/${noteId}`)
                if (refreshRes.ok) {
                  const refreshData = await refreshRes.json()
                  setNote(refreshData.note)
                  setPushLog(refreshData.pushLog)
                }
              }
            } catch {
              setPushError('Network error. Try again.')
            } finally {
              setIsPushing(false)
            }
          }}
          onCancel={() => setShowPlanReview(false)}
        />
      )}

      {pushError && (
        <div className="fg-inset px-4 py-3">
          <p className="text-sm font-extrabold text-[#8B6B40]">
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
            className="flex min-h-[48px] items-center gap-2 text-sm font-extrabold text-[#8B6B40]"
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
              <div className="fg-inset px-4 py-3">
                <p className="whitespace-pre-wrap text-base leading-7 text-[#3D332A]">
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
