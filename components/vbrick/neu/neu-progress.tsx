'use client'

import { motion } from 'motion/react'
import { neuTheme } from '@/lib/vbrick/theme'

interface NeuProgressProps {
  value: number  // 0-100
  color?: string
  height?: number
  showLabel?: boolean
  className?: string
}

export function NeuProgress({
  value,
  color = neuTheme.colors.accent.primary,
  height = 12,
  showLabel = false,
  className = '',
}: NeuProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          height,
          borderRadius: height,
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.insetSm,
        }}
      >
        <motion.div
          className="absolute inset-y-0 left-0"
          style={{
            borderRadius: height,
            background: color,
            boxShadow: `1px 1px 3px ${neuTheme.colors.shadow}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs font-satoshi font-medium tabular-nums min-w-[3ch] text-right"
          style={{ color: neuTheme.colors.text.muted }}
        >
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}
