'use client'

import { HelpCircle } from 'lucide-react'
import { useTour } from '@/lib/vbrick/tour/tour-context'
import { neuTheme } from '@/lib/vbrick/theme'

export function TakeTheTourButton({ compact = false }: { compact?: boolean }) {
  const { startTour } = useTour()

  return (
    <button
      type="button"
      onClick={() => startTour()}
      aria-label="Take the tour"
      className="flex items-center gap-1.5 border-none cursor-pointer font-satoshi"
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.raisedSm,
        borderRadius: neuTheme.radii.full,
        padding: compact ? '6px 10px' : '7px 14px',
        color: neuTheme.colors.text.body,
        fontSize: compact ? 12 : 13,
        fontWeight: 500,
        transition: neuTheme.transitions.fast,
        touchAction: 'manipulation',
      }}
    >
      <HelpCircle className="w-3.5 h-3.5" />
      <span className={compact ? 'hidden sm:inline' : ''}>Take the tour</span>
    </button>
  )
}
