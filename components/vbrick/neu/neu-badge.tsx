'use client'

import { neuTheme } from '@/lib/vbrick/theme'

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger'

interface NeuBadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: neuTheme.colors.bg, text: neuTheme.colors.text.body },
  accent: { bg: neuTheme.colors.accent.primary, text: '#ffffff' },
  success: { bg: neuTheme.colors.status.success, text: '#ffffff' },
  warning: { bg: neuTheme.colors.status.warning, text: '#ffffff' },
  danger: { bg: neuTheme.colors.status.danger, text: '#ffffff' },
}

export function NeuBadge({ children, variant = 'default', size = 'sm', className = '' }: NeuBadgeProps) {
  const colors = variantColors[variant]
  const isDefault = variant === 'default'
  const padding = size === 'sm' ? 'px-2.5 py-0.5' : 'px-3 py-1'
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs'

  return (
    <span
      className={`inline-flex items-center font-satoshi font-medium ${padding} ${textSize} ${className}`}
      style={{
        background: colors.bg,
        color: colors.text,
        borderRadius: neuTheme.radii.full,
        boxShadow: isDefault ? neuTheme.shadows.raisedSm : 'none',
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </span>
  )
}
