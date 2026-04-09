'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { DebriefStep, DebriefOutput } from '@/lib/debrief/types'
import EmailGate from './email-gate'
import Recorder from './recorder'
import ImportSummary from './import-summary'
import TranscriptReview from './transcript-review'
import ProcessingSteps from './processing-steps'
import ResultsDisplay from './results-display'
import {
  extensionForMimeType,
  formatBytes,
  MAX_AUDIO_BYTES,
} from '@/lib/audio/recording'

const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
}

type ProcessingPhase = 'transcribing' | 'extracting' | 'complete'

export default function DebriefFlow() {
  const [step, setStep] = useState<DebriefStep>('email')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioMimeType, setAudioMimeType] = useState<string>('')
  const [durationSec, setDurationSec] = useState<number>(0)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [structured, setStructured] = useState<DebriefOutput | null>(null)
  const [processingPhase, setProcessingPhase] =
    useState<ProcessingPhase>('transcribing')
  const [processingError, setProcessingError] = useState<string | null>(null)

  const handleEmailComplete = useCallback((sid: string, em: string) => {
    setSessionId(sid)
    setEmail(em)
    setStep('record')
  }, [])

  const handleRecordingComplete = useCallback(
    (blob: Blob, mime: string, dur: number) => {
      setAudioBlob(blob)
      setAudioMimeType(mime)
      setDurationSec(dur)
      transcribeAudio(blob, mime)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionId]
  )

  const transcribeAudio = async (blob: Blob, mime: string) => {
    if (!sessionId) return

    setStep('processing')
    setProcessingPhase('transcribing')
    setProcessingError(null)

    try {
      if (blob.size > MAX_AUDIO_BYTES) {
        setProcessingError(
          `Audio file is too large (${formatBytes(blob.size)}). Limit is 25MB.`
        )
        return
      }

      const blobMimeType = mime || blob.type || 'audio/webm'
      const extension = extensionForMimeType(blobMimeType)
      const fileName = `streetnote-${Date.now()}.${extension}`
      const file = new File([blob], fileName, { type: blobMimeType })

      const formData = new FormData()
      formData.append('audio', file)
      formData.append('sessionId', sessionId)

      const res = await fetch('/api/debrief/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        setProcessingError(
          data?.error || 'Transcription failed. Please try again.'
        )
        return
      }

      const data = (await res.json()) as { transcript: string }
      setTranscript(data.transcript)
      setStep('review')
    } catch {
      setProcessingError('Network error during transcription. Please retry.')
    }
  }

  // Shared structuring — used by both voice (after review) and import
  const structureText = useCallback(
    async (text: string) => {
      if (!sessionId) return

      setTranscript(text)
      setStep('processing')
      setProcessingPhase('extracting')
      setProcessingError(null)

      try {
        const res = await fetch('/api/debrief/structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            transcript: text,
          }),
        })

        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string
          } | null
          setProcessingError(
            data?.error || 'Failed to structure data. Please retry.'
          )
          return
        }

        const data = (await res.json()) as {
          structured: DebriefOutput
        }
        setStructured(data.structured)
        setProcessingPhase('complete')

        setTimeout(() => {
          setStep('results')
        }, 800)
      } catch {
        setProcessingError(
          'Network error during structuring. Please retry.'
        )
      }
    },
    [sessionId]
  )

  const handleTranscriptConfirm = useCallback(
    (editedTranscript: string) => {
      structureText(editedTranscript)
    },
    [structureText]
  )

  const handleImportSubmit = useCallback(
    (text: string) => {
      setDurationSec(0)
      structureText(text)
    },
    [structureText]
  )

  const handleFileImport = useCallback(
    (text: string) => {
      setDurationSec(0)
      structureText(text)
    },
    [structureText]
  )

  const handleRetryTranscription = useCallback(() => {
    if (audioBlob) {
      transcribeAudio(audioBlob, audioMimeType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, audioMimeType, sessionId])

  const handleRetryExtraction = useCallback(() => {
    if (transcript) {
      structureText(transcript)
    }
  }, [transcript, structureText])

  const handleReRecord = useCallback(() => {
    setAudioBlob(null)
    setTranscript(null)
    setProcessingError(null)
    setStep('record')
  }, [])

  const handleStartOver = useCallback(() => {
    setStep('email')
    setSessionId(null)
    setEmail(null)
    setAudioBlob(null)
    setAudioMimeType('')
    setDurationSec(0)
    setTranscript(null)
    setStructured(null)
    setProcessingError(null)
    setProcessingPhase('transcribing')
  }, [])

  return (
    <AnimatePresence mode="wait">
      {step === 'email' && (
        <motion.div key="email" {...pageTransition}>
          <EmailGate onComplete={handleEmailComplete} />
        </motion.div>
      )}

      {step === 'record' && (
        <motion.div key="record" {...pageTransition}>
          <Recorder
            onComplete={handleRecordingComplete}
            onImport={() => setStep('import')}
            onFileImport={handleFileImport}
          />
        </motion.div>
      )}

      {step === 'import' && (
        <motion.div key="import" {...pageTransition}>
          <ImportSummary
            onSubmit={handleImportSubmit}
            onSwitchToVoice={() => setStep('record')}
          />
        </motion.div>
      )}

      {step === 'review' && transcript && (
        <motion.div key="review" {...pageTransition}>
          <TranscriptReview
            transcript={transcript}
            onConfirm={handleTranscriptConfirm}
            onReRecord={handleReRecord}
          />
        </motion.div>
      )}

      {step === 'processing' && (
        <motion.div key="processing" {...pageTransition}>
          <ProcessingSteps
            phase={processingPhase}
            error={processingError}
            onRetry={
              processingPhase === 'transcribing'
                ? handleRetryTranscription
                : handleRetryExtraction
            }
          />
        </motion.div>
      )}

      {step === 'results' && structured && (
        <motion.div key="results" {...pageTransition}>
          <ResultsDisplay
            structured={structured}
            sessionId={sessionId!}
            email={email!}
            durationSec={durationSec}
            onStartOver={handleStartOver}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
