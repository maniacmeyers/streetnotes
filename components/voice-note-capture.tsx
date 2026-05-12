'use client'

import { useEffect, useState } from 'react'
import {
  extensionForMimeType,
  formatBytes,
  MAX_AUDIO_BYTES,
} from '@/lib/audio/recording'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import { useAudioAnalyser } from '@/hooks/use-audio-analyser'
import type { CRMNote } from '@/lib/notes/schema'
import type { PushResult, CrmCandidate } from '@/lib/crm/push/types'
import type { PushPlan } from '@/lib/crm/schema/types'
import EditableStructuredOutput from '@/components/notes/editable-structured-output'
import MicInstrument from '@/components/mic-instrument'

interface TranscribeSuccessResponse {
  transcript: string
  mimeType: string
  sizeBytes: number
}

const MAX_RECORDING_SEC = 300 // 5 minutes cap
const MIN_RECORDING_SEC = 3
const FG_ACTION = 'fg-action'
const FG_SECONDARY = 'fg-secondary-action px-5'

interface VoiceNoteCaptureProps {
  autoStart?: boolean
  onSaved?: () => void
  onProgress?: (hasWork: boolean) => void
}

export default function VoiceNoteCapture({ autoStart, onSaved, onProgress }: VoiceNoteCaptureProps) {
  const {
    status,
    durationSec,
    audioBlob,
    mimeType,
    error: recorderError,
    isSupported,
    mediaStream,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder()

  const { analyserNode, startAnalysing, stopAnalysing } = useAudioAnalyser()

  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null)

  const [isStructuring, setIsStructuring] = useState(false)
  const [structured, setStructured] = useState<CRMNote | null>(null)
  const [pushPlan, setPushPlan] = useState<PushPlan | undefined>(undefined)
  const [structureError, setStructureError] = useState<string | null>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [isPushing, setIsPushing] = useState(false)
  const [pushResult, setPushResult] = useState<PushResult | null>(null)
  const [pushError, setPushError] = useState<string | null>(null)
  const [pushCandidates, setPushCandidates] = useState<CrmCandidate[] | null>(null)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)

  // Track whether there's work in progress (for back-confirmation)
  const hasWork = !!(audioBlob || transcript || structured || savedNoteId)
  useEffect(() => {
    onProgress?.(hasWork)
  }, [hasWork, onProgress])

  useEffect(() => {
    if (autoStart && isSupported && status === 'idle') {
      void startRecording()
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Wire analyser to the recorder's live stream (reuse the same stream —
  // a second getUserMedia call kills the first one on iOS WebKit).
  useEffect(() => {
    const isRecording = status === 'recording'
    if (isRecording && mediaStream) {
      startAnalysing(mediaStream).catch(() => {})
    }
    if (!isRecording) {
      stopAnalysing()
    }
  }, [status, mediaStream, startAnalysing, stopAnalysing])

  // Auto-stop at max duration
  useEffect(() => {
    if (status === 'recording' && durationSec >= MAX_RECORDING_SEC) {
      stopRecording()
    }
  }, [status, durationSec, stopRecording])

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
    setPushPlan(undefined)
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
    setPushPlan(undefined)
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
    setPushPlan(undefined)
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

      const payload = (await response.json()) as {
        structured: { crmNote: CRMNote; pushPlan?: PushPlan } | CRMNote
      }
      if ('crmNote' in payload.structured) {
        setStructured(payload.structured.crmNote)
        setPushPlan(payload.structured.pushPlan)
      } else {
        setStructured(payload.structured)
        setPushPlan(undefined)
      }
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
        body: JSON.stringify({
          transcript,
          structured: pushPlan ? { crmNote: structured, pushPlan } : structured,
        }),
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

  // Determine which stage we're in for progressive button display
  const isRecording = status === 'recording'
  const hasStopped = status === 'stopped' && !!audioBlob
  const hasTranscript = !!transcript && !isTranscribing
  const hasStructured = !!structured && !isStructuring
  const hasSaved = !!savedNoteId
  const hasPushed = !!pushResult?.success

  const activeError = recorderError || transcribeError || structureError || saveError || pushError

  // Pipeline label
  const pipelineLabel = hasPushed
    ? 'Pushed to CRM'
    : isPushing
      ? 'Pushing to CRM...'
      : hasSaved
        ? 'Saved — ready to push'
        : isSaving
          ? 'Saving...'
          : hasStructured
            ? 'Structured — review below'
            : isStructuring
              ? 'Structuring...'
              : hasTranscript
                ? 'Transcribed'
                : isTranscribing
                  ? 'Transcribing...'
                  : isRecording
                    ? 'Recording...'
                    : 'Ready'

  const canStop = isRecording && durationSec >= MIN_RECORDING_SEC
  const showInstrument = isRecording || (!audioBlob && !transcript && !structured && isSupported && status !== 'requesting_permission')

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2
          className="text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#1A1410]"
        >
          Capture result
        </h2>
        <p className="text-sm font-extrabold text-[#8B6B40]">
          {pipelineLabel}
        </p>
      </div>

      {/* Mic instrument — idle entry point + recording state */}
      {showInstrument && (
        <div className="fg-featured-card flex flex-col items-center p-5">
          <MicInstrument
            isRecording={isRecording}
            disabled={!isSupported}
            canStop={canStop}
            durationSec={durationSec}
            maxDurationSec={MAX_RECORDING_SEC}
            minDurationSec={MIN_RECORDING_SEC}
            analyserNode={analyserNode}
            onStart={() => void startRecording()}
            onStop={stopRecording}
            idleLabel="Tap to record"
          />
        </div>
      )}

      {!isSupported && (
        <div className="fg-inset px-4 py-3">
          <p className="text-sm font-bold text-[#8B6B40]">
            This browser does not support audio recording.
          </p>
        </div>
      )}

      {activeError && (
        <div className="fg-inset px-4 py-3">
          <p className="text-sm font-bold text-[#8B6B40]">
            {activeError}
          </p>
        </div>
      )}

      {/* Success banners */}
      {pushResult?.success && (
        <div className="fg-card-sm px-4 py-3">
          <p className="text-sm font-bold text-[#8B6B40]">
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

      {hasSaved && !pushResult?.success && !isPushing && (
        <div className="fg-card-sm px-4 py-3">
          <p className="text-sm font-bold text-[#8B6B40]">
            Note saved.
          </p>
        </div>
      )}

      {/* Candidate selection picker */}
      {pushCandidates && pushCandidates.length > 0 && (
        <div className="fg-card p-[22px]">
          <p className="mb-3 text-[21px] font-extrabold tracking-[-0.02em] text-[#1A1410]">
            Multiple {pushCandidates[0].type === 'contact' ? 'contacts' : 'deals'} found
          </p>
          <div className="mb-4 flex flex-col gap-2">
            {pushCandidates.map(c => (
              <label
                key={c.id}
                className="fg-inset flex min-h-[48px] cursor-pointer items-center gap-3 px-3 py-3 text-sm font-bold text-[#1A1410]"
              >
                <input
                  type="radio"
                  name="crmCandidate"
                  value={c.id}
                  checked={selectedCandidateId === c.id}
                  onChange={() => setSelectedCandidateId(c.id)}
                  className="h-5 w-5 accent-[#A8855A]"
                />
                <span className="font-bold text-[#1A1410]">{c.name}</span>
                {c.detail && <span className="text-[#3D332A]">{c.detail}</span>}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSelectCandidate}
            disabled={!selectedCandidateId || isPushing}
            className={FG_ACTION}
          >
            {isPushing ? 'Pushing...' : 'Push with selected'}
          </button>
        </div>
      )}

      {/* Audio preview (after recording stops) */}
      {audioBlob && !isRecording && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-bold text-[#3D332A]">
            {formatBytes(audioBlob.size)} · {mimeType || audioBlob.type || 'unknown'}
          </p>
          {audioPreviewUrl && (
            <audio controls src={audioPreviewUrl} className="w-full" />
          )}
        </div>
      )}

      {/* Transcript (shown after transcription) */}
      {transcript && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="transcript"
            className="text-sm font-extrabold text-[#1A1410]"
          >
            Transcript
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={6}
            className="fg-input min-h-[160px] resize-y"
          />
        </div>
      )}

      {/* Editable structured output */}
      {structured && (
        <div className="fg-card p-[22px]">
          <h3 className="mb-1 text-[22px] font-extrabold tracking-[-0.02em] text-[#1A1410]">
            Review &amp; Edit
          </h3>
          <p className="mb-4 text-sm font-medium leading-6 text-[#3D332A]">
            Edit any field before saving. Colored badges show extraction confidence.
          </p>
          <EditableStructuredOutput
            data={structured}
            onChange={setStructured}
          />
        </div>
      )}

      {/* Progressive action buttons — only show the next relevant action */}
      <div className="fg-sticky-footer -mx-4 flex flex-col gap-3">
        {/* Stage: requesting mic permission */}
        {status === 'requesting_permission' && (
          <button type="button" disabled className={FG_ACTION}>
            Requesting mic...
          </button>
        )}

        {/* Stage: audio recorded — transcribe */}
        {hasStopped && !transcript && !isTranscribing && (
          <button
            type="button"
            onClick={() => void handleTranscribe()}
            className={FG_ACTION}
          >
            Transcribe
          </button>
        )}

        {/* Stage: transcribing */}
        {isTranscribing && (
          <button type="button" disabled className={FG_ACTION}>
            Transcribing...
          </button>
        )}

        {/* Stage: transcribed — structure */}
        {hasTranscript && !structured && !isStructuring && (
          <button
            type="button"
            onClick={() => void handleStructure()}
            className={FG_ACTION}
          >
            Structure for CRM
          </button>
        )}

        {/* Stage: structuring */}
        {isStructuring && (
          <button type="button" disabled className={FG_ACTION}>
            Structuring...
          </button>
        )}

        {/* Stage: structured — save */}
        {hasStructured && !hasSaved && !isSaving && (
          <button
            type="button"
            onClick={() => void handleSave()}
            className={FG_ACTION}
          >
            Save note
          </button>
        )}

        {/* Stage: saving */}
        {isSaving && (
          <button type="button" disabled className={FG_ACTION}>
            Saving...
          </button>
        )}

        {/* Stage: saved — push to CRM */}
        {hasSaved && !pushResult?.success && !isPushing && !pushCandidates && (
          <button
            type="button"
            onClick={() => void handlePushToCRM()}
            className={FG_ACTION}
          >
            {pushError ? 'Retry push to CRM' : 'Push to CRM'}
          </button>
        )}

        {/* Stage: pushing */}
        {isPushing && !pushCandidates && (
          <button type="button" disabled className={FG_ACTION}>
            Pushing to CRM...
          </button>
        )}

        {/* Done button — after save (skip push) or after push success */}
        {(hasSaved || hasPushed) && onSaved && (
          <button type="button" onClick={onSaved} className={FG_SECONDARY}>
            Done
          </button>
        )}

        {/* Reset — always available when there's work */}
        {hasWork && !isRecording && (
          <button type="button" onClick={handleReset} className={FG_SECONDARY}>
            Start over
          </button>
        )}
      </div>

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
