'use client'

import { useEffect, useState } from 'react'
import {
  extensionForMimeType,
  formatBytes,
  MAX_AUDIO_BYTES,
} from '@/lib/audio/recording'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import type { CRMNote, ConfidenceLevel } from '@/lib/notes/schema'

interface TranscribeSuccessResponse {
  transcript: string
  mimeType: string
  sizeBytes: number
}

function formatDuration(durationSec: number): string {
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function labelForRecorderStatus(status: string): string {
  if (status === 'requesting_permission') return 'Requesting mic access'
  if (status === 'recording') return 'Recording'
  if (status === 'stopped') return 'Ready to transcribe'
  if (status === 'error') return 'Recorder error'
  return 'Idle'
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

function StructuredOutput({ data }: { data: CRMNote }) {
  return (
    <div className="flex flex-col gap-4">
      {(data.contactName || data.company) && (
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">Contact / Company</h3>
          {data.contactName && (
            <p className="text-base">
              {data.contactName}{' '}
              {data.contactNameConfidence && confidenceBadge(data.contactNameConfidence)}
            </p>
          )}
          {data.company && (
            <p className="text-base text-gray-600">
              {data.company}{' '}
              {data.companyConfidence && confidenceBadge(data.companyConfidence)}
            </p>
          )}
        </div>
      )}

      {(data.dealStage || data.estimatedValue || data.closeDate) && (
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">Deal Snapshot</h3>
          <div className="grid grid-cols-1 gap-1 text-base">
            {data.dealStage && (
              <p>
                Stage: <span className="font-medium">{data.dealStage}</span>{' '}
                {data.dealStageConfidence && confidenceBadge(data.dealStageConfidence)}
              </p>
            )}
            {data.estimatedValue && (
              <p>
                Value: <span className="font-medium">{data.estimatedValue}</span>{' '}
                {data.estimatedValueConfidence && confidenceBadge(data.estimatedValueConfidence)}
              </p>
            )}
            {data.closeDate && (
              <p>
                Close: <span className="font-medium">{data.closeDate}</span>{' '}
                {data.closeDateConfidence && confidenceBadge(data.closeDateConfidence)}
              </p>
            )}
          </div>
        </div>
      )}

      {data.attendees && data.attendees.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">Attendees</h3>
          {data.attendees.map((att, i) => (
            <div key={i} className="text-base border-l-2 border-gray-200 pl-3 py-1">
              <p className="font-medium">
                {att.name || 'Unknown'}{' '}
                {confidenceBadge(att.confidence)}
              </p>
              {att.title && <p className="text-gray-600">{att.title}</p>}
              {att.role && att.role !== 'Unknown' && (
                <p className="text-gray-500 text-sm">{att.role} · {att.sentiment}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {data.meetingSummary && data.meetingSummary.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">Meeting Summary</h3>
          <ul className="list-disc list-inside text-base space-y-1">
            {data.meetingSummary.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {data.nextSteps && data.nextSteps.length > 0 && (
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold">Next Steps</h3>
          {data.nextSteps.map((step, i) => (
            <div key={i} className="text-base border-l-2 border-gray-200 pl-3 py-1">
              <p>
                <span className="font-medium">{step.task}</span>{' '}
                {confidenceBadge(step.confidence)}
              </p>
              <p className="text-gray-500 text-sm">
                {step.owner === 'rep' ? 'You' : 'Prospect'}
                {step.dueDate ? ` · ${step.dueDate}` : ''}
                {' · '}
                {step.priority} priority
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
            {data.painPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {data.competitorsMentioned && data.competitorsMentioned.length > 0 && (
        <p className="text-base">
          <span className="font-semibold">Competitors:</span>{' '}
          {data.competitorsMentioned.join(', ')}
        </p>
      )}

      {data.productsDiscussed && data.productsDiscussed.length > 0 && (
        <p className="text-base">
          <span className="font-semibold">Products discussed:</span>{' '}
          {data.productsDiscussed.join(', ')}
        </p>
      )}
    </div>
  )
}

export default function VoiceNoteCapture() {
  const {
    status,
    durationSec,
    audioBlob,
    mimeType,
    error: recorderError,
    isSupported,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder()

  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)

  const [isStructuring, setIsStructuring] = useState(false)
  const [structured, setStructured] = useState<CRMNote | null>(null)
  const [structureError, setStructureError] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!audioBlob) {
      setAudioPreviewUrl(null)
      return
    }

    const previewUrl = URL.createObjectURL(audioBlob)
    setAudioPreviewUrl(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [audioBlob])

  const handleReset = () => {
    resetRecording()
    setTranscript('')
    setTranscribeError(null)
    setIsTranscribing(false)
    setStructured(null)
    setStructureError(null)
    setIsStructuring(false)
    setSavedNoteId(null)
    setSaveError(null)
    setIsSaving(false)
  }

  const handleTranscribe = async () => {
    if (!audioBlob) {
      setTranscribeError('Record audio first, then transcribe.')
      return
    }

    if (audioBlob.size > MAX_AUDIO_BYTES) {
      setTranscribeError(
        `Audio file is too large (${formatBytes(audioBlob.size)}). Limit is 25MB.`
      )
      return
    }

    const blobMimeType = mimeType || audioBlob.type || 'audio/webm'
    const extension = extensionForMimeType(blobMimeType)
    const fileName = `streetnote-${Date.now()}.${extension}`
    const file = new File([audioBlob], fileName, { type: blobMimeType })

    const formData = new FormData()
    formData.append('audio', file)

    setIsTranscribing(true)
    setTranscript('')
    setTranscribeError(null)
    setStructured(null)
    setStructureError(null)
    setSavedNoteId(null)

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        const message =
          payload?.error ?? `Transcription failed with status ${response.status}`
        setTranscribeError(message)
        return
      }

      const payload = (await response.json()) as TranscribeSuccessResponse
      setTranscript(payload.transcript)
    } catch {
      setTranscribeError('Network error while transcribing. Please try again.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleStructure = async () => {
    if (!transcript) return

    setIsStructuring(true)
    setStructured(null)
    setStructureError(null)
    setSavedNoteId(null)

    try {
      const response = await fetch('/api/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        setStructureError(
          payload?.error ?? `Structuring failed with status ${response.status}`
        )
        return
      }

      const payload = (await response.json()) as { structured: CRMNote }
      setStructured(payload.structured)
    } catch {
      setStructureError('Network error while structuring. Please try again.')
    } finally {
      setIsStructuring(false)
    }
  }

  const handleSave = async () => {
    if (!transcript || !structured) return

    setIsSaving(true)
    setSaveError(null)

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, structured }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null
        setSaveError(payload?.error ?? `Save failed with status ${response.status}`)
        return
      }

      const payload = (await response.json()) as { id: string }
      setSavedNoteId(payload.id)
    } catch {
      setSaveError('Network error while saving. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const canStart =
    isSupported &&
    status !== 'recording' &&
    status !== 'requesting_permission' &&
    !isTranscribing &&
    !isStructuring
  const canStop = status === 'recording' && !isTranscribing
  const canTranscribe = !!audioBlob && status !== 'recording' && !isTranscribing && !isStructuring
  const canStructure = !!transcript && !isStructuring && !isTranscribing
  const canSave = !!structured && !isSaving && !savedNoteId
  const canReset =
    status !== 'idle' ||
    !!audioBlob ||
    !!transcript ||
    !!structured ||
    !!recorderError ||
    !!transcribeError ||
    !!structureError

  const activeError = recorderError || transcribeError || structureError || saveError

  return (
    <section className="rounded-md border border-gray-200 p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Capture meeting note</h2>
        <p className="text-base text-gray-500">
          Record, transcribe, and structure your meeting into CRM-ready fields.
        </p>
      </div>

      <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-base">
        <p>
          Recorder: <span className="font-medium">{labelForRecorderStatus(status)}</span>
        </p>
        <p>
          Duration: <span className="font-medium">{formatDuration(durationSec)}</span>
        </p>
        <p>
          Pipeline:{' '}
          <span className="font-medium">
            {savedNoteId
              ? 'Saved'
              : isSaving
              ? 'Saving...'
              : structured
              ? 'Structured — review below'
              : isStructuring
              ? 'Structuring...'
              : transcript
              ? 'Transcribed'
              : isTranscribing
              ? 'Transcribing...'
              : 'Idle'}
          </span>
        </p>
      </div>

      {!isSupported && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-base text-red-700">
            This browser does not support audio recording.
          </p>
        </div>
      )}

      {activeError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-base text-red-700">{activeError}</p>
        </div>
      )}

      {savedNoteId && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-base text-green-700">Note saved. Ready for CRM push.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => void startRecording()}
          disabled={!canStart}
          className="min-h-[44px] rounded-md bg-black text-white text-base font-medium disabled:bg-gray-400"
        >
          Start recording
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={!canStop}
          className="min-h-[44px] rounded-md border border-gray-300 bg-white text-base font-medium disabled:text-gray-400"
        >
          Stop recording
        </button>
        <button
          type="button"
          onClick={() => void handleTranscribe()}
          disabled={!canTranscribe}
          className="min-h-[44px] rounded-md border border-gray-300 bg-white text-base font-medium disabled:text-gray-400"
        >
          {isTranscribing ? 'Transcribing...' : 'Transcribe'}
        </button>
        <button
          type="button"
          onClick={() => void handleStructure()}
          disabled={!canStructure}
          className="min-h-[44px] rounded-md bg-black text-white text-base font-medium disabled:bg-gray-400"
        >
          {isStructuring ? 'Structuring...' : 'Structure for CRM'}
        </button>
        {structured && (
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!canSave}
            className="min-h-[44px] rounded-md bg-green-700 text-white text-base font-medium disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : savedNoteId ? 'Saved' : 'Save note'}
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          disabled={!canReset}
          className="min-h-[44px] rounded-md border border-gray-300 bg-white text-base font-medium disabled:text-gray-400"
        >
          Reset
        </button>
      </div>

      {audioBlob && (
        <div className="flex flex-col gap-2 text-base">
          <p>
            Recorded file:{' '}
            <span className="font-medium">
              {formatBytes(audioBlob.size)} ({mimeType || audioBlob.type || 'unknown'})
            </span>
          </p>
          {audioPreviewUrl && <audio controls src={audioPreviewUrl} className="w-full" />}
        </div>
      )}

      {transcript && (
        <div className="flex flex-col gap-2">
          <label htmlFor="transcript" className="text-base font-medium">
            Transcript
          </label>
          <textarea
            id="transcript"
            value={transcript}
            readOnly
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-base"
          />
        </div>
      )}

      {structured && (
        <div className="flex flex-col gap-2 rounded-md border border-gray-200 p-4">
          <h3 className="text-lg font-semibold">Structured Output</h3>
          <p className="text-sm text-gray-500">
            Fields marked with colored badges indicate extraction confidence.
          </p>
          <StructuredOutput data={structured} />
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {isSaving
          ? 'Saving note'
          : savedNoteId
          ? 'Note saved'
          : isStructuring
          ? 'Structuring transcript'
          : isTranscribing
          ? 'Transcription in progress'
          : transcript
          ? 'Transcription complete'
          : activeError || ''}
      </p>
    </section>
  )
}
