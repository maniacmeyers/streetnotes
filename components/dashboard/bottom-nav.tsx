'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mic, BookOpen, Radar, Settings } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'

const t = neuTheme

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
      className="fixed bottom-0 left-0 right-0 z-50 border-t pb-safe"
      style={{
        background: t.colors.bg,
        borderColor: t.colors.shadow,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
      }}
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[44px] px-2 transition-colors duration-150"
            >
              <Icon
                className="w-5 h-5"
                style={{
                  color: isActive ? t.colors.accent.primary : t.colors.text.subtle,
                }}
              />
              <span
                className="font-inter text-[10px] font-bold uppercase tracking-wider"
                style={{
                  color: isActive ? t.colors.accent.primary : t.colors.text.subtle,
                }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
