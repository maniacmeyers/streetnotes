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
 * Warm segmented tab bar for the Field Glow mobile app.
 */
export function GlassTabs({ items, activeId, onChange, className = '' }: GlassTabsProps) {
  return (
    <div className={`fg-card-sm flex gap-1 rounded-[24px] p-1.5 ${className}`}>
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`relative flex min-h-[48px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-3 py-2.5 text-[12px] font-extrabold transition-all duration-300 ${
              isActive
                ? 'bg-[#A8855A] text-[#FAF6EE] shadow-[0_10px_18px_rgba(168,133,90,0.28)]'
                : 'text-[#3D332A]'
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
