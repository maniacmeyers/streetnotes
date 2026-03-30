'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { NeuBadge } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { type ServiceNowCategory, SN_CATEGORY_LABELS } from '@/lib/ci/types'

interface IntelToastProps {
  message: string
  category: ServiceNowCategory
  visible: boolean
  onDismiss: () => void
}

const CATEGORY_VARIANT: Record<ServiceNowCategory, 'success' | 'danger' | 'accent' | 'warning' | 'default'> = {
  servicenow_adoption: 'success',
  servicenow_pain: 'danger',
  servicenow_expansion: 'accent',
  servicenow_competitor: 'warning',
  integration_opportunity: 'accent',
  general_competitor: 'default',
}

export function IntelToast({ message, category, visible, onDismiss }: IntelToastProps) {
  const dismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(dismiss, 4000)
    return () => clearTimeout(timer)
  }, [visible, dismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 left-1/2 z-50 cursor-pointer"
          style={{ transform: 'translateX(-50%)' }}
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={dismiss}
        >
          <div
            className="flex items-center gap-3 px-5 py-3 max-w-sm"
            style={{
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.raisedHover,
              borderRadius: neuTheme.radii.xl,
            }}
          >
            <NeuBadge variant={CATEGORY_VARIANT[category]} size="sm">
              {SN_CATEGORY_LABELS[category]}
            </NeuBadge>

            <span
              className="font-satoshi text-sm flex-1"
              style={{ color: neuTheme.colors.text.body }}
            >
              {message}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation()
                dismiss()
              }}
              className="flex-shrink-0 outline-none"
              aria-label="Dismiss"
            >
              <X size={14} style={{ color: neuTheme.colors.text.subtle }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
