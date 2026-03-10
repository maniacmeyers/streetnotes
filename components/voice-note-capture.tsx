'use client'

import { useEffect, useState } from 'react'
import {
  extensionForMimeType,
  formatBytes,
  MAX_AUDIO_BYTES,
} from '@/lib/audio/recording'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'

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

  const canStart =
    isSupported && status !== 'recording' && status !== 'requesting_permission' && !isTranscribing
  const canStop = status === 'recording' && !isTranscribing
  const canTranscribe = !!audioBlob && status !== 'recording' && !isTranscribing
  const canReset =
    status !== 'idle' ||
    !!audioBlob ||
    !!transcript ||
    !!recorderError ||
    !!transcribeError

  return (
    <section className="rounded-md border border-gray-200 p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Capture meeting note</h2>
        <p className="text-base text-gray-500">
          Record a quick voice note, then transcribe it into text.
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
          Transcription:{' '}
          <span className="font-medium">{isTranscribing ? 'In progress' : 'Idle'}</span>
        </p>
      </div>

      {!isSupported && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-base text-red-700">
            This browser does not support audio recording.
          </p>
        </div>
      )}

      {(recorderError || transcribeError) && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-base text-red-700">{recorderError ?? transcribeError}</p>
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
          {isTranscribing ? 'Transcribing…' : 'Transcribe'}
        </button>
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
            rows={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-base"
          />
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {isTranscribing
          ? 'Transcription in progress'
          : transcript
          ? 'Transcription complete'
          : transcribeError || recorderError || ''}
      </p>
    </section>
  )
}
