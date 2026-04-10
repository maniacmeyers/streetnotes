'use client'

import React from 'react'

export interface BrutalTabItem {
  id: string
  label: string
  icon?: React.ReactNode
}

interface BrutalTabsProps {
  items: BrutalTabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

/**
 * Brutalist segmented tab bar. Active = volt bg + black text.
 * Inactive = transparent, mono label, hover underline in volt.
 */
export function BrutalTabs({ items, activeId, onChange, className = '' }: BrutalTabsProps) {
  return (
    <div className={`flex border-4 border-black bg-black ${className}`}>
      {items.map((item, i) => {
        const isActive = item.id === activeId
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 min-h-[48px] font-mono text-[11px] sm:text-xs uppercase tracking-widest font-bold transition-colors duration-100 ${
              isActive ? 'bg-volt text-black' : 'bg-black text-gray-400 hover:text-volt'
            } ${i < items.length - 1 ? 'border-r-4 border-black' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
