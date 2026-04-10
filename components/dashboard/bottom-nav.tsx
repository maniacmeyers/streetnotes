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
      className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t-4 border-volt pb-safe"
      aria-label="Main navigation"
    >
      <div className="max-w-md mx-auto flex items-stretch justify-around h-16">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] px-2 font-mono text-[10px] uppercase tracking-widest font-bold transition-colors duration-150 ${
                isActive ? 'text-volt bg-volt/10' : 'text-gray-500 hover:text-white'
              } ${i < navItems.length - 1 ? 'border-r-2 border-black/80' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
