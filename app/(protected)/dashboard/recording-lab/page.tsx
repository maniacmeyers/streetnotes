'use client'

import { formatBytes, MAX_AUDIO_BYTES } from '@/lib/audio/recording'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'

function formatDuration(durationSec: number): string {
  const minutes = Math.floor(durationSec / 60)
  const seconds = durationSec % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function RecordingLabPage() {
  const {
    status,
    durationSec,
    audioBlob,
    mimeType,
    error,
    isSupported,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVoiceRecorder()

  const percentOfLimit = audioBlob
    ? Math.min(100, Math.round((audioBlob.size / MAX_AUDIO_BYTES) * 100))
    : 0

  return (
    <main className="fg-page flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="fg-eyebrow">Device Check</span>
        <h1 className="fg-title mt-3">Recording Lab</h1>
        <p className="fg-subtitle">
          Device validation for microphone capture before transcription integration.
        </p>
      </div>

      <div className="fg-card p-[22px] flex flex-col gap-3 text-base text-[#3D332A]">
        <p>
          Status: <span className="font-medium">{status}</span>
        </p>
        <p>
          Supported: <span className="font-medium">{isSupported ? 'Yes' : 'No'}</span>
        </p>
        <p>
          MIME Type: <span className="font-medium">{mimeType || 'Not set'}</span>
        </p>
        <p>
          Duration: <span className="font-medium">{formatDuration(durationSec)}</span>
        </p>
        <p>
          Blob Size:{' '}
          <span className="font-medium">
            {audioBlob ? `${formatBytes(audioBlob.size)} (${percentOfLimit}% of 25MB)` : 'No recording yet'}
          </span>
        </p>
      </div>

      {error && (
        <div className="fg-inset px-4 py-3">
          <p className="text-base font-bold text-[#8B6B40]">{error}</p>
        </div>
      )}

      <div className="fg-sticky-footer -mx-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => void startRecording()}
          disabled={status === 'recording' || status === 'requesting_permission' || !isSupported}
          className="fg-action"
        >
          Start Recording
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={status !== 'recording'}
          className="fg-secondary-action px-5"
        >
          Stop Recording
        </button>
        <button
          type="button"
          onClick={resetRecording}
          className="fg-secondary-action px-5"
        >
          Reset
        </button>
      </div>
    </main>
  )
}
