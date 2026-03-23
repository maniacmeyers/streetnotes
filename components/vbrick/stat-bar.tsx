'use client'

import { motion } from 'motion/react'

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
  if (ratio <= 0.3) return 'text-red-500'
  if (ratio <= 0.6) return 'text-amber-500'
  if (ratio <= 0.8) return 'text-[#7ed4f7]'
  return 'text-green-500'
}

function getFillStyle(
  value: number,
  ghostValue: number | undefined
): { bg: string; shadow: string } {
  if (ghostValue !== undefined && value > ghostValue) {
    return {
      bg: 'bg-[#22C55E]',
      shadow: '0 0 8px rgba(34,197,94,0.4)',
    }
  }
  return {
    bg: 'bg-[#7ed4f7]',
    shadow: '0 0 8px rgba(126,212,247,0.4)',
  }
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
  const fill = getFillStyle(value, ghostValue)
  const nearPb =
    personalBest !== undefined && value >= personalBest * 0.9

  return (
    <div className="space-y-1.5">
      {/* Label row */}
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-inter">
          {label}
        </span>
        <span
          className={`font-fira-code font-bold ${
            size === 'prominent' ? 'text-2xl' : 'text-lg'
          } ${getValueColor(value, max)}`}
        >
          {value}
        </span>
      </div>

      {/* Bar track */}
      <div
        className={`relative w-full rounded-full bg-white/10 overflow-hidden ${
          size === 'prominent' ? 'h-3' : 'h-2'
        }`}
      >
        {/* Ghost bar */}
        {ghostValue !== undefined && ghostPct > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/[0.06]"
            style={{ width: `${ghostPct}%` }}
          />
        )}

        {/* Fill bar */}
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${fill.bg}`}
          style={{ boxShadow: fill.shadow }}
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
              className={`w-2 h-2 rounded-full bg-[#22C55E] ${
                nearPb ? 'animate-pulse' : ''
              }`}
            />
          </div>
        )}
      </div>

      {/* Detail text */}
      {detail && (
        <p className="text-xs text-gray-500 font-fira-code mt-1">{detail}</p>
      )}
    </div>
  )
}
