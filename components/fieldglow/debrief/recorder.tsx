'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'

interface RecorderProps {
  onComplete: (audioBlob: Blob, mimeType: string, durationSec: number) => void
}

const MIN_DURATION = 15
const MAX_DURATION = 180

const PROMPTS = [
  'Which provider? Which practice?',
  'What products came up — Daxxify, Botox, fillers, devices?',
  'Did you hear any competitor mentions?',
  'What\'s the deal stage and rough value?',
  'What\'s the next step, and by when?',
  'Any objections or concerns?',
  'Who else is involved on the practice side?',
  'What pain points did the provider share?',
]

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function Recorder({ onComplete }: RecorderProps) {
  const {
    status,
    durationSec,
    audioBlob,
    mimeType,
    error: recorderError,
    isSupported,
    startRecording,
    stopRecording,
  } = useVoiceRecorder()

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [showPrompt, setShowPrompt] = useState(false)
  const promptIntervalRef = useRef<number | null>(null)
  const hasAutoStoppedRef = useRef(false)

  const isRecording = status === 'recording'
  const canStop = isRecording && durationSec >= MIN_DURATION
  const progressPct = Math.min(100, (durationSec / MAX_DURATION) * 100)

  // Coaching prompt rotation
  useEffect(() => {
    if (isRecording && durationSec >= 8 && !promptIntervalRef.current) {
      setShowPrompt(true)
      setCurrentPromptIndex(0)
      promptIntervalRef.current = window.setInterval(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % PROMPTS.length)
      }, 6000)
    }

    if (!isRecording && promptIntervalRef.current) {
      window.clearInterval(promptIntervalRef.current)
      promptIntervalRef.current = null
      setShowPrompt(false)
    }

    return () => {
      if (promptIntervalRef.current) {
        window.clearInterval(promptIntervalRef.current)
        promptIntervalRef.current = null
      }
    }
  }, [isRecording, durationSec])

  // Auto-stop at max duration
  useEffect(() => {
    if (
      isRecording &&
      durationSec >= MAX_DURATION &&
      !hasAutoStoppedRef.current
    ) {
      hasAutoStoppedRef.current = true
      stopRecording()
    }
  }, [isRecording, durationSec, stopRecording])

  // Hand off when recording is finished and meets minimum duration
  useEffect(() => {
    if (status === 'stopped' && audioBlob && durationSec >= MIN_DURATION) {
      onComplete(audioBlob, mimeType, durationSec)
    }
  }, [status, audioBlob, mimeType, durationSec, onComplete])

  const handleStart = useCallback(async () => {
    hasAutoStoppedRef.current = false
    await startRecording()
  }, [startRecording])

  const handleStop = useCallback(() => {
    stopRecording()
  }, [stopRecording])

  return (
    <section className="relative">
      <div className="mx-auto flex max-w-[820px] flex-col items-center px-6 pb-20 pt-16 sm:px-10 sm:pt-24 text-center">
        <span className="fg-eyebrow mb-6 block">Step 02 — Talk</span>

        <h2
          className="fg-display text-[clamp(2rem,5vw,3.4rem)] leading-[1] tracking-tight"
          style={{ color: 'var(--fg-ink)' }}
        >
          {isRecording ? (
            <>
              Recording.{' '}
              <span
                className="fg-display-italic leading-[1.5]"
                style={{ color: 'var(--fg-gilt-deep)' }}
              >
                Keep going.
              </span>
            </>
          ) : (
            <>
              Hit the mic.{' '}
              <span
                className="fg-display-italic leading-[1.5]"
                style={{ color: 'var(--fg-gilt-deep)' }}
              >
                Tell me about the call.
              </span>
            </>
          )}
        </h2>

        {!isRecording && (
          <p
            className="mt-6 max-w-[44ch] text-[1.05rem] leading-[1.65]"
            style={{ color: 'var(--fg-ink-2)' }}
          >
            Provider, practice, products, competitor mentions, next step.
            Talk like you would to a teammate. We&apos;ll structure it.
          </p>
        )}

        {/* Mic button */}
        <div className="relative mt-14 flex flex-col items-center">
          <button
            type="button"
            onClick={isRecording ? handleStop : handleStart}
            disabled={!isSupported || (isRecording && !canStop)}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            className="group relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-full transition-all sm:h-40 sm:w-40"
            style={{
              background: isRecording ? 'var(--fg-ink)' : 'var(--fg-cream)',
              border: `1px solid ${isRecording ? 'var(--fg-ink)' : 'var(--fg-gilt)'}`,
              boxShadow: isRecording
                ? '0 0 0 8px rgba(168, 133, 90, 0.12), 0 30px 80px -30px rgba(26, 20, 16, 0.4)'
                : '0 18px 50px -18px rgba(168, 133, 90, 0.35)',
              opacity: !isSupported || (isRecording && !canStop) ? 0.6 : 1,
            }}
          >
            {/* Pulsing ring when recording */}
            {isRecording && (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid var(--fg-gilt)',
                  animation: 'fg-rec-pulse 1.8s ease-out infinite',
                }}
              />
            )}

            {/* Icon */}
            {isRecording ? (
              <span
                aria-hidden="true"
                className="block h-7 w-7 sm:h-9 sm:w-9"
                style={{ background: 'var(--fg-paper)' }}
              />
            ) : (
              <svg
                viewBox="0 0 32 32"
                width="42"
                height="42"
                fill="none"
                stroke="var(--fg-ink)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="12" y="4" width="8" height="16" rx="4" />
                <path d="M8 14a8 8 0 0 0 16 0" />
                <line x1="16" y1="22" x2="16" y2="28" />
                <line x1="12" y1="28" x2="20" y2="28" />
              </svg>
            )}
          </button>

          <style jsx>{`
            @keyframes fg-rec-pulse {
              0% { transform: scale(1); opacity: 0.7; }
              100% { transform: scale(1.4); opacity: 0; }
            }
          `}</style>

          {/* Duration */}
          <p
            className="fg-display mt-8 text-[2.4rem] leading-none sm:text-[3rem]"
            style={{
              color: isRecording ? 'var(--fg-ink)' : 'var(--fg-mute)',
              fontVariationSettings: "'opsz' 144, 'SOFT' 30",
            }}
          >
            {formatDuration(durationSec)}
          </p>

          {/* Progress bar */}
          {isRecording && (
            <div
              className="mt-5 h-px w-64 overflow-hidden"
              style={{ background: 'var(--fg-line)' }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  background: 'var(--fg-gilt)',
                  width: `${progressPct}%`,
                }}
              />
            </div>
          )}

          {/* Min/max info */}
          <p
            className="mt-4 text-[0.7rem] uppercase tracking-[0.24em]"
            style={{ color: 'var(--fg-mute)' }}
          >
            {isRecording
              ? canStop
                ? 'Tap mic to finish · stops automatically at 3:00'
                : `Need ${MIN_DURATION - durationSec}s more before you can stop`
              : `${MIN_DURATION}–180 seconds · iOS Safari and Chrome supported`}
          </p>
        </div>

        {/* Coaching prompts */}
        <div className="mt-10 flex h-10 items-center justify-center">
          <AnimatePresence mode="wait">
            {showPrompt && isRecording && (
              <motion.p
                key={currentPromptIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4 }}
                className="fg-display-italic text-[1.1rem] leading-[1.5] sm:text-[1.25rem]"
                style={{
                  color: 'var(--fg-gilt-deep)',
                  fontVariationSettings: "'opsz' 24, 'SOFT' 80",
                }}
              >
                {PROMPTS[currentPromptIndex]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Errors */}
        {recorderError && (
          <div
            role="alert"
            className="mt-8 max-w-md border p-4 text-left"
            style={{
              background: 'rgba(168, 90, 74, 0.06)',
              borderColor: 'rgba(168, 90, 74, 0.4)',
            }}
          >
            <p
              className="text-[0.78rem] uppercase tracking-[0.22em]"
              style={{ color: '#8a3a2c' }}
            >
              {recorderError}
            </p>
            {recorderError.includes('permission') && (
              <p
                className="mt-2 text-[0.9rem] leading-[1.55]"
                style={{ color: 'var(--fg-ink-2)' }}
              >
                Open device Settings &gt; Browser &gt; Microphone, allow
                access, then refresh.
              </p>
            )}
          </div>
        )}

        {!isSupported && (
          <div
            role="alert"
            className="mt-8 max-w-md border p-4 text-left"
            style={{
              background: 'rgba(168, 90, 74, 0.06)',
              borderColor: 'rgba(168, 90, 74, 0.4)',
            }}
          >
            <p
              className="text-[0.78rem] uppercase tracking-[0.22em]"
              style={{ color: '#8a3a2c' }}
            >
              This browser doesn&apos;t support audio recording.
            </p>
            <p
              className="mt-2 text-[0.9rem] leading-[1.55]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              Try Safari on iPhone or Chrome on Android.
            </p>
          </div>
        )}

        {status === 'stopped' && durationSec < MIN_DURATION && (
          <div
            role="alert"
            className="mt-8 max-w-md border p-4 text-left"
            style={{
              background: 'rgba(168, 133, 90, 0.08)',
              borderColor: 'var(--fg-gilt)',
            }}
          >
            <p
              className="text-[0.78rem] uppercase tracking-[0.22em]"
              style={{ color: 'var(--fg-gilt-deep)' }}
            >
              Recording was too short. Need at least {MIN_DURATION} seconds.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
