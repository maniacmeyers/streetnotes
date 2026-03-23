import React from 'react'

const variantClasses = {
  cyan: 'text-[#7ed4f7] bg-[#7ed4f7]/10',
  green: 'text-green-500 bg-green-500/10',
  amber: 'text-amber-500 bg-amber-500/10',
  red: 'text-red-500 bg-red-500/10',
  gray: 'text-gray-400 bg-gray-400/10',
} as const

interface BadgeProps {
  variant: keyof typeof variantClasses
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-[0.05em] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

// ---

type Disposition = 'connected' | 'voicemail' | 'no-answer' | 'gatekeeper'

const dispositionColors: Record<Disposition, string> = {
  connected: 'bg-[#7ed4f7]',
  voicemail: 'bg-amber-500',
  'no-answer': 'bg-gray-400',
  gatekeeper: 'bg-blue-500',
}

interface DispositionDotProps {
  disposition: Disposition
  className?: string
}

export function DispositionDot({ disposition, className = '' }: DispositionDotProps) {
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full inline-block ${dispositionColors[disposition]} ${className}`}
    />
  )
}
