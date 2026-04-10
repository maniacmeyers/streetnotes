'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles } from 'lucide-react'

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
          className="fixed bottom-24 left-1/2 z-50 flex items-center gap-2 px-5 py-3 pointer-events-none rounded-xl border border-volt/50 bg-volt/15 backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.55),inset_0_1px_0_rgba(255,255,255,0.22),0_0_40px_rgba(0,230,118,0.35)]"
          initial={{ opacity: 0, y: 40, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Sparkles size={18} className="text-volt drop-shadow-[0_0_6px_rgba(0,230,118,0.6)]" />
          <span className="font-display text-volt text-xl tabular-nums leading-none drop-shadow-[0_0_8px_rgba(0,230,118,0.5)]">
            +{xp} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
