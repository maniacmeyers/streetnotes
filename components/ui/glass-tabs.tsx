'use client'

import React from 'react'

export interface GlassTabItem {
  id: string
  label: string
  icon?: React.ReactNode
}

interface GlassTabsProps {
  items: GlassTabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

/**
 * Glass segmented tab bar — matches the debrief/dashboard aesthetic.
 * Active tab floats on a volt-tinted glass-inset with a glow bar above.
 */
export function GlassTabs({ items, activeId, onChange, className = '' }: GlassTabsProps) {
  return (
    <div className={`glass rounded-2xl p-1.5 flex gap-1 ${className}`}>
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] font-bold transition-all duration-200 relative cursor-pointer ${
              isActive
                ? 'text-volt bg-volt/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),inset_0_-1px_0_0_rgba(0,0,0,0.4),0_0_24px_rgba(0,230,118,0.25)] border border-volt/30'
                : 'text-white/50 hover:text-white border border-transparent'
            }`}
            aria-pressed={isActive}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
