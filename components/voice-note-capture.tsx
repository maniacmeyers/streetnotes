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
import EditableStructuredOutput from '@/components/notes/editable-structured-output'
import MicInstrument from '@/components/mic-instrument'
import { BrutalCard, BrutalButton } from '@/components/streetnotes/brutal'

interface TranscribeSuccessResponse {
  transcript: string
  mimeType: string
  sizeBytes: number
}

const MAX_RECORDING_SEC = 300 // 5 minutes cap
const MIN_RECORDING_SEC = 3

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
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2
          className="font-display uppercase text-3xl text-white leading-[0.85]"
          style={{ textShadow: '2px 2px 0px #000000' }}
        >
          Capture note
        </h2>
        <p className="font-mono text-xs uppercase tracking-widest font-bold text-volt">
          {pipelineLabel}
        </p>
      </div>

      {/* Mic instrument — idle entry point + recording state */}
      {showInstrument && (
        <div className="flex flex-col items-center py-6 sm:py-8">
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
        <div className="bg-red-100 border-4 border-red-600 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider text-red-700 font-bold">
            This browser does not support audio recording.
          </p>
        </div>
      )}

      {activeError && (
        <div className="bg-red-100 border-4 border-red-600 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider text-red-700 font-bold">
            {activeError}
          </p>
        </div>
      )}

      {/* Success banners */}
      {pushResult?.success && (
        <div className="bg-volt/20 border-4 border-volt px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider text-volt font-bold">
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
        <div className="bg-volt/20 border-4 border-volt px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider text-volt font-bold">
            Note saved.
          </p>
        </div>
      )}

      {/* Candidate selection picker */}
      {pushCandidates && pushCandidates.length > 0 && (
        <BrutalCard variant="white" padded>
          <p className="font-display uppercase text-lg text-black mb-3">
            Multiple {pushCandidates[0].type === 'contact' ? 'contacts' : 'deals'} found
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {pushCandidates.map(c => (
              <label
                key={c.id}
                className="flex items-center gap-3 font-mono text-sm uppercase tracking-wider cursor-pointer min-h-[44px] border-2 border-black px-3 py-2"
              >
                <input
                  type="radio"
                  name="crmCandidate"
                  value={c.id}
                  checked={selectedCandidateId === c.id}
                  onChange={() => setSelectedCandidateId(c.id)}
                  className="w-5 h-5 accent-black"
                />
                <span className="font-bold text-black">{c.name}</span>
                {c.detail && <span className="text-black/60 normal-case">{c.detail}</span>}
              </label>
            ))}
          </div>
          <BrutalButton
            type="button"
            onClick={handleSelectCandidate}
            disabled={!selectedCandidateId || isPushing}
            variant="primary"
            size="md"
            className="w-full"
          >
            {isPushing ? 'Pushing...' : 'Push with selected'}
          </BrutalButton>
        </BrutalCard>
      )}

      {/* Audio preview (after recording stops) */}
      {audioBlob && !isRecording && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            {formatBytes(audioBlob.size)} · {mimeType || audioBlob.type || 'unknown'}
          </p>
          {audioPreviewUrl && (
            <audio controls src={audioPreviewUrl} className="w-full" style={{ filter: 'invert(1)' }} />
          )}
        </div>
      )}

      {/* Transcript (shown after transcription) */}
      {transcript && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="transcript"
            className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold text-white"
          >
            Transcript
          </label>
          <textarea
            id="transcript"
            value={transcript}
            readOnly
            rows={6}
            className="w-full bg-white border-4 border-black font-body text-black px-4 py-3"
          />
        </div>
      )}

      {/* Editable structured output */}
      {structured && (
        <BrutalCard variant="white" padded>
          <h3 className="font-display uppercase text-xl text-black mb-1 leading-none">
            Review &amp; Edit
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-wider text-black/60 mb-4">
            Edit any field before saving. Colored badges show extraction confidence.
          </p>
          <EditableStructuredOutput
            data={structured}
            onChange={setStructured}
          />
        </BrutalCard>
      )}

      {/* Progressive action buttons — only show the next relevant action */}
      <div className="flex flex-col gap-3">
        {/* Stage: requesting mic permission */}
        {status === 'requesting_permission' && (
          <BrutalButton type="button" disabled variant="primary" size="lg">
            Requesting mic...
          </BrutalButton>
        )}

        {/* Stage: audio recorded — transcribe */}
        {hasStopped && !transcript && !isTranscribing && (
          <BrutalButton
            type="button"
            onClick={() => void handleTranscribe()}
            variant="volt"
            size="lg"
          >
            Transcribe
          </BrutalButton>
        )}

        {/* Stage: transcribing */}
        {isTranscribing && (
          <BrutalButton type="button" disabled variant="primary" size="lg">
            Transcribing...
          </BrutalButton>
        )}

        {/* Stage: transcribed — structure */}
        {hasTranscript && !structured && !isStructuring && (
          <BrutalButton
            type="button"
            onClick={() => void handleStructure()}
            variant="volt"
            size="lg"
          >
            Structure for CRM
          </BrutalButton>
        )}

        {/* Stage: structuring */}
        {isStructuring && (
          <BrutalButton type="button" disabled variant="primary" size="lg">
            Structuring...
          </BrutalButton>
        )}

        {/* Stage: structured — save */}
        {hasStructured && !hasSaved && !isSaving && (
          <BrutalButton
            type="button"
            onClick={() => void handleSave()}
            variant="volt"
            size="lg"
          >
            Save note
          </BrutalButton>
        )}

        {/* Stage: saving */}
        {isSaving && (
          <BrutalButton type="button" disabled variant="primary" size="lg">
            Saving...
          </BrutalButton>
        )}

        {/* Stage: saved — push to CRM */}
        {hasSaved && !pushResult?.success && !isPushing && !pushCandidates && (
          <BrutalButton
            type="button"
            onClick={() => void handlePushToCRM()}
            variant="volt"
            size="lg"
          >
            {pushError ? 'Retry push to CRM' : 'Push to CRM'}
          </BrutalButton>
        )}

        {/* Stage: pushing */}
        {isPushing && !pushCandidates && (
          <BrutalButton type="button" disabled variant="primary" size="lg">
            Pushing to CRM...
          </BrutalButton>
        )}

        {/* Done button — after save (skip push) or after push success */}
        {(hasSaved || hasPushed) && onSaved && (
          <BrutalButton type="button" onClick={onSaved} variant="outline" size="md">
            Done
          </BrutalButton>
        )}

        {/* Reset — always available when there's work */}
        {hasWork && !isRecording && (
          <BrutalButton type="button" onClick={handleReset} variant="ghost" size="sm">
            Start over
          </BrutalButton>
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
