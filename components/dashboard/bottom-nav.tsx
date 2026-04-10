'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mic, BookOpen, Radar, Settings } from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/dashboard', icon: Mic },
  { label: 'Stories', href: '/stories', icon: BookOpen },
  { label: 'Intel', href: '/intel', icon: Radar },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 pb-safe"
      aria-label="Main navigation"
      style={{
        background: 'linear-gradient(180deg, rgba(6, 18, 34, 0) 0%, rgba(6, 18, 34, 0.95) 40%, rgba(6, 18, 34, 1) 100%)',
      }}
    >
      <div className="max-w-md mx-auto px-3 pb-2 pt-3">
        <div
          className="glass rounded-2xl flex items-stretch justify-around h-16 overflow-hidden"
          style={{
            boxShadow:
              'inset 0 1px 0 0 rgba(255,255,255,0.18), 0 -4px 30px -10px rgba(0, 230, 118, 0.15), 0 10px 40px -10px rgba(0, 0, 0, 0.8)',
          }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] px-2 font-mono text-[9px] uppercase tracking-[0.15em] font-bold transition-all duration-200 relative ${
                  isActive ? 'text-volt' : 'text-white/50 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-volt"
                    style={{ boxShadow: '0 0 8px rgba(0, 230, 118, 0.8)' }}
                    aria-hidden="true"
                  />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_6px_rgba(0,230,118,0.6)]' : ''}`} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
