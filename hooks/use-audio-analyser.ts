'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseAudioAnalyserResult {
  analyserNode: AnalyserNode | null
  frequencyData: Uint8Array | null
  isActive: boolean
  startAnalysing: (existingStream?: MediaStream) => Promise<void>
  stopAnalysing: () => void
}

export function useAudioAnalyser(): UseAudioAnalyserResult {
  const [isActive, setIsActive] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ownsStreamRef = useRef(false)
  const frequencyDataRef = useRef<Uint8Array | null>(null)

  const stopAnalysing = useCallback(() => {
    // Only stop stream tracks if we created the stream ourselves
    if (ownsStreamRef.current && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    streamRef.current = null
    ownsStreamRef.current = false

    if (
      audioContextRef.current &&
      audioContextRef.current.state !== 'closed'
    ) {
      audioContextRef.current.close().catch(() => {})
    }
    audioContextRef.current = null
    analyserRef.current = null
    frequencyDataRef.current = null
    setIsActive(false)
  }, [])

  const startAnalysing = useCallback(
    async (existingStream?: MediaStream) => {
      stopAnalysing()
      try {
        let stream: MediaStream
        if (existingStream) {
          stream = existingStream
          ownsStreamRef.current = false
        } else {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          ownsStreamRef.current = true
        }
        streamRef.current = stream

        const ctx = new AudioContext()
        audioContextRef.current = ctx

        const analyser = ctx.createAnalyser()
        analyser.fftSize = 64
        analyser.smoothingTimeConstant = 0.8
        analyserRef.current = analyser

        const source = ctx.createMediaStreamSource(stream)
        source.connect(analyser)

        frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount)
        setIsActive(true)
      } catch {
        stopAnalysing()
      }
    },
    [stopAnalysing]
  )

  useEffect(() => {
    return () => stopAnalysing()
  }, [stopAnalysing])

  return {
    analyserNode: analyserRef.current,
    frequencyData: frequencyDataRef.current,
    isActive,
    startAnalysing,
    stopAnalysing,
  }
}
