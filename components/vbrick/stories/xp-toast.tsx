'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'

interface XPToastProps {
  xp: number
  visible: boolean
  onDone: () => void
}

export function XPToast({ xp, visible, onDone }: XPToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDone, 2500)
    return () => clearTimeout(timer)
  }, [visible, onDone])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-8 left-1/2 z-50 flex items-center gap-2 px-5 py-3 pointer-events-none"
          style={{
            background: neuTheme.colors.accent.primary,
            borderRadius: neuTheme.radii.full,
            boxShadow: `0 8px 24px ${neuTheme.colors.accent.primary}50`,
          }}
          initial={{ opacity: 0, y: 40, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Sparkles size={18} className="text-white" />
          <span className="font-general-sans font-bold text-white text-base tabular-nums">
            +{xp} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
