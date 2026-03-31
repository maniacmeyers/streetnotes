'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'

interface PlaybookAccordionProps {
  title: string
  subtitle: string
  icon?: React.ReactNode
  children: React.ReactNode
}

export function PlaybookAccordion({ title, subtitle, icon, children }: PlaybookAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.raised,
        borderRadius: neuTheme.radii.xl,
        overflow: 'hidden',
        transition: neuTheme.transitions.default,
      }}
      whileHover={!isOpen ? { y: -2, boxShadow: neuTheme.shadows.raisedHover } : undefined}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-6 outline-none text-left cursor-pointer bg-transparent border-none"
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
        <div className="flex-1 min-w-0">
          <span
            className="block font-general-sans font-semibold text-base"
            style={{ color: neuTheme.colors.text.heading }}
          >
            {title}
          </span>
          <span
            className="block font-satoshi text-xs mt-0.5"
            style={{ color: neuTheme.colors.text.muted }}
          >
            {subtitle}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0"
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
          <div
            className="px-6 pb-6"
            style={{ borderTop: `1px solid ${neuTheme.colors.shadow}25` }}
          >
            <div className="pt-5">{children}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
