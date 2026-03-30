'use client'

import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef } from 'react'
import { neuTheme } from '@/lib/vbrick/theme'

interface NeuButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'raised' | 'accent' | 'icon'
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

export const NeuButton = forwardRef<HTMLButtonElement, NeuButtonProps>(
  ({ variant = 'raised', size = 'md', className = '', style, children, ...props }, ref) => {
    const isIcon = variant === 'icon'
    const isAccent = variant === 'accent'

    return (
      <motion.button
        ref={ref}
        className={`
          font-general-sans font-semibold
          ${isIcon ? 'w-10 h-10 flex items-center justify-center' : sizeStyles[size]}
          ${isAccent ? 'text-white' : 'text-neu-heading'}
          ${className}
        `}
        style={{
          background: isAccent ? neuTheme.colors.accent.primary : neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
          borderRadius: isIcon ? neuTheme.radii.full : neuTheme.radii.md,
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
          transition: neuTheme.transitions.default,
          minHeight: '44px',
          ...style,
        }}
        whileHover={{ y: -2, scale: 1.02, boxShadow: neuTheme.shadows.raisedHover }}
        whileTap={{ y: 0, scale: 1, boxShadow: neuTheme.shadows.pressed }}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

NeuButton.displayName = 'NeuButton'
