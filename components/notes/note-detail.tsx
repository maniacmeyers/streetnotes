'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

function confidenceBadge(level: ConfidenceLevel) {
  const styles: Record<ConfidenceLevel, string> = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded ${styles[level]}`}>
      {level}
    </span>
  )
}

function SyncStatus({ pushStatus, pushLog }: { pushStatus: string | null; pushLog: PushLogEntry[] }) {
  const latest = pushLog[0]

  if (!pushStatus && !latest) {
    return (
      <div className="rounded-md bg-gray-50 border border-gray-200 px-4 py-3">
        <p className="text-base text-gray-600">Not pushed to CRM</p>
      </div>
    )
  }

  if (pushStatus === 'success' && latest) {
    return (
      <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 flex flex-col gap-1">
        <p className="text-base text-green-700 font-medium">
          Pushed to {latest.crm_type}
        </p>
        {latest.contact_id && (
          <p className="text-sm text-green-600">
            Contact {latest.contact_created ? 'created' : 'found'}
          </p>
        )}
        {latest.deal_id && (
          <p className="text-sm text-green-600">
            Deal {latest.deal_created ? 'created' : 'updated'}
          </p>
        )}
        {latest.task_ids && latest.task_ids.length > 0 && (
          <p className="text-sm text-green-600">
            {latest.task_ids.length} task{latest.task_ids.length > 1 ? 's' : ''} created
          </p>
        )}
        <p className="text-xs text-green-500 mt-1">
          {new Date(latest.updated_at).toLocaleString()}
        </p>
      </div>
    )
  }

  if (pushStatus === 'failed' && latest) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 flex flex-col gap-1">
        <p className="text-base text-red-700 font-medium">Push failed</p>
        {latest.error_message && (
          <p className="text-sm text-red-600">{latest.error_message}</p>
        )}
        <p className="text-xs text-red-500 mt-1">
          {new Date(latest.updated_at).toLocaleString()}
        </p>
      </div>
    )
  }

  if (pushStatus === 'pending') {
    return (
      <div className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3">
        <p className="text-base text-yellow-700">Push pending...</p>
      </div>
    )
  }

  return null
}

function ReadOnlyField({ label, value, confidence }: { label: string; value?: string; confidence?: ConfidenceLevel }) {
  if (!value) return null
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base">
        {value} {confidence && confidenceBadge(confidence)}
      </p>
    </div>
  )
}

function StructuredFields({ data }: { data: CRMNote }) {
  return (
    <div className="flex flex-col gap-4">
      {(data.contactName || data.company) && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">Contact / Company</h3>
          <ReadOnlyField label="Name" value={data.contactName} confidence={data.contactNameConfidence} />
          <ReadOnlyField label="Company" value={data.company} confidence={data.companyConfidence} />
        </div>
      )}

      {(data.dealStage || data.estimatedValue || data.closeDate) && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">Deal Snapshot</h3>
          <ReadOnlyField label="Stage" value={data.dealStage} confidence={data.dealStageConfidence} />
          <ReadOnlyField label="Value" value={data.estimatedValue} confidence={data.estimatedValueConfidence} />
          <ReadOnlyField label="Close date" value={data.closeDate} confidence={data.closeDateConfidence} />
        </div>
      )}

      {data.attendees && data.attendees.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">Attendees</h3>
          {data.attendees.map((att, i) => (
            <div key={i} className="border-l-2 border-gray-200 pl-3 py-1">
              <p className="font-medium">
                {att.name || 'Unknown'} {confidenceBadge(att.confidence)}
              </p>
              {att.title && <p className="text-sm text-gray-600">{att.title}</p>}
              {att.role && att.role !== 'Unknown' && (
                <p className="text-sm text-gray-500">{att.role} · {att.sentiment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {data.meetingSummary && data.meetingSummary.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">Meeting Summary</h3>
          <ul className="list-disc list-inside text-base space-y-1">
            {data.meetingSummary.map((point, i) => <li key={i}>{point}</li>)}
          </ul>
        </div>
      )}

      {data.nextSteps && data.nextSteps.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-base font-semibold">Next Steps</h3>
          {data.nextSteps.map((step, i) => (
            <div key={i} className="border-l-2 border-gray-200 pl-3 py-1">
              <p>
                <span className="font-medium">{step.task}</span>{' '}
                {confidenceBadge(step.confidence)}
              </p>
              <p className="text-sm text-gray-500">
                {step.owner === 'rep' ? 'You' : 'Prospect'}
                {step.dueDate ? ` · ${step.dueDate}` : ''}
                {' · '}{step.priority} priority
              </p>
            </div>
          ))}
        </div>
      )}

      {data.opportunityNotes && (
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">CRM Notes</h3>
          <p className="text-base text-gray-700">{data.opportunityNotes}</p>
        </div>
      )}

      {data.painPoints && data.painPoints.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">Pain Points</h3>
          <ul className="list-disc list-inside text-base space-y-1">
            {data.painPoints.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      {data.competitorsMentioned && data.competitorsMentioned.length > 0 && (
        <p className="text-base">
          <span className="font-semibold">Competitors:</span> {data.competitorsMentioned.join(', ')}
        </p>
      )}

      {data.productsDiscussed && data.productsDiscussed.length > 0 && (
        <p className="text-base">
          <span className="font-semibold">Products discussed:</span> {data.productsDiscussed.join(', ')}
        </p>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="px-6 py-8 flex flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-100 rounded w-20" />
      </div>
      <div className="h-6 bg-gray-200 rounded w-2/3" />
      <div className="h-16 bg-gray-100 rounded" />
      <div className="rounded-md border border-gray-200 p-4 flex flex-col gap-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mt-2" />
        <div className="h-4 bg-gray-100 rounded w-full" />
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

      // Refresh the note data
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
      <div className="px-6 py-8 flex flex-col gap-4">
        <p className="text-red-600">{error || 'Note not found'}</p>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="text-base text-gray-500 hover:text-gray-700 min-h-[44px]"
          aria-label="Back to dashboard"
        >
          &larr; Back to dashboard
        </button>
      </div>
    )
  }

  const structured = note.structured_output as CRMNote | null
  const canPush = !isPushing && note.push_status !== 'success' && note.push_status !== 'pending'

  return (
    <div className="px-6 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="text-base text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center"
          aria-label="Back to dashboard"
        >
          &larr; Back
        </button>
        <p className="text-sm text-gray-400">
          {new Date(note.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold">{note.title || 'Untitled'}</h1>

      {/* CRM Sync Status */}
      <SyncStatus pushStatus={note.push_status} pushLog={pushLog} />

      {/* Push / Retry button */}
      {canPush && (
        <button
          type="button"
          onClick={() => void handleRetryPush()}
          disabled={isPushing}
          className="min-h-[44px] rounded-md bg-black text-white text-base font-medium disabled:bg-gray-400"
        >
          {isPushing
            ? 'Pushing...'
            : note.push_status === 'failed'
              ? 'Retry push to CRM'
              : 'Push to CRM'}
        </button>
      )}

      {pushError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-base text-red-700">{pushError}</p>
        </div>
      )}

      {/* Structured fields */}
      {structured && (
        <div className="rounded-md border border-gray-200 p-4">
          <StructuredFields data={structured} />
        </div>
      )}

      {/* Transcript (collapsible) */}
      {note.raw_transcript && (
        <div>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            aria-label={showTranscript ? 'Hide transcript' : 'Show transcript'}
            className="text-sm text-gray-500 hover:text-gray-700 min-h-[44px] flex items-center gap-1"
          >
            <span aria-hidden="true">{showTranscript ? '▾' : '▸'}</span> Transcript
          </button>
          {showTranscript && (
            <p className="text-base text-gray-700 mt-2 whitespace-pre-wrap">
              {note.raw_transcript}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
