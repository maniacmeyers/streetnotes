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
    <main className="px-6 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Recording Lab</h1>
        <p className="text-base text-gray-500">
          Device validation for microphone capture before transcription integration.
        </p>
      </div>

      <div className="rounded-md border border-gray-200 p-4 flex flex-col gap-3 text-base">
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
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-base text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={() => void startRecording()}
          disabled={status === 'recording' || status === 'requesting_permission' || !isSupported}
          className="min-h-[44px] rounded-md bg-black text-white text-base font-medium disabled:bg-gray-400"
        >
          Start Recording
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={status !== 'recording'}
          className="min-h-[44px] rounded-md border border-gray-300 bg-white text-base font-medium disabled:text-gray-400"
        >
          Stop Recording
        </button>
        <button
          type="button"
          onClick={resetRecording}
          className="min-h-[44px] rounded-md border border-gray-300 bg-white text-base font-medium"
        >
          Reset
        </button>
      </div>
    </main>
  )
}
