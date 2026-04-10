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
          className="fixed bottom-24 left-1/2 z-50 flex items-center gap-2 px-5 py-3 pointer-events-none bg-volt border-4 border-black shadow-neo"
          initial={{ opacity: 0, y: 40, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <Sparkles size={18} className="text-black" />
          <span className="font-display text-black text-xl tabular-nums leading-none">
            +{xp} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
