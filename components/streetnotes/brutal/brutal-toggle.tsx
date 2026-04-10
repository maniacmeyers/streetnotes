'use client'

import React from 'react'

interface BrutalToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

/**
 * Brutalist toggle. Hard borders, square knob, volt when on.
 */
export function BrutalToggle({ checked, onChange, label, disabled = false }: BrutalToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center w-12 h-7 border-3 border-black transition-colors duration-100 ${
        checked ? 'bg-volt' : 'bg-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block w-4 h-4 bg-black border-2 border-black transition-transform duration-150 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}
