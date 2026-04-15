'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'

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
      className="glass rounded-2xl overflow-hidden"
      whileHover={!isOpen ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-5 outline-none text-left cursor-pointer bg-transparent border-none"
        aria-expanded={isOpen}
      >
        {icon && (
          <div
            className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl border border-volt/30 bg-volt/10 text-volt"
            style={{ boxShadow: '0 0 12px rgba(0,230,118,0.15)' }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <span className="block font-bold text-sm text-white">{title}</span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 mt-1">
            {subtitle}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0"
        >
          <ChevronDown size={20} className={isOpen ? 'text-volt' : 'text-white/40'} />
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
          <div className="px-5 pb-5 border-t border-white/10">
            <div className="pt-4">{children}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
