'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FaMicrophone, FaUpload } from 'react-icons/fa'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import { useAudioAnalyser } from '@/hooks/use-audio-analyser'
import MicButton from './mic-button'
import FileDropZone from './file-drop-zone'

interface RecorderProps {
  onComplete: (audioBlob: Blob, mimeType: string, durationSec: number) => void
  onImport?: () => void
  onFileImport: (text: string) => void
}

type RecorderMode = 'choose' | 'record' | 'import'

const MIN_DURATION = 15
const MAX_DURATION = 180

const PROMPTS = [
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

export default function Recorder({ onComplete, onFileImport }: RecorderProps) {
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

  const [mode, setMode] = useState<RecorderMode>('choose')
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

  // Mode chooser — two cards side by side
  if (mode === 'choose') {
    return (
      <div className="flex flex-col items-center gap-5 sm:gap-8">
        <div className="text-center">
          <p className="text-volt font-mono text-xs uppercase tracking-widest mb-3">
            Step 2 of 3
          </p>
          <h2 className="font-bold text-[28px] sm:text-[40px] leading-tight text-white mb-2">
            Tell me about <span className="text-volt">the call</span>
          </h2>
          <p className="text-base text-gray-400 max-w-md mx-auto">
            Record a quick voice debrief or import a transcript from your call tool.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-lg">
          {/* Record card */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={() => setMode('record')}
            className="group glass-volt rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-5 text-center cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full glass-inset flex items-center justify-center group-hover:shadow-glow-volt transition-shadow duration-300">
              <FaMicrophone className="text-2xl text-volt drop-shadow-lg" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1.5">Record a Debrief</p>
              <p className="text-white/50 text-xs leading-relaxed">
                Talk for 60 seconds after your call
              </p>
            </div>
          </motion.button>

          {/* Import card */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            onClick={() => setMode('import')}
            className="group glass rounded-2xl p-8 sm:p-10 flex flex-col items-center gap-5 text-center cursor-pointer hover:border-white/25 transition-all"
          >
            <div className="w-16 h-16 rounded-full glass-inset flex items-center justify-center group-hover:shadow-glow-volt transition-shadow duration-300">
              <FaUpload className="text-2xl text-white/70 group-hover:text-volt transition-colors" />
            </div>
            <div>
              <p className="text-white font-bold text-base mb-1.5">Import a Transcript</p>
              <p className="text-white/50 text-xs leading-relaxed">
                Chorus, Teams, Zoom, Gong
              </p>
            </div>
          </motion.button>
        </div>
      </div>
    )
  }

  // Import mode — FileDropZone
  if (mode === 'import') {
    return (
      <div className="flex flex-col items-center gap-5 sm:gap-8">
        <div className="text-center">
          <p className="text-volt font-mono text-xs uppercase tracking-widest mb-3">
            Step 2 of 3
          </p>
          <h2 className="font-bold text-[24px] sm:text-[36px] leading-tight text-white mb-2">
            Import your <span className="text-volt">transcript</span>
          </h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            From Chorus, Teams, Zoom, Gong, or any tool that records your calls.
          </p>
        </div>

        <div className="w-full max-w-lg">
          <FileDropZone onFileText={onFileImport} />
        </div>

        <button
          type="button"
          onClick={() => setMode('choose')}
          className="text-white/40 text-xs hover:text-white/60 transition-colors font-mono uppercase tracking-wider py-3 min-h-[44px] flex items-center justify-center"
        >
          Back to options
        </button>
      </div>
    )
  }

  // Record mode
  return (
    <div className="flex flex-col items-center gap-5 sm:gap-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-volt font-mono text-xs uppercase tracking-widest mb-3">
          Step 2 of 3
        </p>
        <h2 className="font-bold text-[28px] sm:text-[40px] leading-tight text-white mb-2">
          {isRecording ? (
            <span className="text-red-500">Recording</span>
          ) : (
            <>Tell me about <span className="text-volt">the call</span></>
          )}
        </h2>
        {!isRecording && (
          <p className="text-base sm:text-lg text-gray-400 max-w-sm mx-auto">
            Hit the mic and talk about the call you just had. Names, numbers, objections, next steps.
          </p>
        )}
      </div>

      {/* Mic Instrument (waveform lives inside) */}
      <MicButton
        isRecording={isRecording}
        disabled={!isSupported}
        canStop={canStop}
        durationSec={durationSec}
        maxDurationSec={MAX_DURATION}
        analyserNode={analyserNode}
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
              {PROMPTS[currentPromptIndex]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Error states */}
      {recorderError && (
        <div role="alert" className="w-full max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-3 sm:p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-red-400">
            {recorderError}
          </p>
          {recorderError.includes('permission') && (
            <p className="text-[13px] sm:text-sm text-gray-400 mt-2">
              Open your device Settings &gt; Browser &gt; Microphone and allow
              access, then refresh this page.
            </p>
          )}
        </div>
      )}

      {!isSupported && (
        <div role="alert" className="w-full max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-3 sm:p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-red-400">
            This browser doesn&apos;t support audio recording.
          </p>
          <p className="text-[13px] sm:text-sm text-gray-400 mt-2">
            Try Safari on iPhone or Chrome on Android.
          </p>
        </div>
      )}

      {/* Short recording warning */}
      {status === 'stopped' && durationSec < MIN_DURATION && (
        <div role="alert" className="w-full max-w-md rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 sm:p-4">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-yellow-400">
            Recording too short — need at least 15 seconds for a good debrief.
          </p>
        </div>
      )}

      {/* Back to options */}
      {!isRecording && (
        <button
          type="button"
          onClick={() => setMode('choose')}
          className="text-white/40 text-xs hover:text-white/60 transition-colors font-mono uppercase tracking-wider py-3 min-h-[44px] flex items-center justify-center"
        >
          Back to options
        </button>
      )}
    </div>
  )
}
