'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { neuTheme } from '@/lib/vbrick/theme'

interface GlassCardProps {
  className?: string
  children: React.ReactNode
  title?: string
}

function CardTitle({ title }: { title: string }) {
  return (
    <>
      <span
        className="text-[11px] uppercase tracking-[0.2em] font-medium mb-3 block font-general-sans"
        style={{ color: neuTheme.colors.accent.primary }}
      >
        {title}
      </span>
      <div
        className="h-px mb-4"
        style={{
          background: `linear-gradient(90deg, transparent, ${neuTheme.colors.accent.muted}40, transparent)`,
        }}
      />
    </>
  )
}

export function GlassCard({ className, children, title }: GlassCardProps) {
  return (
    <motion.div
      className={cn('rounded-xl p-4 sm:p-6', className)}
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.raised,
        borderRadius: neuTheme.radii.md,
      }}
      whileHover={{
        y: -2,
        boxShadow: neuTheme.shadows.raisedHover,
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {title && <CardTitle title={title} />}
      {children}
    </motion.div>
  )
}

export function GlassCardElevated({
  className,
  children,
  title,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn('rounded-xl p-4 sm:p-6', className)}
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.raisedHover,
        borderRadius: neuTheme.radii.lg,
      }}
      whileHover={{
        y: -3,
        boxShadow: '10px 10px 20px #a3b1c6, -10px -10px 20px #ffffff',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {title && <CardTitle title={title} />}
      {children}
    </motion.div>
  )
}
