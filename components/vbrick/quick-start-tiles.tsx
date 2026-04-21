'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Dumbbell, BookOpen, Megaphone, ScrollText, type LucideIcon } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'

interface Tile {
  label: string
  descriptor: string
  href: string
  icon: LucideIcon
}

const TILES: Tile[] = [
  { label: 'Sparring', descriptor: 'Train against AI personas', href: '/vbrick/dashboard/sparring', icon: Dumbbell },
  { label: 'Stories',  descriptor: 'Draft and practice pitches', href: '/vbrick/dashboard/stories',  icon: BookOpen },
  { label: 'Campaigns',descriptor: 'Study outbound plays',      href: '/vbrick/dashboard/campaigns', icon: Megaphone },
  { label: 'Playbook', descriptor: 'Framework and references',  href: '/vbrick/dashboard/playbook',  icon: ScrollText },
]

export function QuickStartTiles() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {TILES.map((tile, i) => {
        const Icon = tile.icon
        return (
          <motion.div
            key={tile.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 * i }}
          >
            <Link
              href={tile.href}
              className="block no-underline"
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raised,
                borderRadius: neuTheme.radii.lg,
                padding: '20px',
                transition: neuTheme.transitions.default,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: neuTheme.radii.sm,
                    background: neuTheme.colors.accent.primary,
                    boxShadow: neuTheme.shadows.raisedSm,
                  }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3
                  className="font-general-sans font-semibold text-base tracking-tight"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  {tile.label}
                </h3>
              </div>
              <p
                className="text-xs font-satoshi"
                style={{ color: neuTheme.colors.text.muted }}
              >
                {tile.descriptor}
              </p>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
