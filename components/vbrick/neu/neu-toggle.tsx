'use client'

import { motion } from 'motion/react'
import { neuTheme } from '@/lib/vbrick/theme'

interface NeuToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function NeuToggle({ checked, onChange, label, disabled = false }: NeuToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 outline-none"
        style={{
          width: 48,
          height: 24,
          borderRadius: 34,
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.inset,
          transition: neuTheme.transitions.default,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <motion.div
          className="absolute top-1"
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            boxShadow: '2px 2px 4px #a3b1c6',
          }}
          animate={{
            left: checked ? 28 : 4,
            backgroundColor: checked ? neuTheme.colors.accent.primary : neuTheme.colors.shadow,
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />
      </button>
      {label && (
        <span className="text-sm font-satoshi" style={{ color: neuTheme.colors.text.body }}>
          {label}
        </span>
      )}
    </label>
  )
}
