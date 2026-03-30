'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'

interface NeuAccordionProps {
  title: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
}

export function NeuAccordion({ title, icon, defaultOpen = false, children, className = '' }: NeuAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div
      className={className}
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.raised,
        borderRadius: neuTheme.radii.xl,
        overflow: 'hidden',
        transition: neuTheme.transitions.default,
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-6 outline-none text-left"
        aria-expanded={isOpen}
      >
        {icon && (
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 48,
              height: 48,
              borderRadius: neuTheme.radii.md,
              boxShadow: neuTheme.shadows.insetSm,
              color: neuTheme.colors.accent.primary,
            }}
          >
            {icon}
          </div>
        )}
        <span
          className="flex-1 font-general-sans font-semibold text-base"
          style={{ color: neuTheme.colors.text.heading }}
        >
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown size={20} style={{ color: neuTheme.colors.text.muted }} />
        </motion.div>
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
