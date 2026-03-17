'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import { useAudioAnalyser } from '@/hooks/use-audio-analyser'
import MicButton from './mic-button'
import WaveformVisualizer from './waveform-visualizer'
import ShinyText from '@/components/shiny-text'

interface RecorderProps {
  onComplete: (audioBlob: Blob, mimeType: string, durationSec: number) => void
  onImport?: () => void
}

const MIN_DURATION = 15
const MAX_DURATION = 180

const COACHING_PROMPTS = [
  'Who was in the meeting?',
  'Budget — was money discussed?',
  'Authority — who makes the call?',
  'Need — what problem are they solving?',
  'Timeline — when do they want to move?',
  'What are the next steps?',
  'Any competitors mentioned?',
  'Any concerns or objections?',
  'What was the deal value?',
  'When is the next meeting?',
]

export default function Recorder({ onComplete, onImport }: RecorderProps) {
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
  } = useVoiceRecorder()

  const { analyserNode, startAnalysing, stopAnalysing } = useAudioAnalyser()

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [showPrompt, setShowPrompt] = useState(false)
  const promptIntervalRef = useRef<number | null>(null)
  const hasAutoStoppedRef = useRef(false)

  const isRecording = status === 'recording'
  const canStop = isRecording && durationSec >= MIN_DURATION

  // Rotate coaching prompts after 10s of recording
  useEffect(() => {
    if (isRecording && durationSec >= 10 && !promptIntervalRef.current) {
      setShowPrompt(true)
      setCurrentPromptIndex(0)

      promptIntervalRef.current = window.setInterval(() => {
        setCurrentPromptIndex((prev) => (prev + 1) % COACHING_PROMPTS.length)
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
    if (isRecording && durationSec >= MAX_DURATION && !hasAutoStoppedRef.current) {
      hasAutoStoppedRef.current = true
      stopRecording()
    }
  }, [isRecording, durationSec, stopRecording])

  // When recording stops and we have audio, hand it off
  useEffect(() => {
    if (status === 'stopped' && audioBlob && durationSec >= MIN_DURATION) {
      onComplete(audioBlob, mimeType, durationSec)
    }
  }, [status, audioBlob, mimeType, durationSec, onComplete])

  const handleStart = useCallback(async () => {
    hasAutoStoppedRef.current = false
    await startRecording()
  }, [startRecording])

  // Start analyser once the media stream is available (reuse the same stream —
  // opening a second getUserMedia on iOS WebKit kills the first one)
  useEffect(() => {
    if (isRecording && mediaStream) {
      startAnalysing(mediaStream).catch(() => {})
    }
    if (!isRecording) {
      stopAnalysing()
    }
  }, [isRecording, mediaStream, startAnalysing, stopAnalysing])

  const handleStop = useCallback(() => {
    stopRecording()
  }, [stopRecording])

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-8">
      {/* Header */}
      <div className="text-center">
        <div className="mb-3 sm:mb-4">
          <span className="inline-block bg-white border-2 sm:border-3 border-black px-2.5 py-1 sm:px-3 sm:py-1.5 rotate-1 font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]">
            Step 1 of 3
          </span>
        </div>
        <h2
          className="font-display text-[28px] sm:text-[48px] uppercase leading-[0.85] text-white mb-2 sm:mb-3"
          style={{ textShadow: '3px 3px 0px #000000' }}
        >
          {isRecording ? (
            <>
              <span className="text-red-500">Recording</span>
            </>
          ) : (
            <>
              Tell me about
              <br />
              <span className="text-volt">the call</span>
            </>
          )}
        </h2>
        {!isRecording && (
          <p className="font-body text-base sm:text-lg text-gray-400 max-w-sm mx-auto">
            Hit the mic and talk about the call you just had. Names, numbers,
            objections, next steps — dump it all.
          </p>
        )}
      </div>

      {/* Waveform */}
      <div className="w-full max-w-md">
        <WaveformVisualizer
          analyserNode={analyserNode}
          isRecording={isRecording}
        />
      </div>

      {/* Mic Button */}
      <MicButton
        isRecording={isRecording}
        disabled={!isSupported}
        canStop={canStop}
        durationSec={durationSec}
        onStart={handleStart}
        onStop={handleStop}
      />

      {/* Coaching Prompts */}
      <div className="h-8 sm:h-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {showPrompt && isRecording && (
            <motion.p
              key={currentPromptIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="font-mono text-xs sm:text-sm text-volt/70 uppercase tracking-wider text-center"
            >
              {COACHING_PROMPTS[currentPromptIndex]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Error states */}
      {recorderError && (
        <div role="alert" className="w-full max-w-md border-2 sm:border-4 border-red-500 bg-red-500/10 p-3 sm:p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-red-400">
            {recorderError}
          </p>
          {recorderError.includes('permission') && (
            <p className="font-body text-[13px] sm:text-sm text-gray-400 mt-2">
              Open your device Settings &gt; Browser &gt; Microphone and allow
              access, then refresh this page.
            </p>
          )}
        </div>
      )}

      {!isSupported && (
        <div role="alert" className="w-full max-w-md border-2 sm:border-4 border-red-500 bg-red-500/10 p-3 sm:p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-red-400">
            This browser doesn&apos;t support audio recording.
          </p>
          <p className="font-body text-[13px] sm:text-sm text-gray-400 mt-2">
            Try Safari on iPhone or Chrome on Android.
          </p>
        </div>
      )}

      {/* Short recording warning */}
      {status === 'stopped' && durationSec < MIN_DURATION && (
        <div role="alert" className="w-full max-w-md border-2 sm:border-4 border-yellow-500 bg-yellow-500/10 p-3 sm:p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-yellow-400">
            Recording too short — need at least 15 seconds for a good debrief.
          </p>
        </div>
      )}

      {/* Import link */}
      {!isRecording && onImport && (
        <button
          type="button"
          onClick={onImport}
          className="font-mono text-sm sm:text-base uppercase tracking-wider hover:text-volt transition-colors py-2"
        >
          <ShinyText
            text="Have a call summary? Paste it here"
            color="#6b7280"
            shineColor="#00E676"
            speed={3}
            spread={120}
            className="font-mono text-sm sm:text-base uppercase tracking-wider"
          />
        </button>
      )}
    </div>
  )
}
