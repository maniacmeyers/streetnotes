'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2, Check, ArrowRight } from 'lucide-react'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import { GlassCardElevated } from './glass-card'
import { LuminousDivider } from './luminous-divider'
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
          <Loader2 className="w-10 h-10 text-[#7ed4f7] animate-spin mb-4" />
          <p className="text-white font-inter text-sm">
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
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#7ed4f7] font-inter font-medium mb-4">
              Review Transcript
            </h3>
            {queueContact && (
              <p className="text-gray-400 text-xs font-inter mb-3">
                Call with <span className="text-white font-medium">{queueContact.contactName}</span> at {queueContact.company}
              </p>
            )}

            <textarea
              ref={textareaRef}
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-inter placeholder:text-gray-500 focus:border-[#7ed4f7] focus:outline-none focus:ring-2 focus:ring-[#7ed4f7]/15 transition-colors duration-200 min-h-[200px] resize-y"
            />

            {error && (
              <p className="text-red-400 text-xs font-inter mt-2">{error}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleConfirmTranscript}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#7ed4f7', color: '#061222' }}
              >
                <Check className="w-4 h-4" />
                Confirm & Extract
              </button>
              <button
                onClick={() => { resetFlow(); onCancel() }}
                className="px-4 py-3 rounded-lg text-gray-400 text-sm font-inter hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-white/20"
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
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#7ed4f7', color: '#061222' }}
            >
              <ArrowRight className="w-4 h-4" />
              {queueContact ? 'Next Call' : 'Done'}
            </button>
            {debriefSessionId && (
              <a
                href={`/api/debrief/pdf?sessionId=${debriefSessionId}`}
                className="px-4 py-3 rounded-lg text-[#7ed4f7] text-sm font-inter font-bold uppercase tracking-wider cursor-pointer border border-[#7ed4f7] hover:bg-[#7ed4f7]/10 transition-colors flex items-center gap-2"
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
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-inter mb-1">
            SPIN Composite
          </p>
          <span
            className={`font-fira-code font-bold text-5xl ${
              vbrick.spin.composite >= 7 ? 'text-[#7ed4f7]' : vbrick.spin.composite >= 4 ? 'text-amber-500' : 'text-red-500'
            }`}
            style={vbrick.spin.composite >= 8 ? { textShadow: '0 0 20px rgba(126,212,247,0.4)' } : undefined}
          >
            {vbrick.spin.composite.toFixed(1)}
          </span>
          <p className="text-gray-500 text-xs font-inter mt-1 italic">
            {vbrick.spin.coachingNote}
          </p>
        </div>
      )}

      <LuminousDivider className="my-4" />

      {/* Contact + Disposition */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-inter">Contact</p>
          <p className="text-white font-inter font-bold">{bdr.contactSnapshot.name}</p>
          <p className="text-gray-400 text-xs">{bdr.contactSnapshot.title} — {bdr.contactSnapshot.company}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-inter">Disposition</p>
          <p className="text-white font-inter font-bold capitalize">{bdr.callDisposition.replace('-', ' ')}</p>
          <p className="text-gray-400 text-xs capitalize">{bdr.prospectStatus.replace(/-/g, ' ')}</p>
        </div>
      </div>

      {/* The Truth */}
      {bdr.theTruth && (
        <>
          <LuminousDivider className="my-4" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-inter mb-1">The Truth</p>
            <p className="text-white text-sm font-inter">{bdr.theTruth}</p>
          </div>
        </>
      )}

      {/* Next Action */}
      {bdr.nextAction && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-inter mb-1">Next Action</p>
          <p className="text-[#7ed4f7] text-sm font-inter font-medium">
            {bdr.nextAction.action}
            {bdr.nextAction.when && <span className="text-gray-400"> — {bdr.nextAction.when}</span>}
          </p>
        </div>
      )}

      {/* AE Briefing */}
      {bdr.aeBriefing && (
        <>
          <LuminousDivider className="my-4" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-gray-500 font-inter mb-1">AE Briefing</p>
            <p className="text-gray-300 text-xs font-inter leading-relaxed">{bdr.aeBriefing}</p>
          </div>
        </>
      )}
    </GlassCardElevated>
  )
}
