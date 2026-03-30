'use client'

import { motion, type HTMLMotionProps } from 'motion/react'
import { forwardRef } from 'react'
import { neuTheme } from '@/lib/vbrick/theme'

interface NeuCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'raised' | 'inset'
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  radius?: 'sm' | 'md' | 'lg' | 'xl'
}

const paddingMap = { sm: 'p-4', md: 'p-6', lg: 'p-8', none: '' }

export const NeuCard = forwardRef<HTMLDivElement, NeuCardProps>(
  ({ variant = 'raised', hover = true, padding = 'md', radius = 'xl', className = '', style, children, ...props }, ref) => {
    const shadow = variant === 'raised' ? neuTheme.shadows.raised : neuTheme.shadows.inset
    const borderRadius = neuTheme.radii[radius]

    return (
      <motion.div
        ref={ref}
        className={`${paddingMap[padding]} ${className}`}
        style={{
          background: neuTheme.colors.bg,
          boxShadow: shadow,
          borderRadius,
          transition: neuTheme.transitions.default,
          ...style,
        }}
        whileHover={
          hover && variant === 'raised'
            ? { y: -2, boxShadow: neuTheme.shadows.raisedHover }
            : undefined
        }
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

NeuCard.displayName = 'NeuCard'
