'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export interface TranscriptSegment {
  text: string
  isFinal: boolean
  timestamp: number
}

interface UseStreamingSTTResult {
  isListening: boolean
  interimTranscript: string
  finalSegments: TranscriptSegment[]
  fullTranscript: string
  error: string | null
  startListening: () => Promise<void>
  stopListening: () => void
  resetTranscript: () => void
}

/**
 * Browser-side streaming speech-to-text via Deepgram WebSocket.
 *
 * Architecture:
 * 1. getUserMedia() captures mic audio
 * 2. AudioContext + ScriptProcessorNode converts to 16-bit PCM at 16kHz
 * 3. PCM chunks stream to Deepgram WebSocket
 * 4. Deepgram returns interim + final transcript segments
 *
 * The hook fetches a temporary Deepgram API key from our server
 * to avoid exposing the real key in the browser.
 */
export function useStreamingSTT(): UseStreamingSTTResult {
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalSegments, setFinalSegments] = useState<TranscriptSegment[]>([])
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)

  const fullTranscript = finalSegments.map((s) => s.text).join(' ') + (interimTranscript ? ' ' + interimTranscript : '')

  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        // Send close message to Deepgram
        wsRef.current.send(JSON.stringify({ type: 'CloseStream' }))
      }
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const startListening = useCallback(async () => {
    setError(null)
    setInterimTranscript('')

    try {
      // Step 1: Get temporary Deepgram key from our server
      const tokenRes = await fetch('/api/vbrick/coaching/token')
      if (!tokenRes.ok) {
        const msg = await tokenRes.text()
        throw new Error(`Failed to get STT token: ${msg}`)
      }
      const { key } = await tokenRes.json()

      // Step 2: Open WebSocket to Deepgram
      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&language=en-US&smart_format=true&interim_results=true&endpointing=300&utterance_end_ms=1500&encoding=linear16&sample_rate=16000`,
        ['token', key]
      )
      wsRef.current = ws

      ws.onopen = () => {
        setIsListening(true)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'Results' && data.channel?.alternatives?.[0]) {
            const alt = data.channel.alternatives[0]
            const transcript = alt.transcript || ''

            if (data.is_final) {
              if (transcript.trim()) {
                setFinalSegments((prev) => [
                  ...prev,
                  { text: transcript.trim(), isFinal: true, timestamp: Date.now() },
                ])
              }
              setInterimTranscript('')
            } else {
              setInterimTranscript(transcript)
            }
          }
        } catch {
          // Ignore non-JSON messages
        }
      }

      ws.onerror = () => {
        setError('WebSocket connection error')
        cleanup()
        setIsListening(false)
      }

      ws.onclose = () => {
        setIsListening(false)
      }

      // Step 3: Capture mic audio
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })
      streamRef.current = stream

      // Step 4: Convert to PCM and stream to Deepgram
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return

        const inputData = e.inputBuffer.getChannelData(0)
        // Convert Float32 to Int16 PCM
        const pcm = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }
        ws.send(pcm.buffer)
      }

      source.connect(processor)
      processor.connect(audioContext.destination)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
      cleanup()
      setIsListening(false)
    }
  }, [cleanup])

  const stopListening = useCallback(() => {
    cleanup()
    setIsListening(false)
    setInterimTranscript('')
  }, [cleanup])

  const resetTranscript = useCallback(() => {
    setFinalSegments([])
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    interimTranscript,
    finalSegments,
    fullTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
