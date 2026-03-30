'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2, Check, ArrowRight } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import { GlassCardElevated } from './glass-card'
import type { DebriefOutput, VbrickBDRStructuredOutput } from '@/lib/debrief/types'
import { isVbrickBDROutput, isBDROutput } from '@/lib/debrief/types'

type FlowStep = 'idle' | 'recording' | 'review' | 'processing' | 'results'

interface DashboardDebriefFlowProps {
  email: string
  queueContact?: {
    id: string
    contactName: string
    contactTitle?: string
    company: string
  } | null
  onComplete: (debriefSessionId: string, output: DebriefOutput) => void
  onCancel: () => void
  isRecording: boolean
  onRecordingStart: () => void
  pastedTranscript?: string | null
}

export function DashboardDebriefFlow({
  email,
  queueContact,
  onComplete,
  onCancel,
  isRecording,
  onRecordingStart,
  pastedTranscript,
}: DashboardDebriefFlowProps) {
  const [step, setStep] = useState<FlowStep>('idle')
  const [editedTranscript, setEditedTranscript] = useState('')
  const [structured, setStructured] = useState<DebriefOutput | null>(null)
  const [debriefSessionId, setDebriefSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState<'transcribing' | 'extracting'>('transcribing')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const recorder = useVoiceRecorder()

  // Start recording
  const handleStartRecording = useCallback(async () => {
    setError(null)
    setStep('recording')
    onRecordingStart()
    await recorder.startRecording()
  }, [recorder, onRecordingStart])

  // When parent signals recording stopped (mic button), stop the actual recorder
  useEffect(() => {
    if (!isRecording && step === 'recording' && recorder.status === 'recording') {
      recorder.stopRecording()
    }
  }, [isRecording, step, recorder])

  // After recorder produces a blob, process the audio
  useEffect(() => {
    if (recorder.status === 'stopped' && recorder.audioBlob && step === 'recording') {
      transcribeAudio(recorder.audioBlob)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorder.status, recorder.audioBlob])

  async function transcribeAudio(blob: Blob) {
    setStep('processing')
    setProcessingStep('transcribing')
    setError(null)

    try {
      // Create debrief session first
      const startRes = await fetch('/api/debrief/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, segment: 'bdr-cold-call' }),
      })
      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.error || 'Failed to start session')
      setDebriefSessionId(startData.sessionId)

      // Transcribe
      const formData = new FormData()
      formData.append('audio', blob, `recording.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`)
      formData.append('sessionId', startData.sessionId)

      const transcribeRes = await fetch('/api/debrief/transcribe', {
        method: 'POST',
        body: formData,
      })
      const transcribeData = await transcribeRes.json()
      if (!transcribeRes.ok) throw new Error(transcribeData.error || 'Transcription failed')

      setEditedTranscript(transcribeData.transcript)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transcribe')
      setStep('idle')
    }
  }

  async function handleConfirmTranscript() {
    if (!debriefSessionId || !editedTranscript.trim()) return

    setStep('processing')
    setProcessingStep('extracting')
    setError(null)

    try {
      const res = await fetch('/api/debrief/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: debriefSessionId,
          transcript: editedTranscript,
          segment: 'bdr-cold-call',
          contactContext: queueContact
            ? {
                name: queueContact.contactName,
                title: queueContact.contactTitle,
                company: queueContact.company,
              }
            : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to structure')

      setStructured(data.structured)
      setStep('results')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data')
      setStep('review')
    }
  }

  function handleNextCall() {
    if (debriefSessionId && structured) {
      onComplete(debriefSessionId, structured)
    }
    resetFlow()
  }

  function resetFlow() {
    setStep('idle')
    setEditedTranscript('')
    setStructured(null)
    setDebriefSessionId(null)
    setError(null)
    recorder.resetRecording()
  }

  // Handle pasted transcript — skip recording, go straight to review
  useEffect(() => {
    if (pastedTranscript && step === 'idle') {
      setEditedTranscript(pastedTranscript)
      // Create a debrief session for this transcript
      fetch('/api/debrief/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, segment: 'bdr-cold-call' }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.sessionId) {
            setDebriefSessionId(data.sessionId)
            setStep('review')
          }
        })
        .catch(() => {
          setError('Failed to create session')
        })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastedTranscript])

  // Auto-start recording when component mounts in recording mode
  useEffect(() => {
    if (isRecording && step === 'idle' && !pastedTranscript) {
      handleStartRecording()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (step === 'idle') return null

  return (
    <AnimatePresence mode="wait">
      {/* Processing overlay */}
      {step === 'processing' && (
        <motion.div
          key="processing"
          className="flex flex-col items-center justify-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Loader2
            className="w-10 h-10 animate-spin mb-4"
            style={{ color: neuTheme.colors.accent.primary }}
          />
          <p className="font-inter text-sm" style={{ color: neuTheme.colors.text.heading }}>
            {processingStep === 'transcribing'
              ? 'Transcribing your recording...'
              : 'Extracting CRM data...'}
          </p>
        </motion.div>
      )}

      {/* Transcript review */}
      {step === 'review' && (
        <motion.div
          key="review"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <GlassCardElevated>
            <h3
              className="text-[11px] uppercase tracking-[0.2em] font-inter font-medium mb-4"
              style={{ color: neuTheme.colors.accent.primary }}
            >
              Review Transcript
            </h3>
            {queueContact && (
              <p className="text-xs font-inter mb-3" style={{ color: neuTheme.colors.text.muted }}>
                Call with{' '}
                <span className="font-medium" style={{ color: neuTheme.colors.text.heading }}>
                  {queueContact.contactName}
                </span>{' '}
                at {queueContact.company}
              </p>
            )}

            <textarea
              ref={textareaRef}
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm font-inter min-h-[200px] resize-y focus:outline-none transition-all duration-200"
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.inset,
                color: neuTheme.colors.text.heading,
                border: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `${neuTheme.shadows.inset}, 0 0 0 2px ${neuTheme.colors.accent.primary}40`
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = neuTheme.shadows.inset
              }}
            />

            {error && (
              <p className="text-xs font-inter mt-2" style={{ color: neuTheme.colors.status.danger }}>
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleConfirmTranscript}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-all hover:opacity-90 text-white"
                style={{
                  backgroundColor: neuTheme.colors.accent.primary,
                  boxShadow: neuTheme.shadows.raisedSm,
                }}
              >
                <Check className="w-4 h-4" />
                Confirm & Extract
              </button>
              <button
                onClick={() => { resetFlow(); onCancel() }}
                className="px-4 py-3 rounded-lg text-sm font-inter cursor-pointer transition-all"
                style={{
                  color: neuTheme.colors.text.muted,
                  background: neuTheme.colors.bg,
                  boxShadow: neuTheme.shadows.raisedSm,
                }}
              >
                Cancel
              </button>
            </div>
          </GlassCardElevated>
        </motion.div>
      )}

      {/* Results */}
      {step === 'results' && structured && (
        <motion.div
          key="results"
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <VbrickResultsCard structured={structured} sessionId={debriefSessionId!} />

          <div className="flex gap-3">
            <button
              onClick={handleNextCall}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-all hover:opacity-90 text-white"
              style={{
                backgroundColor: neuTheme.colors.accent.primary,
                boxShadow: neuTheme.shadows.raisedSm,
              }}
            >
              <ArrowRight className="w-4 h-4" />
              {queueContact ? 'Next Call' : 'Done'}
            </button>
            {debriefSessionId && (
              <a
                href={`/api/debrief/pdf?sessionId=${debriefSessionId}`}
                className="px-4 py-3 rounded-lg text-sm font-inter font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 transition-all"
                style={{
                  color: neuTheme.colors.accent.primary,
                  background: neuTheme.colors.bg,
                  boxShadow: neuTheme.shadows.raisedSm,
                }}
                download
              >
                PDF
              </a>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Simplified results card for the dashboard context
function VbrickResultsCard({
  structured,
}: {
  structured: DebriefOutput
  sessionId: string
}) {
  if (!isBDROutput(structured)) return null

  const bdr = structured
  const vbrick = isVbrickBDROutput(structured) ? structured as VbrickBDRStructuredOutput : null

  return (
    <GlassCardElevated>
      {/* SPIN Score */}
      {vbrick?.spin && (
        <div className="text-center mb-4">
          <p
            className="text-[10px] uppercase tracking-[0.15em] font-inter mb-1"
            style={{ color: neuTheme.colors.text.muted }}
          >
            SPIN Composite
          </p>
          <span
            className="font-fira-code font-bold text-5xl"
            style={{
              color: vbrick.spin.composite >= 7
                ? neuTheme.colors.accent.primary
                : vbrick.spin.composite >= 4
                ? neuTheme.colors.score.amber
                : neuTheme.colors.score.red,
              textShadow: vbrick.spin.composite >= 8
                ? `0 0 20px ${neuTheme.colors.accent.primary}60`
                : undefined,
            }}
          >
            {vbrick.spin.composite.toFixed(1)}
          </span>
          <p
            className="text-xs font-inter mt-1 italic"
            style={{ color: neuTheme.colors.text.muted }}
          >
            {vbrick.spin.coachingNote}
          </p>
        </div>
      )}

      <div
        className="h-px my-4"
        style={{
          background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
        }}
      />

      {/* Contact + Disposition */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.1em] font-inter"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Contact
          </p>
          <p className="font-inter font-bold" style={{ color: neuTheme.colors.text.heading }}>
            {bdr.contactSnapshot.name}
          </p>
          <p className="text-xs" style={{ color: neuTheme.colors.text.muted }}>
            {bdr.contactSnapshot.title} — {bdr.contactSnapshot.company}
          </p>
        </div>
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.1em] font-inter"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Disposition
          </p>
          <p className="font-inter font-bold capitalize" style={{ color: neuTheme.colors.text.heading }}>
            {bdr.callDisposition.replace('-', ' ')}
          </p>
          <p className="text-xs capitalize" style={{ color: neuTheme.colors.text.muted }}>
            {bdr.prospectStatus.replace(/-/g, ' ')}
          </p>
        </div>
      </div>

      {/* The Truth */}
      {bdr.theTruth && (
        <>
          <div
            className="h-px my-4"
            style={{
              background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
            }}
          />
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.1em] font-inter mb-1"
              style={{ color: neuTheme.colors.text.muted }}
            >
              The Truth
            </p>
            <p className="text-sm font-inter" style={{ color: neuTheme.colors.text.heading }}>
              {bdr.theTruth}
            </p>
          </div>
        </>
      )}

      {/* Next Action */}
      {bdr.nextAction && (
        <div className="mt-3">
          <p
            className="text-[10px] uppercase tracking-[0.1em] font-inter mb-1"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Next Action
          </p>
          <p className="text-sm font-inter font-medium" style={{ color: neuTheme.colors.accent.primary }}>
            {bdr.nextAction.action}
            {bdr.nextAction.when && (
              <span style={{ color: neuTheme.colors.text.muted }}> — {bdr.nextAction.when}</span>
            )}
          </p>
        </div>
      )}

      {/* AE Briefing */}
      {bdr.aeBriefing && (
        <>
          <div
            className="h-px my-4"
            style={{
              background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
            }}
          />
          <div>
            <p
              className="text-[10px] uppercase tracking-[0.1em] font-inter mb-1"
              style={{ color: neuTheme.colors.text.muted }}
            >
              AE Briefing
            </p>
            <p
              className="text-xs font-inter leading-relaxed"
              style={{ color: neuTheme.colors.text.body }}
            >
              {bdr.aeBriefing}
            </p>
          </div>
        </>
      )}
    </GlassCardElevated>
  )
}
