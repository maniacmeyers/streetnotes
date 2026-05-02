'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Dumbbell, BookOpen, Megaphone, ScrollText, Mic, type LucideIcon } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'

interface Tile {
  label: string
  descriptor: string
  href?: string
  onClick?: () => void
  icon: LucideIcon
}

interface QuickStartTilesProps {
  onDebrief?: () => void
}

export function QuickStartTiles({ onDebrief }: QuickStartTilesProps = {}) {
  const tiles: Tile[] = [
    { label: 'Debrief',  descriptor: 'Brain dump after a call', onClick: onDebrief, icon: Mic },
    { label: 'Sparring', descriptor: 'Train against AI personas', href: '/vbrick/dashboard/sparring', icon: Dumbbell },
    { label: 'Stories',  descriptor: 'Draft and practice pitches', href: '/vbrick/dashboard/stories',  icon: BookOpen },
    { label: 'Campaigns',descriptor: 'Study outbound plays',      href: '/vbrick/dashboard/campaigns', icon: Megaphone },
    { label: 'Playbook', descriptor: 'Framework and references',  href: '/vbrick/dashboard/playbook',  icon: ScrollText },
  ]

  const tileStyle = {
    background: neuTheme.colors.bg,
    boxShadow: neuTheme.shadows.raisedSm,
    borderRadius: neuTheme.radii.lg,
    transition: neuTheme.transitions.default,
    touchAction: 'manipulation',
  } as const

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {tiles.map((tile, i) => {
        const Icon = tile.icon
        const inner = (
          <>
            <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: neuTheme.radii.sm,
                  background: neuTheme.colors.accent.primary,
                  boxShadow: neuTheme.shadows.raisedSm,
                }}
              >
                <Icon className="w-[18px] h-[18px] text-white" />
              </div>
              <h3
                className="font-general-sans font-semibold text-sm sm:text-base tracking-tight"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {tile.label}
              </h3>
            </div>
            <p
              className="text-[11px] sm:text-xs font-satoshi leading-snug"
              style={{ color: neuTheme.colors.text.muted }}
            >
              {tile.descriptor}
            </p>
          </>
        )

        return (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i }}
          >
            {tile.href ? (
              <Link
                href={tile.href}
                className="block no-underline p-4 sm:p-5"
                style={tileStyle}
              >
                {inner}
              </Link>
            ) : (
              <button
                type="button"
                onClick={tile.onClick}
                className="block no-underline w-full text-left p-4 sm:p-5"
                style={{ ...tileStyle, border: 'none', cursor: 'pointer' }}
              >
                {inner}
              </button>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
