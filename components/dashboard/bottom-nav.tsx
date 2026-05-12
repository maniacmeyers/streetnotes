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
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3"
      aria-label="Main navigation"
      style={{
        background: 'linear-gradient(to top, #FAF6EE 72%, rgba(250, 246, 238, 0))',
      }}
    >
      <div className="mx-auto max-w-[430px]">
        <div
          className="fg-card-sm flex h-16 items-stretch justify-around overflow-hidden rounded-[24px]"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[11px] font-extrabold transition-all duration-300 ${
                  isActive ? 'text-[#8B6B40]' : 'text-[#3D332A]/70'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <span
                    className="absolute left-1/2 top-1.5 h-1 w-7 -translate-x-1/2 rounded-full bg-[#A8855A]"
                    style={{ boxShadow: '0 8px 16px rgba(212, 162, 138, 0.42)' }}
                    aria-hidden="true"
                  />
                )}
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
