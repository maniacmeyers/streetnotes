'use client'

import { useEffect, useRef } from 'react'

interface WaveformVisualizerProps {
  analyserNode: AnalyserNode | null
  isRecording: boolean
}

const BAR_COUNT = 32
const BAR_GAP = 2
const VOLT = '#00E676'

export default function WaveformVisualizer({
  analyserNode,
  isRecording,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas resolution for sharp rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    if (analyserNode && isRecording) {
      frequencyDataRef.current = new Uint8Array(
        analyserNode.frequencyBinCount
      )
    }

    const draw = () => {
      const width = rect.width
      const height = rect.height

      ctx.clearRect(0, 0, width, height)

      if (!analyserNode || !isRecording || !frequencyDataRef.current) {
        // Draw idle state — flat bars
        const barWidth = (width - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT
        for (let i = 0; i < BAR_COUNT; i++) {
          const x = i * (barWidth + BAR_GAP)
          const barHeight = 3
          const y = (height - barHeight) / 2
          ctx.fillStyle = `${VOLT}33`
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, 1)
          ctx.fill()
        }
        animFrameRef.current = requestAnimationFrame(draw)
        return
      }

      analyserNode.getByteFrequencyData(frequencyDataRef.current)

      const barWidth = (width - (BAR_COUNT - 1) * BAR_GAP) / BAR_COUNT

      for (let i = 0; i < BAR_COUNT; i++) {
        // Map frequency bin to bar index (skip very low/high frequencies)
        const binIndex = Math.min(
          Math.floor((i / BAR_COUNT) * frequencyDataRef.current.length * 0.8) +
            2,
          frequencyDataRef.current.length - 1
        )
        const value = frequencyDataRef.current[binIndex] / 255

        const minBarHeight = 3
        const maxBarHeight = height * 0.85
        const barHeight = minBarHeight + value * (maxBarHeight - minBarHeight)

        const x = i * (barWidth + BAR_GAP)
        const y = (height - barHeight) / 2

        // Brighter at higher levels
        const alpha = 0.4 + value * 0.6
        ctx.fillStyle = `rgba(0, 230, 118, ${alpha})`
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
        ctx.fill()
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [analyserNode, isRecording])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[60px] sm:h-[80px]"
      style={{ display: 'block' }}
    />
  )
}
