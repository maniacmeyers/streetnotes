/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Phone, PhoneOff } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { SPARRING_SCENARIOS, getScenarioById } from '@/lib/vbrick/sparring-scenarios'

const REALTIME_API_URL = 'https://api.openai.com/v1/realtime'

type TranscriptTurn = { role: 'user' | 'assistant'; text: string; at: number }

type Phase = 'idle' | 'connecting' | 'in-call' | 'ending' | 'scored' | 'error'

export type SparringScoreResult = {
  score: number
  frameworkScore: number
  accentScore?: number
  wouldTransfer: boolean
  transferConfidence?: number
  dimensions?: Array<{ name: string; score: number; weight?: number; feedback?: string }>
  frameworkAnalysis?: Record<string, boolean>
  accentFeedback?: string
  strengths?: string[]
  improvements?: string[]
  scriptImprovements?: Array<{ original: string; improved: string; reason: string }>
  [key: string]: unknown
}

interface RealtimeSparringSessionProps {
  scenarioId: string
  personaId?: string
  bdrAccent?: 'irish' | 'newZealand' | 'general'
  hardMode: boolean
  scriptVisible: boolean
  onEnd: (result: SparringScoreResult | null, transcript: TranscriptTurn[]) => void
  onCancel: () => void
}

export function RealtimeSparringSession({
  scenarioId,
  personaId,
  bdrAccent = 'general',
  hardMode,
  scriptVisible,
  onEnd,
  onCancel,
}: RealtimeSparringSessionProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [personaName, setPersonaName] = useState<string>('Prospect')
  const [personaTitle, setPersonaTitle] = useState<string>('')
  const [userSpeaking, setUserSpeaking] = useState(false)
  const [assistantSpeaking, setAssistantSpeaking] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([])

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
  const transcriptRef = useRef<TranscriptTurn[]>([])
  const sessionIdRef = useRef<string | null>(null)
  const personaIdRef = useRef<string | null>(null)

  const scenario = getScenarioById(scenarioId) ?? SPARRING_SCENARIOS['brightcove-friction']

  // --- Start the call on mount ---
  useEffect(() => {
    let cancelled = false
    async function start() {
      setPhase('connecting')
      try {
        const sessionResp = await fetch('/api/vbrick/realtime/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId, hardMode, personaId, bdrAccent }),
        })
        if (!sessionResp.ok) throw new Error('Failed to mint Realtime session')
        const sessionData = await sessionResp.json()
        if (cancelled) return
        sessionIdRef.current = sessionData.sessionId
        personaIdRef.current = sessionData.personaId
        setPersonaName(sessionData.personaName || 'Prospect')
        setPersonaTitle(sessionData.personaTitle || '')

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        localStreamRef.current = stream

        const pc = new RTCPeerConnection()
        pcRef.current = pc

        stream.getTracks().forEach((track) => pc.addTrack(track, stream))

        pc.ontrack = (e) => {
          if (!remoteAudioRef.current) return
          remoteAudioRef.current.srcObject = e.streams[0]
          void remoteAudioRef.current.play().catch(() => {})
        }

        const dc = pc.createDataChannel('oai-events')
        dcRef.current = dc
        dc.onmessage = (evt) => handleRealtimeEvent(evt.data)

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        const sdpResp = await fetch(`${REALTIME_API_URL}?model=${encodeURIComponent(sessionData.model)}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionData.clientSecret}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        })
        if (!sdpResp.ok) throw new Error(`SDP exchange failed: ${sdpResp.status}`)
        const answerSdp = await sdpResp.text()
        if (cancelled) return
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

        if (!cancelled) setPhase('in-call')
      } catch (err) {
        console.error('Realtime start failed:', err)
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : String(err))
          setPhase('error')
        }
      }
    }
    void start()
    return () => {
      cancelled = true
      teardown()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleRealtimeEvent(raw: unknown) {
    let msg: { type?: string; transcript?: string } & Record<string, unknown>
    try {
      msg = JSON.parse(raw as string)
    } catch {
      return
    }

    switch (msg.type) {
      case 'input_audio_buffer.speech_started':
        setUserSpeaking(true)
        break
      case 'input_audio_buffer.speech_stopped':
        setUserSpeaking(false)
        break
      case 'output_audio_buffer.started':
        setAssistantSpeaking(true)
        break
      case 'output_audio_buffer.stopped':
      case 'response.done':
        setAssistantSpeaking(false)
        break
      case 'conversation.item.input_audio_transcription.completed': {
        const text = typeof msg.transcript === 'string' ? msg.transcript.trim() : ''
        if (text) appendTurn('user', text)
        break
      }
      case 'response.audio_transcript.done': {
        const text = typeof msg.transcript === 'string' ? msg.transcript.trim() : ''
        if (text) appendTurn('assistant', text)
        break
      }
      default:
        break
    }
  }

  function appendTurn(role: 'user' | 'assistant', text: string) {
    const turn: TranscriptTurn = { role, text, at: Date.now() }
    transcriptRef.current = [...transcriptRef.current, turn]
    setTranscript(transcriptRef.current)
  }

  function teardown() {
    try {
      dcRef.current?.close()
    } catch {}
    try {
      pcRef.current?.getSenders().forEach((s) => {
        try {
          s.track?.stop()
        } catch {}
      })
      pcRef.current?.close()
    } catch {}
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    localStreamRef.current = null
    pcRef.current = null
    dcRef.current = null
  }

  async function endCall() {
    if (phase === 'ending' || phase === 'scored') return
    setPhase('ending')
    // Let any in-flight transcription events land before we score.
    await new Promise((r) => setTimeout(r, 400))
    teardown()

    const turns = transcriptRef.current
    if (turns.length < 2 || !personaIdRef.current) {
      onEnd(null, turns)
      setPhase('scored')
      return
    }

    try {
      const transcription = turns
        .map((t) => `${t.role === 'user' ? 'BDR' : personaName}: ${t.text}`)
        .join('\n\n')

      const scoreResp = await fetch('/api/vbrick/framework-spar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: personaIdRef.current,
          action: 'score',
          sessionId: sessionIdRef.current,
          transcription,
          bdrAccent: 'general',
          durationSeconds: Math.max(30, turns.length * 15),
        }),
      })
      if (!scoreResp.ok) throw new Error('Scoring failed')
      const result = (await scoreResp.json()) as SparringScoreResult
      onEnd(result, turns)
      setPhase('scored')
    } catch (err) {
      console.error('Scoring failed:', err)
      onEnd(null, turns)
      setPhase('scored')
    }
  }

  // --- UI ---
  const statusLabel =
    phase === 'connecting'
      ? 'Connecting…'
      : phase === 'ending'
      ? 'Scoring…'
      : phase === 'error'
      ? 'Connection failed'
      : userSpeaking
      ? "You're speaking"
      : assistantSpeaking
      ? `${personaName} is speaking`
      : phase === 'in-call'
      ? 'Listening…'
      : ''

  const circleColor =
    phase === 'connecting' || phase === 'ending'
      ? neuTheme.colors.accent.muted
      : phase === 'error'
      ? neuTheme.colors.status.danger
      : assistantSpeaking
      ? neuTheme.colors.status.success
      : userSpeaking
      ? neuTheme.colors.accent.primary
      : neuTheme.colors.bg

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div
        className="flex items-center justify-between p-4"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raisedSm,
          borderRadius: neuTheme.radii.md,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '9999px',
              background: neuTheme.colors.accent.primary,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: neuTheme.shadows.raisedSm,
              fontWeight: 700,
            }}
          >
            {personaName.charAt(0)}
          </div>
          <div>
            <p
              className="font-general-sans font-bold text-base"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {personaName}
            </p>
            <p className="text-xs font-satoshi" style={{ color: neuTheme.colors.text.muted }}>
              {personaTitle}
            </p>
          </div>
        </div>
        <span
          className="text-xs font-satoshi font-medium px-3 py-1"
          style={{
            background: neuTheme.colors.bgLight,
            boxShadow: neuTheme.shadows.insetSm,
            borderRadius: neuTheme.radii.full,
            color: neuTheme.colors.text.body,
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col items-center py-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 120,
            height: 120,
            borderRadius: '9999px',
            background: circleColor,
            boxShadow:
              assistantSpeaking || userSpeaking
                ? `0 0 0 8px ${neuTheme.colors.accent.muted}33, 0 0 40px ${neuTheme.colors.accent.primary}55`
                : neuTheme.shadows.raised,
            transition: 'all 0.3s ease',
            animation: userSpeaking || assistantSpeaking ? 'rt-pulse 1.2s ease-in-out infinite' : 'none',
          }}
        >
          <Phone className="w-12 h-12" style={{ color: userSpeaking || assistantSpeaking ? 'white' : neuTheme.colors.accent.primary }} />
        </div>
        <style>{`@keyframes rt-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }`}</style>
      </div>

      <div
        className="p-4 space-y-3 font-satoshi text-sm max-h-[320px] overflow-y-auto"
        style={{
          background: neuTheme.colors.bgLight,
          boxShadow: neuTheme.shadows.insetSm,
          borderRadius: neuTheme.radii.md,
          color: neuTheme.colors.text.body,
        }}
      >
        {transcript.length === 0 && phase !== 'error' && (
          <p style={{ color: neuTheme.colors.text.muted }}>
            {phase === 'connecting' ? 'Connecting to the prospect…' : `Waiting for ${personaName} to answer…`}
          </p>
        )}
        {transcript.map((t, i) => (
          <div key={i}>
            <span
              className="font-satoshi font-semibold mr-2"
              style={{ color: t.role === 'user' ? neuTheme.colors.accent.primary : neuTheme.colors.text.heading }}
            >
              {t.role === 'user' ? 'You:' : `${personaName}:`}
            </span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {scriptVisible && !hardMode && scenario.cheatCard.length > 0 && (
        <div
          className="p-4 space-y-2"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.md,
          }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.2em] font-satoshi font-medium"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            Your script
          </p>
          <ol className="space-y-2">
            {scenario.cheatCard.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span
                  className="flex items-center justify-center shrink-0 font-bold text-[10px]"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '9999px',
                    background: neuTheme.colors.accent.primary,
                    color: 'white',
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium" style={{ color: neuTheme.colors.text.heading }}>
                    {step.label}
                  </p>
                  <p className="text-xs" style={{ color: neuTheme.colors.text.muted }}>
                    {step.hint}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {phase === 'error' && (
        <div
          className="p-3 font-satoshi text-xs"
          style={{
            background: neuTheme.colors.bgLight,
            boxShadow: neuTheme.shadows.insetSm,
            borderRadius: neuTheme.radii.sm,
            borderLeft: `3px solid ${neuTheme.colors.status.danger}`,
            color: neuTheme.colors.text.body,
          }}
        >
          Connection failed: {errorMsg ?? 'Unknown error'}. Try again.
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={endCall}
          disabled={phase === 'ending' || phase === 'scored'}
          className="flex items-center gap-2 px-5 py-2.5 font-satoshi font-medium text-sm border-none cursor-pointer"
          style={{
            background: neuTheme.colors.status.danger,
            color: 'white',
            borderRadius: neuTheme.radii.full,
            boxShadow: neuTheme.shadows.raisedSm,
            opacity: phase === 'ending' || phase === 'scored' ? 0.6 : 1,
          }}
        >
          <PhoneOff className="w-4 h-4" />
          End Call
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 font-satoshi text-xs border-none cursor-pointer"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.full,
            color: neuTheme.colors.text.muted,
          }}
        >
          Back
        </button>
      </div>
    </div>
  )
}
