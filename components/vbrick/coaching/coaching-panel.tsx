'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Radio, PhoneOff, X } from 'lucide-react'
import { NeuButton } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { useStreamingSTT } from '@/hooks/use-streaming-stt'
import { INTENT_COLORS } from '@/lib/vbrick/coaching-prompts'

interface CoachingPrompt {
  id: string
  intent: string
  text: string
  color: string
  timestamp: number
}

interface CoachingPanelProps {
  email: string
  callingSessionId?: string | null
  contactName?: string
  company?: string
  onEnd: (summary: CoachingSummary | null) => void
}

export interface CoachingSummary {
  talk_time_assessment: string
  objections_handled: string[]
  competitors_mentioned: string[]
  strengths: string[]
  improvements: string[]
  quality_score: number
  one_thing: string
}

export function CoachingPanel({ email, callingSessionId, contactName, company, onEnd }: CoachingPanelProps) {
  const stt = useStreamingSTT()
  const [coachingSessionId, setCoachingSessionId] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<CoachingPrompt[]>([])
  const [intentsDetected, setIntentsDetected] = useState<Array<{ intent: string; timestamp: number }>>([])
  const [callDuration, setCallDuration] = useState(0)
  const [bdrWordCount, setBdrWordCount] = useState(0)

  const lastClassifiedRef = useRef('')
  const classifyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start coaching session on mount
  useEffect(() => {
    async function init() {
      // Create coaching session
      const res = await fetch('/api/vbrick/coaching/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callingSessionId }),
      })
      if (res.ok) {
        const data = await res.json()
        setCoachingSessionId(data.session.id)
      }

      // Start listening
      await stt.startListening()
    }
    init()

    // Call duration timer
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => {
      if (classifyTimerRef.current) clearInterval(classifyTimerRef.current)
      if (durationTimerRef.current) clearInterval(durationTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Classify transcript every 5 seconds when there's new text
  useEffect(() => {
    if (classifyTimerRef.current) clearInterval(classifyTimerRef.current)

    classifyTimerRef.current = setInterval(async () => {
      const currentText = stt.fullTranscript
      if (!currentText || currentText === lastClassifiedRef.current) return
      if (currentText.length < 20) return

      // Get last ~100 words for classification
      const words = currentText.split(' ')
      const recentText = words.slice(-100).join(' ')
      lastClassifiedRef.current = currentText

      // Rough talk-time estimate (BDR words vs total)
      const totalWords = words.length
      const talkTimeRatio = totalWords > 0 ? bdrWordCount / totalWords : 0.5

      try {
        const res = await fetch('/api/vbrick/coaching/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: recentText,
            context: { prospectName: contactName, company, talkTimeRatio },
          }),
        })

        if (res.ok) {
          const result = await res.json()
          if (result.coaching_prompt && result.confidence > 0.5) {
            const newPrompt: CoachingPrompt = {
              id: `${Date.now()}-${result.intent}`,
              intent: result.intent,
              text: result.coaching_prompt,
              color: INTENT_COLORS[result.intent] || neuTheme.colors.text.muted,
              timestamp: Date.now(),
            }

            setPrompts((prev) => {
              const filtered = prev.filter((p) => Date.now() - p.timestamp < 15000)
              return [...filtered, newPrompt].slice(-3)
            })

            setIntentsDetected((prev) => [...prev, { intent: result.intent, timestamp: Date.now() }])
          }
        }
      } catch {
        // Silently fail — coaching is a best-effort layer
      }
    }, 5000)

    return () => {
      if (classifyTimerRef.current) clearInterval(classifyTimerRef.current)
    }
  }, [stt.fullTranscript, bdrWordCount, contactName, company])

  // Track word count for talk-time estimation
  useEffect(() => {
    const segments = stt.finalSegments
    if (segments.length > 0) {
      const total = segments.reduce((acc, s) => acc + s.text.split(' ').length, 0)
      setBdrWordCount(total)
    }
  }, [stt.finalSegments])

  // Auto-dismiss old prompts
  useEffect(() => {
    const interval = setInterval(() => {
      setPrompts((prev) => prev.filter((p) => Date.now() - p.timestamp < 15000))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleDismissPrompt = (id: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleEndCoaching = useCallback(async () => {
    stt.stopListening()
    if (durationTimerRef.current) clearInterval(durationTimerRef.current)
    if (classifyTimerRef.current) clearInterval(classifyTimerRef.current)

    let summary: CoachingSummary | null = null

    if (coachingSessionId) {
      const talkTimeRatio = stt.finalSegments.length > 0 ? 0.5 : 0
      const res = await fetch('/api/vbrick/coaching/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: coachingSessionId,
          transcript: stt.fullTranscript,
          intentsDetected,
          talkTimeBdrPct: talkTimeRatio * 100,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        summary = data.summary
      }
    }

    onEnd(summary)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachingSessionId, stt.fullTranscript, intentsDetected, onEnd])

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: neuTheme.radii.sm,
              background: '#dc2626',
              boxShadow: '0 0 8px rgba(220, 38, 38, 0.4)',
            }}
          >
            <Radio className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-general-sans font-semibold" style={{ color: neuTheme.colors.text.heading }}>
              Live Coaching
            </p>
            <p className="text-[10px] font-satoshi tabular-nums" style={{ color: neuTheme.colors.text.muted }}>
              {formatDuration(callDuration)}
            </p>
          </div>
        </div>
        <NeuButton variant="icon" onClick={handleEndCoaching} style={{ width: 32, height: 32 }}>
          <PhoneOff className="w-3.5 h-3.5" style={{ color: '#dc2626' }} />
        </NeuButton>
      </div>

      {/* Live transcript preview */}
      <div
        className="mx-4 mb-3 px-3 py-2 overflow-y-auto"
        style={{
          borderRadius: neuTheme.radii.sm,
          boxShadow: neuTheme.shadows.insetSm,
          maxHeight: 160,
          fontSize: 12,
          fontFamily: 'var(--font-satoshi)',
          color: neuTheme.colors.text.muted,
          lineHeight: 1.5,
        }}
      >
        {stt.fullTranscript ? (
          <>
            <span>{stt.finalSegments.map((s) => s.text).join(' ')}</span>
            {stt.interimTranscript && (
              <span style={{ color: neuTheme.colors.text.subtle }}> {stt.interimTranscript}</span>
            )}
          </>
        ) : (
          <span style={{ color: neuTheme.colors.text.subtle }}>Listening...</span>
        )}
      </div>

      {/* Coaching prompts */}
      <div className="flex-1 px-4 space-y-2 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {prompts.map((prompt) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative px-3 py-2.5"
              style={{
                borderRadius: neuTheme.radii.sm,
                boxShadow: neuTheme.shadows.raisedSm,
                borderLeft: `3px solid ${prompt.color}`,
              }}
            >
              <button
                onClick={() => handleDismissPrompt(prompt.id)}
                className="absolute top-1 right-1 border-none bg-transparent cursor-pointer p-0.5"
                style={{ color: neuTheme.colors.text.subtle }}
              >
                <X className="w-3 h-3" />
              </button>
              <p
                className="text-xs uppercase tracking-widest font-general-sans font-semibold mb-0.5"
                style={{ color: prompt.color }}
              >
                {prompt.intent.replace(/_/g, ' ')}
              </p>
              <p
                className="text-sm font-satoshi leading-snug pr-4"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {prompt.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {prompts.length === 0 && stt.isListening && (
          <div className="text-center py-4">
            <p className="text-xs font-satoshi italic" style={{ color: neuTheme.colors.text.subtle }}>
              Coaching prompts will appear here as the conversation unfolds
            </p>
          </div>
        )}
      </div>

      {/* Error display */}
      {stt.error && (
        <div className="mx-4 mb-2 px-3 py-2 text-xs font-satoshi" style={{ color: '#dc2626', borderRadius: neuTheme.radii.sm, boxShadow: neuTheme.shadows.insetSm }}>
          {stt.error}
        </div>
      )}
    </div>
  )
}
