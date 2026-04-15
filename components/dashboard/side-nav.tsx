'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mic, BookOpen, Radar, ScrollText, Settings } from 'lucide-react'
import Logo from '@/components/brand/logo'

const navItems = [
  { label: 'Home', href: '/dashboard', icon: Mic },
  { label: 'Stories', href: '/stories', icon: BookOpen },
  { label: 'Playbook', href: '/playbook', icon: ScrollText },
  { label: 'Intel', href: '/intel', icon: Radar },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function SideNav({ email }: { email?: string | null }) {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-volt/15 bg-[#050f1e]/85 backdrop-blur-xl"
      aria-label="Main navigation"
    >
      <div className="px-6 pt-8 pb-10">
        <Logo size="sm" href="/dashboard" priority />
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.15em] font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-volt/10 text-volt'
                      : 'text-white/55 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[2px] rounded-full bg-volt"
                      style={{ boxShadow: '0 0 8px rgba(0, 230, 118, 0.8)' }}
                    />
                  )}
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'drop-shadow-[0_0_6px_rgba(0,230,118,0.6)]' : ''
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {email && (
        <div className="border-t border-white/5 px-6 py-4">
          <span className="block truncate font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            {email.split('@')[0]}
          </span>
        </div>
      )}
    </aside>
  )
}
