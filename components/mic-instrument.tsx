'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { FaMicrophone, FaStop } from 'react-icons/fa'

interface MicInstrumentProps {
  isRecording: boolean
  disabled: boolean
  canStop: boolean
  durationSec: number
  maxDurationSec: number
  analyserNode: AnalyserNode | null
  onStart: () => void
  onStop: () => void
  /** Minimum seconds required before stop is allowed (affects the hint copy). */
  minDurationSec?: number
  /** Label shown below the instrument in idle state. Defaults to "Tap to record". */
  idleLabel?: string
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const INSTRUMENT_SIZE_MOBILE = 220
const BAR_COUNT = 56
const FIELD_GLOW = {
  bg: '#FAF6EE',
  surface: '#F2EBDF',
  text: '#1A1410',
  secondary: '#3D332A',
  accent: '#A8855A',
  deep: '#8B6B40',
  glow: '#D4A28A',
}

export default function MicInstrument({
  isRecording,
  disabled,
  canStop,
  durationSec,
  maxDurationSec,
  analyserNode,
  onStart,
  onStop,
  minDurationSec = 0,
  idleLabel = 'Tap to record',
}: MicInstrumentProps) {
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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      const hasData = analyserNode && isRecording && !prefersReducedMotion && freqDataRef.current
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
        ctx.strokeStyle = `rgba(168, 133, 90, ${alpha})`
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }

    draw()
    if (isRecording && !prefersReducedMotion) {
      const animate = () => {
        draw()
        frameRef.current = requestAnimationFrame(animate)
      }
      frameRef.current = requestAnimationFrame(animate)
    }

    return () => cancelAnimationFrame(frameRef.current)
  }, [analyserNode, isRecording])

  // Timer progress 0 → 100% as durationSec → maxDurationSec
  const progressPct = Math.min(100, (durationSec / maxDurationSec) * 100)
  const nearMax = durationSec >= maxDurationSec - 30

  return (
    <div className="flex flex-col items-center gap-5">
      {/* The instrument */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: INSTRUMENT_SIZE_MOBILE,
          height: INSTRUMENT_SIZE_MOBILE,
        }}
      >
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
              border: '1.5px dashed rgba(168, 133, 90, 0.28)',
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
                border: '3px solid rgba(139, 107, 64, 0.44)',
              }}
              aria-hidden="true"
            />
          )}

          {/* Layer 3 — Glass bezel (the main circular body) */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: 18,
              background: FIELD_GLOW.surface,
              border: '1px solid rgba(168, 133, 90, 0.18)',
              boxShadow: `
                8px 8px 18px rgba(139, 107, 64, 0.22),
                -8px -8px 18px rgba(250, 246, 238, 0.95),
                0 14px 28px rgba(212, 162, 138, 0.22)
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
                ${nearMax ? FIELD_GLOW.deep : FIELD_GLOW.accent} 0%,
                ${nearMax ? FIELD_GLOW.deep : FIELD_GLOW.accent} ${progressPct}%,
                rgba(168, 133, 90, 0.12) ${progressPct}%,
                rgba(168, 133, 90, 0.12) 100%
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
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`
              relative z-10 rounded-full
              flex flex-col items-center justify-center
              cursor-pointer
              ${disabled && !isRecording ? 'cursor-not-allowed' : ''}
            `}
            style={{
              width: 132,
              height: 132,
              background: isRecording
                ? `linear-gradient(145deg, ${FIELD_GLOW.deep}, ${FIELD_GLOW.accent})`
                : disabled
                  ? `linear-gradient(145deg, ${FIELD_GLOW.surface}, ${FIELD_GLOW.bg})`
                  : `linear-gradient(145deg, ${FIELD_GLOW.bg}, ${FIELD_GLOW.surface})`,
              border: isRecording
                ? '1.5px solid rgba(168, 133, 90, 0.42)'
                : disabled
                  ? '1.5px solid rgba(139, 107, 64, 0.12)'
                  : '1.5px solid rgba(168, 133, 90, 0.32)',
              boxShadow: isRecording
                ? `inset 4px 4px 8px rgba(26, 20, 16, 0.22), inset -3px -3px 7px rgba(212, 162, 138, 0.28)`
                : `6px 6px 14px rgba(139, 107, 64, 0.32), -4px -4px 12px rgba(250, 246, 238, 0.72), 0 12px 24px rgba(212, 162, 138, 0.34)`,
            }}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? (
              <>
                <FaStop className="mb-1 text-xl text-[#FAF6EE]" />
                <span className="text-[22px] font-bold text-[#FAF6EE] tabular-nums leading-none">
                  {formatTimer(durationSec)}
                </span>
              </>
            ) : (
              <FaMicrophone
                className={`text-4xl ${disabled ? 'text-[#8B6B40]/45' : 'text-[#A8855A]'}`}
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Label / hint below the instrument */}
      <div className="text-center min-h-[32px]">
        {isRecording ? (
          <>
            {!canStop && minDurationSec > 0 && (
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#3D332A]">
                Min {minDurationSec}s • {Math.max(0, minDurationSec - durationSec)}s
              </p>
            )}
            {canStop && durationSec < maxDurationSec - 30 && (
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8B6B40]">
                Tap the core to stop
              </p>
            )}
            {durationSec >= maxDurationSec - 30 && (
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8B6B40]">
                Auto-stop in {maxDurationSec - durationSec}s
              </p>
            )}
          </>
        ) : (
          <p className="text-xs font-extrabold uppercase tracking-[0.12em]">
            {disabled ? (
              <span className="text-[#3D332A]/65">Mic unavailable</span>
            ) : (
              <span className="text-[#8B6B40]">{idleLabel}</span>
            )}
          </p>
        )}
      </div>
    </div>
  )
}
