'use client'

import { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, useTransform } from 'motion/react'

interface CountUpProps {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function CountUp({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 1,
  className = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)

  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration,
  })
  const display = useTransform(springValue, (v) => {
    return `${prefix}${v.toFixed(decimals)}${suffix}`
  })

  useEffect(() => {
    motionValue.set(value)
  }, [motionValue, value])

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = v
      }
    })
    return unsubscribe
  }, [display])

  return (
    <span ref={ref} className={`font-fira-code ${className}`}>
      {`${prefix}${(0).toFixed(decimals)}${suffix}`}
    </span>
  )
}
