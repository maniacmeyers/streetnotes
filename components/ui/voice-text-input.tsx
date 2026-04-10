'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Mic, Square, Loader2, RotateCcw } from 'lucide-react'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import {
  extensionForMimeType,
  MAX_AUDIO_BYTES,
  formatBytes,
} from '@/lib/audio/recording'

interface VoiceTextInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  maxLength?: number
  label?: string
  hint?: string
  minLength?: number
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function VoiceTextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  label,
  hint,
}: VoiceTextInputProps) {
  const [mode, setMode] = useState<'voice' | 'text'>('voice')
  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const valueRef = useRef(value)
  const transcribedBlobRef = useRef<Blob | null>(null)

  useEffect(() => {
    valueRef.current = value
  }, [value])

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

  const isRecording = status === 'recording'

  function handleStop() {
    stopRecording()
  }

  async function handleTranscribe(blob: Blob, blobMime: string) {
    if (blob.size > MAX_AUDIO_BYTES) {
      setTranscribeError(
        `Audio file is too large (${formatBytes(blob.size)}). Limit is 25MB.`
      )
      return
    }
    const ext = extensionForMimeType(blobMime)
    const file = new File([blob], `wizard-${Date.now()}.${ext}`, {
      type: blobMime,
    })
    const formData = new FormData()
    formData.append('audio', file)

    setTranscribing(true)
    setTranscribeError(null)
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        setTranscribeError(
          payload?.error ?? `Transcription failed (status ${res.status})`
        )
        return
      }
      const payload = (await res.json()) as { transcript: string }
      const addition = payload.transcript.trim()
      if (addition) {
        const prev = valueRef.current
        const next = prev ? `${prev.trim()} ${addition}`.trim() : addition
        onChange(maxLength ? next.slice(0, maxLength) : next)
      }
      resetRecording()
    } catch {
      setTranscribeError('Network error while transcribing. Please try again.')
    } finally {
      setTranscribing(false)
    }
  }

  // Kick off transcription once the recorder has finalised the blob
  useEffect(() => {
    if (
      status === 'stopped' &&
      audioBlob &&
      transcribedBlobRef.current !== audioBlob &&
      !transcribing
    ) {
      transcribedBlobRef.current = audioBlob
      void handleTranscribe(
        audioBlob,
        mimeType || audioBlob.type || 'audio/webm'
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, audioBlob])

  async function handleStart() {
    setTranscribeError(null)
    await startRecording()
  }

  function handleReRecord() {
    onChange('')
    setTranscribeError(null)
    resetRecording()
  }

  const error = transcribeError || recorderError
  const hasValue = value.trim().length > 0

  return (
    <div className="flex flex-col gap-3">
      {label && (
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
          {label}
        </p>
      )}

      {mode === 'voice' ? (
        <div className="flex flex-col items-center gap-4">
          {/* Mic surround */}
          <div className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-6 py-8 w-full flex flex-col items-center gap-4">
            <span
              className={`font-display text-4xl tabular-nums leading-none ${
                isRecording ? 'text-volt' : 'text-white/80'
              }`}
            >
              {formatTime(durationSec)}
            </span>

            {!isRecording && !transcribing && (
              <button
                type="button"
                onClick={() => void handleStart()}
                disabled={!isSupported}
                aria-label="Start recording"
                className="w-20 h-20 rounded-full border border-volt/50 bg-volt/15 backdrop-blur-md text-volt flex items-center justify-center transition hover:bg-volt/25 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)]"
              >
                <Mic size={32} />
              </button>
            )}

            {isRecording && (
              <motion.button
                type="button"
                onClick={() => void handleStop()}
                aria-label="Stop recording"
                className="w-20 h-20 rounded-full border border-volt/60 bg-volt/20 text-volt flex items-center justify-center backdrop-blur-md"
                animate={{
                  boxShadow: [
                    '0 0 0 0px rgba(0,230,118,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
                    '0 0 0 18px rgba(0,230,118,0), inset 0 1px 0 rgba(255,255,255,0.25)',
                  ],
                }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
              >
                <Square size={28} />
              </motion.button>
            )}

            {transcribing && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={32} className="text-volt animate-spin" />
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                  Transcribing...
                </p>
              </div>
            )}

            {hint && !isRecording && !transcribing && (
              <p className="font-body text-sm text-white/60 text-center italic max-w-xs">
                {hint}
              </p>
            )}
          </div>

          {/* Accumulated transcript preview */}
          {hasValue && !isRecording && !transcribing && (
            <div className="w-full flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                Captured
              </p>
              <div className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-3">
                <p className="font-body text-sm text-white/85 whitespace-pre-wrap">
                  {value}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleReRecord}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md transition hover:bg-white/10"
                >
                  <RotateCcw size={12} />
                  Re-record
                </button>
                {maxLength && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 tabular-nums">
                    {value.length} / {maxLength}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Type instead link */}
          {!isRecording && !transcribing && (
            <button
              type="button"
              onClick={() => setMode('text')}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 underline hover:text-white/70 transition-colors"
            >
              Type instead
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-white/15 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] focus-within:border-volt/50 focus-within:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_0_0_3px_rgba(0,230,118,0.15)] transition">
            <textarea
              value={value}
              onChange={(e) =>
                onChange(
                  maxLength
                    ? e.target.value.slice(0, maxLength)
                    : e.target.value
                )
              }
              placeholder={placeholder}
              rows={5}
              className="w-full bg-transparent px-4 py-3 font-body text-sm text-white placeholder:text-white/30 outline-none resize-y"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMode('voice')}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 underline hover:text-white/70 transition-colors"
            >
              Use voice instead
            </button>
            {maxLength && (
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40 tabular-nums">
                {value.length} / {maxLength}
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 backdrop-blur-md px-4 py-3"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-red-400">
            {error}
          </p>
        </div>
      )}
    </div>
  )
}
