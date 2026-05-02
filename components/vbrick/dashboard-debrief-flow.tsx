'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Loader2, Check, ArrowRight, FileText, Upload, ClipboardPaste, Video } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import { GlassCardElevated } from './glass-card'
import { MicButton } from './mic-button'
import type { DebriefOutput, VbrickBDRStructuredOutput } from '@/lib/debrief/types'
import { isVbrickBDROutput, isBDROutput } from '@/lib/debrief/types'

const ACCEPTED_TRANSCRIPT_EXTS = ['.txt', '.vtt', '.srt', '.csv', '.json', '.md']

type IdleTab = 'paste' | 'upload' | 'summary'

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

  async function autoExtract(sessionId: string, transcript: string) {
    setProcessingStep('extracting')
    const res = await fetch('/api/vbrick/debrief/structure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        transcript,
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
  }

  async function transcribeAudio(blob: Blob) {
    setStep('processing')
    setProcessingStep('transcribing')
    setError(null)

    try {
      const startRes = await fetch('/api/debrief/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, segment: 'bdr-cold-call' }),
      })
      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.error || 'Failed to start session')
      setDebriefSessionId(startData.sessionId)

      const ext = blob.type.includes('mp4') || blob.type.includes('m4a')
        ? 'mp4'
        : blob.type.includes('wav') ? 'wav'
        : blob.type.includes('mpeg') || blob.type.includes('mp3') ? 'mp3'
        : 'webm'

      const formData = new FormData()
      formData.append('audio', blob, `recording.${ext}`)
      formData.append('sessionId', startData.sessionId)

      const transcribeRes = await fetch('/api/debrief/transcribe', {
        method: 'POST',
        body: formData,
      })
      const transcribeData = await transcribeRes.json()
      if (!transcribeRes.ok) throw new Error(transcribeData.error || 'Transcription failed')

      setEditedTranscript(transcribeData.transcript)
      // Auto-extract straight to deal sheet — no review step.
      await autoExtract(startData.sessionId, transcribeData.transcript)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process recording')
      setStep('idle')
    }
  }

  async function handleConfirmTranscript() {
    if (!debriefSessionId || !editedTranscript.trim()) return

    setStep('processing')
    setProcessingStep('extracting')
    setError(null)

    try {
      const res = await fetch('/api/vbrick/debrief/structure', {
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

  // Handle pasted transcript from parent — auto-extract straight to deal sheet
  useEffect(() => {
    if (pastedTranscript && step === 'idle') {
      submitTranscript(pastedTranscript)
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

  // ─── Idle-state input handlers ───
  const [idleTab, setIdleTab] = useState<IdleTab>('paste')
  const [idleText, setIdleText] = useState('')
  const [idleFileName, setIdleFileName] = useState<string | null>(null)
  const [idleSource, setIdleSource] = useState<'chorus' | 'zoom' | 'fireflies' | 'other'>('chorus')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const submitTranscript = useCallback(async (transcript: string, sourceLabel?: string) => {
    if (!transcript.trim()) return
    setError(null)
    setStep('processing')
    setProcessingStep('extracting')
    try {
      const startRes = await fetch('/api/debrief/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, segment: 'bdr-cold-call' }),
      })
      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.error || 'Failed to start session')
      setDebriefSessionId(startData.sessionId)
      const prefix = sourceLabel ? `[${sourceLabel} summary]\n\n` : ''
      const finalText = prefix + transcript.trim()
      setEditedTranscript(finalText)
      await autoExtract(startData.sessionId, finalText)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract')
      setStep('idle')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, queueContact])

  const handleTranscriptFile = useCallback(async (file: File) => {
    setError(null)
    setIdleFileName(file.name)
    try {
      const text = await file.text()
      const cleaned = text
        .replace(/WEBVTT\n\n/g, '')
        .replace(/\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}\n?/g, '')
        .replace(/^\d+\n/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
      if (!cleaned) throw new Error('File is empty')
      setIdleText(cleaned)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read file')
      setIdleFileName(null)
    }
  }, [])

  const handleAudioFile = useCallback(async (file: File) => {
    setError(null)
    transcribeAudio(file)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  if (step === 'idle') {
    return (
      <motion.div
        key="idle"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <GlassCardElevated>
          <h3
            className="text-[11px] uppercase tracking-[0.2em] font-inter font-medium mb-1"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            Post-Call Debrief
          </h3>
          <p className="text-xs font-inter mb-6" style={{ color: neuTheme.colors.text.muted }}>
            Brain-dump in 60 seconds — or drop a transcript / meeting summary.
          </p>

          {/* Big mic */}
          <div className="flex flex-col items-center py-4" style={{ touchAction: 'manipulation' }}>
            <MicButton
              isRecording={false}
              onStart={handleStartRecording}
              onStop={() => {}}
            />
            <p className="text-xs font-inter mt-3 text-center px-4" style={{ color: neuTheme.colors.text.muted }}>
              Tap the mic, brain-dump for 60 seconds, tap stop. We&apos;ll show you the deal sheet.
            </p>
          </div>

          <div
            className="h-px my-5"
            style={{
              background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
            }}
          />

          {/* Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {([
              { id: 'paste', label: 'Paste transcript', icon: ClipboardPaste },
              { id: 'upload', label: 'Upload file', icon: Upload },
              { id: 'summary', label: 'Meeting summary', icon: Video },
            ] as Array<{ id: IdleTab; label: string; icon: typeof ClipboardPaste }>).map((tab) => {
              const Icon = tab.icon
              const active = idleTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setIdleTab(tab.id); setIdleText(''); setIdleFileName(null); setError(null) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-inter font-medium transition-all"
                  style={{
                    background: neuTheme.colors.bg,
                    boxShadow: active ? neuTheme.shadows.pressed : neuTheme.shadows.raisedSm,
                    color: active ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab body */}
          {idleTab === 'paste' && (
            <>
              <textarea
                value={idleText}
                onChange={(e) => setIdleText(e.target.value)}
                placeholder="Paste a Chorus, Gong, or other transcript here..."
                className="w-full rounded-lg px-4 py-3 text-sm font-inter min-h-[160px] resize-y focus:outline-none"
                style={{
                  background: neuTheme.colors.bg,
                  boxShadow: neuTheme.shadows.inset,
                  color: neuTheme.colors.text.heading,
                  border: 'none',
                }}
              />
              <button
                onClick={() => submitTranscript(idleText)}
                disabled={idleText.trim().length < 20}
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: neuTheme.colors.accent.primary,
                  boxShadow: neuTheme.shadows.raisedSm,
                  border: 'none',
                  cursor: idleText.trim().length < 20 ? 'not-allowed' : 'pointer',
                }}
              >
                <Check className="w-4 h-4" />
                Process Transcript
              </button>
            </>
          )}

          {idleTab === 'upload' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-start gap-1 px-4 py-4 rounded-lg text-left transition-all"
                  style={{
                    background: neuTheme.colors.bg,
                    boxShadow: neuTheme.shadows.raisedSm,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: neuTheme.colors.accent.primary }} />
                    <span className="text-sm font-inter font-bold" style={{ color: neuTheme.colors.text.heading }}>
                      Transcript file
                    </span>
                  </div>
                  <span className="text-xs font-inter" style={{ color: neuTheme.colors.text.muted }}>
                    .txt, .vtt, .srt, .csv, .json, .md
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className="flex flex-col items-start gap-1 px-4 py-4 rounded-lg text-left transition-all"
                  style={{
                    background: neuTheme.colors.bg,
                    boxShadow: neuTheme.shadows.raisedSm,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" style={{ color: neuTheme.colors.accent.primary }} />
                    <span className="text-sm font-inter font-bold" style={{ color: neuTheme.colors.text.heading }}>
                      Audio recording
                    </span>
                  </div>
                  <span className="text-xs font-inter" style={{ color: neuTheme.colors.text.muted }}>
                    .m4a, .mp3, .wav, .webm
                  </span>
                </button>
              </div>
              {idleFileName && idleText && (
                <>
                  <p className="text-xs font-inter mt-3 flex items-center gap-1.5" style={{ color: neuTheme.colors.accent.primary }}>
                    <FileText className="w-3 h-3" />
                    {idleFileName}
                  </p>
                  <textarea
                    value={idleText}
                    onChange={(e) => setIdleText(e.target.value)}
                    className="w-full mt-2 rounded-lg px-4 py-3 text-sm font-inter min-h-[120px] resize-y focus:outline-none"
                    style={{
                      background: neuTheme.colors.bg,
                      boxShadow: neuTheme.shadows.inset,
                      color: neuTheme.colors.text.heading,
                      border: 'none',
                    }}
                  />
                  <button
                    onClick={() => submitTranscript(idleText)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm text-white transition-all"
                    style={{
                      backgroundColor: neuTheme.colors.accent.primary,
                      boxShadow: neuTheme.shadows.raisedSm,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <Check className="w-4 h-4" />
                    Process Transcript
                  </button>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TRANSCRIPT_EXTS.join(',')}
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleTranscriptFile(f)
                }}
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleAudioFile(f)
                }}
              />
            </>
          )}

          {idleTab === 'summary' && (
            <>
              <div className="flex gap-2 mb-3 flex-wrap">
                {(['chorus', 'zoom', 'fireflies', 'other'] as const).map((src) => {
                  const active = idleSource === src
                  const label = src === 'fireflies' ? 'Fireflies' : src === 'chorus' ? 'Chorus' : src === 'zoom' ? 'Zoom' : 'Other'
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setIdleSource(src)}
                      className="px-3 py-1.5 rounded-md text-xs font-inter transition-all"
                      style={{
                        background: neuTheme.colors.bg,
                        boxShadow: active ? neuTheme.shadows.pressed : neuTheme.shadows.raisedSm,
                        color: active ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              <textarea
                value={idleText}
                onChange={(e) => setIdleText(e.target.value)}
                placeholder={`Paste your ${idleSource === 'other' ? 'meeting' : idleSource.charAt(0).toUpperCase() + idleSource.slice(1)} summary — key points, action items, attendees, decisions...`}
                className="w-full rounded-lg px-4 py-3 text-sm font-inter min-h-[160px] resize-y focus:outline-none"
                style={{
                  background: neuTheme.colors.bg,
                  boxShadow: neuTheme.shadows.inset,
                  color: neuTheme.colors.text.heading,
                  border: 'none',
                }}
              />
              <button
                onClick={() => submitTranscript(idleText, idleSource === 'other' ? 'Meeting' : idleSource.charAt(0).toUpperCase() + idleSource.slice(1))}
                disabled={idleText.trim().length < 20}
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: neuTheme.colors.accent.primary,
                  boxShadow: neuTheme.shadows.raisedSm,
                  border: 'none',
                  cursor: idleText.trim().length < 20 ? 'not-allowed' : 'pointer',
                }}
              >
                <Check className="w-4 h-4" />
                Extract from Summary
              </button>
            </>
          )}

          {error && (
            <p className="text-xs font-inter mt-3" style={{ color: neuTheme.colors.status.danger }}>
              {error}
            </p>
          )}

          <button
            onClick={onCancel}
            className="mt-4 w-full text-xs font-inter underline"
            style={{ color: neuTheme.colors.text.muted, background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </GlassCardElevated>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      {/* Recording */}
      {step === 'recording' && (
        <motion.div
          key="recording"
          className="flex flex-col items-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MicButton
            isRecording
            durationSec={recorder.durationSec}
            onStart={() => {}}
            onStop={() => recorder.stopRecording()}
          />
          <p className="text-xs font-inter mt-4" style={{ color: neuTheme.colors.text.muted }}>
            Tap stop when you&apos;re done.
          </p>
        </motion.div>
      )}

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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {debriefSessionId && (
              <a
                href={`/api/debrief/pdf?sessionId=${debriefSessionId}`}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold uppercase tracking-widest text-sm text-white transition-all"
                style={{
                  backgroundColor: neuTheme.colors.accent.primary,
                  boxShadow: neuTheme.shadows.raisedSm,
                  textDecoration: 'none',
                  touchAction: 'manipulation',
                }}
                download
              >
                <FileText className="w-4 h-4" />
                Download PDF
              </a>
            )}
            <button
              onClick={() => setStep('review')}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-inter font-bold uppercase tracking-wider transition-all"
              style={{
                color: neuTheme.colors.text.heading,
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raisedSm,
                border: 'none',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              Edit transcript
            </button>
            <button
              onClick={handleNextCall}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-all"
              style={{
                color: neuTheme.colors.text.heading,
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raisedSm,
                border: 'none',
                cursor: 'pointer',
                touchAction: 'manipulation',
              }}
            >
              <ArrowRight className="w-4 h-4" />
              {queueContact ? 'Next Call' : 'Done'}
            </button>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
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
