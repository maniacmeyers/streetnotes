'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  className?: string
  children: React.ReactNode
  title?: string
}

function CardTitle({ title }: { title: string }) {
  return (
    <>
      <span className="text-[11px] uppercase tracking-[0.2em] text-[#7ed4f7] font-medium mb-3 block">
        {title}
      </span>
      <div
        className="h-px mb-4"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(126,212,247,0.2), transparent)',
        }}
      />
    </>
  )
}

export function GlassCard({ className, children, title }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-xl border border-white/[0.08] bg-white/[0.03] p-6',
        className
      )}
      style={{
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
      }}
      whileHover={{
        y: -2,
        borderColor: 'rgba(126,212,247,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
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
      className={cn(
        'rounded-xl border border-white/[0.12] bg-white/[0.06] p-6',
        className
      )}
      style={{
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      }}
      whileHover={{
        y: -3,
        borderColor: 'rgba(126,212,247,0.25)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {title && <CardTitle title={title} />}
      {children}
    </motion.div>
  )
}
