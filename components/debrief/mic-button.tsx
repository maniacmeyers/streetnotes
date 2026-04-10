'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { FaMicrophone, FaStop } from 'react-icons/fa'

interface MicButtonProps {
  isRecording: boolean
  disabled: boolean
  canStop: boolean
  durationSec: number
  maxDurationSec: number
  analyserNode: AnalyserNode | null
  onStart: () => void
  onStop: () => void
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const INSTRUMENT_SIZE = 260
const INSTRUMENT_SIZE_MOBILE = 220
const BAR_COUNT = 56

export default function MicButton({
  isRecording,
  disabled,
  canStop,
  durationSec,
  maxDurationSec,
  analyserNode,
  onStart,
  onStop,
}: MicButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  const handleClick = () => {
    if (navigator.vibrate) {
      navigator.vibrate(isRecording ? [30, 30, 30] : 50)
    }
    if (isRecording && canStop) onStop()
    else if (!isRecording && !disabled) onStart()
  }

  // Circular waveform — bars radiate outward from a ring inside the dial.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const cx = width / 2
    const cy = height / 2
    const innerR = width * 0.39
    const maxBarLen = width * 0.095

    if (analyserNode) {
      freqDataRef.current = new Uint8Array(analyserNode.frequencyBinCount)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const hasData = analyserNode && isRecording && freqDataRef.current
      if (hasData) {
        analyserNode.getByteFrequencyData(freqDataRef.current!)
      }

      for (let i = 0; i < BAR_COUNT; i++) {
        const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2

        let value = 0
        if (hasData) {
          const binIndex = Math.min(
            Math.floor((i / BAR_COUNT) * freqDataRef.current!.length * 0.7) + 2,
            freqDataRef.current!.length - 1
          )
          value = freqDataRef.current![binIndex] / 255
        }

        const minLen = isRecording ? 3 : 2
        const length = minLen + value * maxBarLen

        const x1 = cx + Math.cos(angle) * innerR
        const y1 = cy + Math.sin(angle) * innerR
        const x2 = cx + Math.cos(angle) * (innerR + length)
        const y2 = cy + Math.sin(angle) * (innerR + length)

        const alpha = isRecording ? 0.35 + value * 0.65 : 0.18
        ctx.strokeStyle = `rgba(0, 230, 118, ${alpha})`
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [analyserNode, isRecording])

  // Timer progress 0 → 100% as durationSec → maxDurationSec
  const progressPct = Math.min(100, (durationSec / maxDurationSec) * 100)
  const nearMax = durationSec >= maxDurationSec - 30

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6">
      {/* The instrument */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: INSTRUMENT_SIZE_MOBILE,
          height: INSTRUMENT_SIZE_MOBILE,
        }}
      >
        <style>{`
          @media (min-width: 640px) {
            .mic-instrument {
              width: ${INSTRUMENT_SIZE}px !important;
              height: ${INSTRUMENT_SIZE}px !important;
            }
          }
        `}</style>
        <div
          className="mic-instrument absolute inset-0 flex items-center justify-center"
          style={{
            width: INSTRUMENT_SIZE_MOBILE,
            height: INSTRUMENT_SIZE_MOBILE,
          }}
        >
          {/* Layer 1 — Dashed orbit ring (rotating) */}
          <div
            className="absolute inset-0 rounded-full orbit-ring pointer-events-none"
            style={{
              border: '1.5px dashed rgba(0, 230, 118, 0.25)',
              maskImage:
                'conic-gradient(from 0deg, black 0deg 270deg, transparent 270deg 360deg)',
              WebkitMaskImage:
                'conic-gradient(from 0deg, black 0deg 270deg, transparent 270deg 360deg)',
            }}
            aria-hidden="true"
          />

          {/* Layer 2 — Pulse halo when recording */}
          {isRecording && (
            <div
              className="absolute rounded-full pulse-ring pointer-events-none"
              style={{
                inset: 10,
                border: '3px solid rgba(239, 68, 68, 0.5)',
              }}
              aria-hidden="true"
            />
          )}

          {/* Layer 3 — Glass bezel (the main circular body) */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 18,
              background:
                'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 50%, rgba(0,0,0,0.2) 100%)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: `
                inset 0 2px 4px rgba(255, 255, 255, 0.25),
                inset 0 -2px 4px rgba(0, 0, 0, 0.5),
                inset 0 0 60px rgba(0, 230, 118, 0.08),
                0 30px 80px -20px rgba(0, 0, 0, 0.7)
              `,
            }}
            aria-hidden="true"
          />

          {/* Layer 4 — Conic timer ring (arc that fills as you record) */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 22,
              background: `conic-gradient(
                from -90deg,
                ${nearMax ? '#ef4444' : '#00E676'} 0%,
                ${nearMax ? '#ef4444' : '#00E676'} ${progressPct}%,
                rgba(255, 255, 255, 0.05) ${progressPct}%,
                rgba(255, 255, 255, 0.05) 100%
              )`,
              maskImage:
                'radial-gradient(circle, transparent 0, transparent calc(50% - 4px), black calc(50% - 4px), black 50%, transparent 50%)',
              WebkitMaskImage:
                'radial-gradient(circle, transparent 0, transparent calc(50% - 4px), black calc(50% - 4px), black 50%, transparent 50%)',
              opacity: isRecording ? 1 : 0.4,
              transition: 'opacity 300ms ease',
            }}
            aria-hidden="true"
          />

          {/* Layer 5 — Circular waveform canvas */}
          <canvas
            ref={canvasRef}
            className="absolute pointer-events-none"
            style={{ inset: 28 }}
            aria-hidden="true"
          />

          {/* Layer 6 — Core button (the tappable core) */}
          <motion.button
            type="button"
            onClick={handleClick}
            disabled={disabled && !isRecording}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className={`
              relative z-10 rounded-full
              flex flex-col items-center justify-center
              cursor-pointer
              ${disabled && !isRecording ? 'cursor-not-allowed' : ''}
              ${isRecording ? 'breathe-red' : disabled ? '' : 'breathe-volt'}
            `}
            style={{
              width: 132,
              height: 132,
              background: isRecording
                ? 'radial-gradient(circle at 30% 30%, #fca5a5 0%, #dc2626 45%, #7f1d1d 100%)'
                : disabled
                  ? 'radial-gradient(circle at 30% 30%, #4b5563 0%, #1f2937 100%)'
                  : 'radial-gradient(circle at 30% 30%, rgba(0, 255, 140, 0.25) 0%, rgba(10, 20, 15, 0.95) 55%, #000 100%)',
              border: isRecording
                ? '2px solid rgba(255, 200, 200, 0.6)'
                : disabled
                  ? '2px solid rgba(255, 255, 255, 0.1)'
                  : '2px solid rgba(0, 230, 118, 0.5)',
            }}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <>
                <FaStop className="text-white text-xl mb-1 drop-shadow-lg" />
                <span className="font-mono text-[22px] font-bold text-white tabular-nums leading-none drop-shadow-lg">
                  {formatTimer(durationSec)}
                </span>
              </>
            ) : (
              <FaMicrophone
                className={`text-4xl sm:text-5xl drop-shadow-lg ${disabled ? 'text-gray-500' : 'text-volt'}`}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Label / hint below the instrument */}
      <div className="text-center min-h-[32px]">
        {isRecording ? (
          <>
            {!canStop && (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
                Min 15 seconds • {15 - durationSec}s
              </p>
            )}
            {canStop && durationSec < maxDurationSec - 30 && (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80">
                Tap the core to stop
              </p>
            )}
            {durationSec >= maxDurationSec - 30 && (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold">
                Auto-stop in {maxDurationSec - durationSec}s
              </p>
            )}
          </>
        ) : (
          <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em]">
            {disabled ? (
              <span className="text-gray-500">Mic unavailable</span>
            ) : (
              <span className="text-volt/80">Tap to record</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
