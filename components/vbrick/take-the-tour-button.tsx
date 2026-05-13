'use client'

import { HelpCircle } from 'lucide-react'
import { useTour } from '@/lib/vbrick/tour/tour-context'
import { neuTheme } from '@/lib/vbrick/theme'

type Variant = 'nav' | 'hero'

export function TakeTheTourButton({ variant = 'nav' }: { variant?: Variant } = {}) {
  const { startTour } = useTour()
  const isHero = variant === 'hero'

  return (
    <button
      type="button"
      onClick={() => startTour()}
      aria-label="Take the tour"
      className="inline-flex items-center gap-1.5 border-none cursor-pointer font-satoshi shrink-0"
      style={{
        background: isHero ? neuTheme.colors.accent.primary : neuTheme.colors.bg,
        color: isHero ? '#ffffff' : neuTheme.colors.text.body,
        boxShadow: isHero ? neuTheme.shadows.raisedSm : neuTheme.shadows.raisedSm,
        borderRadius: neuTheme.radii.full,
        padding: isHero ? '8px 14px' : '6px 12px',
        fontSize: isHero ? 13 : 12,
        fontWeight: 600,
        transition: neuTheme.transitions.fast,
        touchAction: 'manipulation',
        minHeight: 32,
      }}
    >
      <HelpCircle className="w-3.5 h-3.5" />
      <span>Take the tour</span>
    </button>
  )
}
