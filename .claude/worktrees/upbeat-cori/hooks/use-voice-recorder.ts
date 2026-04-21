'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { pickSupportedMimeType } from '@/lib/audio/recording'

export type VoiceRecorderStatus =
  | 'idle'
  | 'requesting_permission'
  | 'recording'
  | 'stopped'
  | 'error'

interface UseVoiceRecorderResult {
  status: VoiceRecorderStatus
  durationSec: number
  audioBlob: Blob | null
  mimeType: string
  error: string | null
  isSupported: boolean
  mediaStream: MediaStream | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  resetRecording: () => void
}

function getMessageFromUnknownError(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'Microphone permission was denied. Please enable microphone access.'
    }
    if (error.name === 'NotFoundError') {
      return 'No microphone was found on this device.'
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Unable to start recording. Please try again.'
}

export function useVoiceRecorder(): UseVoiceRecorderResult {
  const [status, setStatus] = useState<VoiceRecorderStatus>('idle')
  const [durationSec, setDurationSec] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [mimeType, setMimeType] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stopTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      mediaStreamRef.current = null
    }
  }, [])

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    if (recorder.state !== 'inactive') {
      recorder.stop()
    }
  }, [])

  const resetRecording = useCallback(() => {
    stopRecording()
    stopTracks()
    clearTimer()
    chunksRef.current = []
    mediaRecorderRef.current = null
    setStatus('idle')
    setDurationSec(0)
    setAudioBlob(null)
    setError(null)
    setMimeType('')
  }, [clearTimer, stopRecording, stopTracks])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setStatus('error')
      setError('This browser does not support audio recording.')
      return
    }

    // Start fresh each time to avoid stale blob/state leaks.
    resetRecording()
    setStatus('requesting_permission')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream

      const negotiatedMimeType = pickSupportedMimeType()
      const recorder = negotiatedMimeType
        ? new MediaRecorder(stream, { mimeType: negotiatedMimeType })
        : new MediaRecorder(stream)

      chunksRef.current = []
      setMimeType(recorder.mimeType || negotiatedMimeType)
      setError(null)

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstart = () => {
        setDurationSec(0)
        clearTimer()
        timerRef.current = window.setInterval(() => {
          setDurationSec((prev) => prev + 1)
        }, 1000)
      }

      recorder.onstop = () => {
        clearTimer()
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || negotiatedMimeType || 'audio/webm',
        })
        setAudioBlob(blob)
        setStatus('stopped')
        stopTracks()
      }

      recorder.onerror = () => {
        clearTimer()
        stopTracks()
        setStatus('error')
        setError('Recording failed. Please try again.')
      }

      mediaRecorderRef.current = recorder
      recorder.start(1000)
      setStatus('recording')
    } catch (err) {
      clearTimer()
      stopTracks()
      setStatus('error')
      setError(getMessageFromUnknownError(err))
    }
  }, [clearTimer, isSupported, resetRecording, stopTracks])

  useEffect(() => {
    return () => {
      clearTimer()
      stopTracks()
    }
  }, [clearTimer, stopTracks])

  return {
    status,
    durationSec,
    audioBlob,
    mimeType,
    error,
    isSupported,
    mediaStream: mediaStreamRef.current,
    startRecording,
    stopRecording,
    resetRecording,
  }
}
