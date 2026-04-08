'use client'

import { useEffect, useState } from 'react'
import {
  extensionForMimeType,
  formatBytes,
  MAX_AUDIO_BYTES,
} from '@/lib/audio/recording'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import type { CRMNote } from '@/lib/notes/schema'
import type { PushResult, CrmCandidate } from '@/lib/crm/push/types'
import EditableStructuredOutput from '@/components/notes/editable-structured-output'

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


interface VoiceNoteCaptureProps {
  autoStart?: boolean
  onSaved?: () => void
}

export default function VoiceNoteCapture({ autoStart, onSaved }: VoiceNoteCaptureProps) {
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

  const [isPushing, setIsPushing] = useState(false)
  const [pushResult, setPushResult] = useState<PushResult | null>(null)
  const [pushError, setPushError] = useState<string | null>(null)
  const [pushCandidates, setPushCandidates] = useState<CrmCandidate[] | null>(null)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)

  useEffect(() => {
    if (autoStart && isSupported && status === 'idle') {
      void startRecording()
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setPushResult(null)
    setPushError(null)
    setIsPushing(false)
    setPushCandidates(null)
    setSelectedCandidateId(null)
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

  const handlePushToCRM = async (overrides?: {
    existingContactId?: string
    existingDealId?: string
  }) => {
    if (!savedNoteId) return

    setIsPushing(true)
    setPushError(null)
    setPushResult(null)
    if (!overrides) {
      setPushCandidates(null)
      setSelectedCandidateId(null)
    }

    try {
      const res = await fetch('/api/crm/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: savedNoteId,
          ...overrides,
        }),
      })

      const data = (await res.json()) as PushResult & { error?: string; crmType?: string }

      if (!res.ok && !data.candidates) {
        setPushError(data.error || 'Push failed')
        return
      }

      if (data.errorCode === 'needs_selection' && data.candidates) {
        setPushCandidates(data.candidates)
        setPushError(data.error || 'Select a record')
        return
      }

      setPushResult(data)
      setPushCandidates(null)
      if (data.success) onSaved?.()
    } catch {
      setPushError('Network error. Try again.')
    } finally {
      setIsPushing(false)
    }
  }

  const handleSelectCandidate = () => {
    if (!selectedCandidateId || !pushCandidates) return

    const candidate = pushCandidates.find(c => c.id === selectedCandidateId)
    if (!candidate) return

    const overrides: { existingContactId?: string; existingDealId?: string } = {}
    if (candidate.type === 'contact') overrides.existingContactId = candidate.id
    if (candidate.type === 'deal') overrides.existingDealId = candidate.id

    void handlePushToCRM(overrides)
  }

  const canPush = !!savedNoteId && !isPushing && !pushResult?.success

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

  const activeError = recorderError || transcribeError || structureError || saveError || pushError

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
            {pushResult?.success
              ? 'Pushed to CRM'
              : isPushing
              ? 'Pushing to CRM...'
              : savedNoteId
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

      {pushResult?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-base text-green-700">
            Pushed to CRM.
            {pushResult.contactId && (
              <> Contact {pushResult.contactCreated ? 'created' : 'found'}.</>
            )}
            {pushResult.dealId && (
              <> Deal {pushResult.dealCreated ? 'created' : 'updated'}.</>
            )}
            {pushResult.taskIds && pushResult.taskIds.length > 0 && (
              <> {pushResult.taskIds.length} task{pushResult.taskIds.length > 1 ? 's' : ''} created.</>
            )}
          </p>
        </div>
      )}

      {savedNoteId && !pushResult?.success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-base text-green-700">Note saved. Ready for CRM push.</p>
        </div>
      )}

      {pushCandidates && pushCandidates.length > 0 && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 flex flex-col gap-2">
          <p className="text-base text-yellow-800 font-medium">
            Multiple {pushCandidates[0].type === 'contact' ? 'contacts' : 'deals'} found. Select one:
          </p>
          {pushCandidates.map(c => (
            <label key={c.id} className="flex items-center gap-2 text-base cursor-pointer">
              <input
                type="radio"
                name="crmCandidate"
                value={c.id}
                checked={selectedCandidateId === c.id}
                onChange={() => setSelectedCandidateId(c.id)}
                className="w-4 h-4"
              />
              <span className="font-medium">{c.name}</span>
              {c.detail && <span className="text-gray-500">{c.detail}</span>}
            </label>
          ))}
          <button
            type="button"
            onClick={handleSelectCandidate}
            disabled={!selectedCandidateId || isPushing}
            className="min-h-[44px] rounded-md bg-black text-white text-base font-medium disabled:bg-gray-400"
          >
            {isPushing ? 'Pushing...' : 'Push with selected'}
          </button>
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
        {savedNoteId && !pushCandidates && (
          <button
            type="button"
            onClick={() => void handlePushToCRM()}
            disabled={!canPush}
            className="min-h-[44px] rounded-md bg-black text-white text-base font-medium disabled:bg-gray-400"
          >
            {isPushing ? 'Pushing to CRM...' : pushResult?.success ? 'Pushed to CRM' : pushError ? 'Retry push' : 'Push to CRM'}
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
          <h3 className="text-lg font-semibold">Review &amp; Edit</h3>
          <p className="text-sm text-gray-500">
            Edit any field before saving. Colored badges show extraction confidence.
          </p>
          <EditableStructuredOutput
            data={structured}
            onChange={setStructured}
          />
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
