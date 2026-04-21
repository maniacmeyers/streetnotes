'use client'

import React, { useEffect, useRef, useCallback, CSSProperties, ReactNode } from 'react'

/**
 * Helper to convert hex to rgba
 */
function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex) return `rgba(0,0,0,${alpha})`
  let h = hex.replace('#', '')
  if (h.length === 3) {
    h = h
      .split('')
      .map(c => c + c)
      .join('')
  }
  const int = parseInt(h, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

interface ElectricBorderProps {
  children?: ReactNode
  color?: string
  speed?: number
  chaos?: number
  borderRadius?: number
  className?: string
  style?: CSSProperties
}

/**
 * ElectricBorder
 *
 * A component that renders a chaotic, electrical-looking animated border around its content.
 * Uses HTML5 Canvas and Perlin noise to generate the effect.
 *
 * Based on @BalintFerenczy's concept: https://codepen.io/BalintFerenczy/pen/KwdoyEN
 */
const ElectricBorder: React.FC<ElectricBorderProps> = ({
  children,
  color = '#5227FF',
  speed = 1,
  chaos = 0.12,
  borderRadius = 24,
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const timeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)

  // Random number generator
  const random = useCallback((x: number): number => {
    return (Math.sin(x * 12.9898) * 43758.5453) % 1
  }, [])

  // 2D Noise function
  const noise2D = useCallback(
    (x: number, y: number): number => {
      const i = Math.floor(x)
      const j = Math.floor(y)
      const fx = x - i
      const fy = y - j
      const a = random(i + j * 57)
      const b = random(i + 1 + j * 57)
      const c = random(i + (j + 1) * 57)
      const d = random(i + 1 + (j + 1) * 57)

      // Smoothstep
      const ux = fx * fx * (3.0 - 2.0 * fx)
      const uy = fy * fy * (3.0 - 2.0 * fy)

      // Interpolation
      return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy
    },
    [random]
  )

  // Octaved Noise (FBM)
  const octavedNoise = useCallback(
    (
      x: number,
      octaves: number,
      lacunarity: number,
      gain: number,
      baseAmplitude: number,
      baseFrequency: number,
      time: number,
      seed: number,
      baseFlatness: number
    ): number => {
      let y = 0
      let amplitude = baseAmplitude
      let frequency = baseFrequency
      for (let i = 0; i < octaves; i++) {
        let octaveAmplitude = amplitude
        if (i === 0) {
          octaveAmplitude *= baseFlatness
        }
        y += octaveAmplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3)
        frequency *= lacunarity
        amplitude *= gain
      }
      return y
    },
    [noise2D]
  )

  // Calculate point on a rounded rectangle corner arc
  const getCornerPoint = useCallback(
    (
      centerX: number,
      centerY: number,
      radius: number,
      startAngle: number,
      arcLength: number,
      progress: number
    ): { x: number; y: number } => {
      const angle = startAngle + progress * arcLength
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      }
    },
    []
  )

  const getRoundedRectPoint = useCallback(
    (
      t: number,
      left: number,
      top: number,
      width: number,
      height: number,
      radius: number
    ): { x: number; y: number } => {
      const straightWidth = width - 2 * radius
      const straightHeight = height - 2 * radius
      const cornerArc = (Math.PI * radius) / 2
      const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc
      const distance = t * totalPerimeter

      let accumulated = 0

      // Top Edge
      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth
        return { x: left + radius + progress * straightWidth, y: top }
      }
      accumulated += straightWidth

      // Top Right Corner
      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc
        return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress)
      }
      accumulated += cornerArc

      // Right Edge
      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight
        return { x: left + width, y: top + radius + progress * straightHeight }
      }
      accumulated += straightHeight

      // Bottom Right Corner
      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc
        return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress)
      }
      accumulated += cornerArc

      // Bottom Edge
      if (distance <= accumulated + straightWidth) {
        const progress = (distance - accumulated) / straightWidth
        return { x: left + width - radius - progress * straightWidth, y: top + height }
      }
      accumulated += straightWidth

      // Bottom Left Corner
      if (distance <= accumulated + cornerArc) {
        const progress = (distance - accumulated) / cornerArc
        return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress)
      }
      accumulated += cornerArc

      // Left Edge
      if (distance <= accumulated + straightHeight) {
        const progress = (distance - accumulated) / straightHeight
        return { x: left, y: top + height - radius - progress * straightHeight }
      }
      accumulated += straightHeight

      // Top Left Corner
      const progress = (distance - accumulated) / cornerArc
      return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress)
    },
    [getCornerPoint]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Reduced motion: draw one static frame, no animation loop
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reduceMotion = motionQuery.matches

    // Config
    const octaves = 10
    const lacunarity = 1.6
    const gain = 0.7
    const amplitude = chaos
    const frequency = 10
    const baseFlatness = 0
    const displacement = 60
    const borderOffset = 24

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      const width = rect.width + borderOffset * 2
      const height = rect.height + borderOffset * 2
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.scale(dpr, dpr)
      return { width, height }
    }

    let { width, height } = updateSize()

    // Pause when off-screen
    let isVisible = true
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
      },
      { threshold: 0 }
    )
    visibilityObserver.observe(container)

    const drawElectricBorder = (currentTime: number) => {
      if (!canvas || !ctx) return

      if (!isVisible && !reduceMotion) {
        lastFrameTimeRef.current = currentTime
        animationRef.current = requestAnimationFrame(drawElectricBorder)
        return
      }

      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000
      timeRef.current += deltaTime * speed
      lastFrameTimeRef.current = currentTime

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.scale(dpr, dpr)

      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const scale = displacement
      const left = borderOffset
      const top = borderOffset
      const borderWidth = width - 2 * borderOffset
      const borderHeight = height - 2 * borderOffset

      const maxRadius = Math.min(borderWidth, borderHeight) / 2
      const radius = Math.min(borderRadius, maxRadius)

      const approximatePerimeter = 2 * (borderWidth + borderHeight) + 2 * Math.PI * radius
      const sampleCount = Math.floor(approximatePerimeter / 2)

      ctx.beginPath()
      for (let i = 0; i <= sampleCount; i++) {
        const progress = i / sampleCount
        const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius)

        const xNoise = octavedNoise(
          progress * 8,
          octaves,
          lacunarity,
          gain,
          amplitude,
          frequency,
          timeRef.current,
          0,
          baseFlatness
        )

        const yNoise = octavedNoise(
          progress * 8,
          octaves,
          lacunarity,
          gain,
          amplitude,
          frequency,
          timeRef.current,
          1,
          baseFlatness
        )

        const displacedX = point.x + xNoise * scale
        const displacedY = point.y + yNoise * scale

        if (i === 0) {
          ctx.moveTo(displacedX, displacedY)
        } else {
          ctx.lineTo(displacedX, displacedY)
        }
      }

      ctx.closePath()
      ctx.stroke()

      if (!reduceMotion) {
        animationRef.current = requestAnimationFrame(drawElectricBorder)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      const newSize = updateSize()
      width = newSize.width
      height = newSize.height
      // Redraw static frame on resize for reduced-motion users
      if (reduceMotion) {
        drawElectricBorder(performance.now())
      }
    })

    resizeObserver.observe(container)
    animationRef.current = requestAnimationFrame(drawElectricBorder)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
    }
  }, [color, speed, chaos, borderRadius, octavedNoise, getRoundedRectPoint])

  return (
    <div
      ref={containerRef}
      className={`relative overflow-visible isolate ${className ?? ''}`}
      style={{ '--electric-border-color': color, borderRadius, ...style } as CSSProperties}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[2]">
        <canvas ref={canvasRef} className="block" aria-hidden="true" />
      </div>

      {/* Glow Effects */}
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none z-[3]" aria-hidden="true">
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ border: `2px solid ${hexToRgba(color, 0.8)}`, filter: 'blur(2px)' }}
        />
        <div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ border: `3px solid ${color}`, filter: 'blur(6px)' }}
        />
        <div
          className="absolute -inset-3 rounded-[inherit] pointer-events-none opacity-50"
          style={{
            filter: 'blur(20px)',
            background: `linear-gradient(-30deg, ${color}, transparent, ${color})`,
          }}
        />
      </div>

      <div className="relative rounded-[inherit] z-[1]">{children}</div>
    </div>
  )
}

export default ElectricBorder
