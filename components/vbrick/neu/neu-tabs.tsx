'use client'

import { motion } from 'motion/react'
import { neuTheme } from '@/lib/vbrick/theme'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface NeuTabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function NeuTabs({ tabs, activeTab, onChange, className = '' }: NeuTabsProps) {
  return (
    <div
      className={`flex gap-1 p-1.5 ${className}`}
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.inset,
        borderRadius: neuTheme.radii.lg,
      }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className="relative flex items-center justify-center gap-2 flex-1 py-2.5 px-4 outline-none font-satoshi text-sm font-medium"
            style={{
              color: isActive ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
              borderRadius: neuTheme.radii.sm,
              transition: neuTheme.transitions.default,
              minHeight: '44px',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="neu-tab-indicator"
                className="absolute inset-0"
                style={{
                  background: neuTheme.colors.bg,
                  boxShadow: neuTheme.shadows.raisedSm,
                  borderRadius: neuTheme.radii.sm,
                }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
