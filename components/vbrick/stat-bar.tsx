'use client'

import { motion } from 'motion/react'
import { neuTheme } from '@/lib/vbrick/theme'

interface StatBarProps {
  value: number
  ghostValue?: number
  max: number
  personalBest?: number
  label: string
  detail?: string
  size?: 'normal' | 'prominent'
}

function getValueColor(value: number, max: number): string {
  const ratio = value / max
  if (ratio <= 0.3) return neuTheme.colors.score.red
  if (ratio <= 0.6) return neuTheme.colors.score.amber
  if (ratio <= 0.8) return neuTheme.colors.accent.primary
  return neuTheme.colors.score.green
}

function getBarGradient(value: number, max: number, ghostValue?: number): string {
  const ratio = value / max
  const beatingGhost = ghostValue !== undefined && value > ghostValue

  if (beatingGhost) {
    return 'linear-gradient(90deg, #22C55E, #4ADE80)'
  }
  if (ratio <= 0.3) return 'linear-gradient(90deg, #EF4444, #F87171)'
  if (ratio <= 0.6) return 'linear-gradient(90deg, #F59E0B, #FBBF24)'
  if (ratio <= 0.8) return `linear-gradient(90deg, ${neuTheme.colors.accent.primary}, ${neuTheme.colors.accent.hover})`
  return 'linear-gradient(90deg, #22C55E, #4ADE80)'
}

export function StatBar({
  value,
  ghostValue,
  max,
  personalBest,
  label,
  detail,
  size = 'normal',
}: StatBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  const ghostPct =
    ghostValue !== undefined ? Math.min((ghostValue / max) * 100, 100) : 0
  const pbPct =
    personalBest !== undefined
      ? Math.min((personalBest / max) * 100, 100)
      : undefined
  const nearPb = personalBest !== undefined && value >= personalBest * 0.9
  const gradient = getBarGradient(value, max, ghostValue)

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-baseline justify-between">
        <span
          className="text-[11px] uppercase tracking-[0.15em] font-inter"
          style={{ color: neuTheme.colors.text.muted }}
        >
          {label}
        </span>
        <span
          className={`font-fira-code font-bold ${
            size === 'prominent' ? 'text-2xl' : 'text-lg'
          }`}
          style={{ color: getValueColor(value, max) }}
        >
          {value}
        </span>
      </div>

      {/* Bar track — inset neumorphic */}
      <div
        className={`relative w-full rounded-full overflow-hidden ${
          size === 'prominent' ? 'h-3' : 'h-2'
        }`}
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.insetSm,
        }}
      >
        {/* Ghost bar */}
        {ghostValue !== undefined && ghostPct > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${ghostPct}%`,
              background: `${neuTheme.colors.shadow}30`,
            }}
          />
        )}

        {/* Fill bar — raised neumorphic */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: gradient,
            boxShadow: '1px 1px 3px #a3b1c6, -1px -1px 3px #ffffff',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Personal best marker */}
        {pbPct !== undefined && (
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${pbPct}%` }}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full border-2 ${
                nearPb ? 'animate-pulse' : ''
              }`}
              style={{
                borderColor: `${neuTheme.colors.shadow}40`,
                backgroundColor: nearPb
                  ? neuTheme.colors.accent.primary
                  : neuTheme.colors.accent.hover,
              }}
            />
          </div>
        )}
      </div>

      {/* Ghost label */}
      {ghostValue !== undefined && ghostValue > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-inter" style={{ color: neuTheme.colors.text.muted }}>
            Last week: {ghostValue}
          </span>
          {value > ghostValue && (
            <span className="text-[10px] font-fira-code font-medium" style={{ color: neuTheme.colors.score.green }}>
              +{(value - ghostValue).toFixed(1)}
            </span>
          )}
          {value < ghostValue && (
            <span className="text-[10px] font-fira-code font-medium" style={{ color: neuTheme.colors.score.red }}>
              {(value - ghostValue).toFixed(1)}
            </span>
          )}
        </div>
      )}

      {/* Detail text */}
      {detail && (
        <p className="text-[10px] font-fira-code" style={{ color: neuTheme.colors.text.muted }}>
          {detail}
        </p>
      )}
    </div>
  )
}
