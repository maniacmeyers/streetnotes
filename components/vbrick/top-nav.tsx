'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Zap,
  LayoutDashboard,
  BookOpen,
  Megaphone,
  ScrollText,
  Dumbbell,
  Settings,
  LogOut,
} from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { useDashboard } from '@/lib/vbrick/dashboard-context'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/vbrick/dashboard', icon: LayoutDashboard },
  { label: 'Stories', href: '/vbrick/dashboard/stories', icon: BookOpen },
  { label: 'Campaigns', href: '/vbrick/dashboard/campaigns', icon: Megaphone },
  { label: 'Playbook', href: '/vbrick/dashboard/playbook', icon: ScrollText },
  { label: 'Sparring', href: '/vbrick/dashboard/sparring', icon: Dumbbell },
]

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { displayName, setEmail } = useDashboard()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  function handleSignOut() {
    setEmail(null)
    setMenuOpen(false)
    router.push('/vbrick/dashboard')
  }

  const initial = displayName.charAt(0).toUpperCase() || '?'

  return (
    <header
      className="sticky top-0 z-[60] w-full font-satoshi"
      style={{
        background: neuTheme.colors.bg,
        boxShadow: `0 2px 12px ${neuTheme.colors.shadow}33`,
      }}
    >
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <Link href="/vbrick/dashboard" className="flex items-center gap-2 shrink-0 no-underline" style={{ touchAction: 'manipulation' }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: neuTheme.radii.sm,
                background: neuTheme.colors.accent.primary,
                boxShadow: neuTheme.shadows.raisedSm,
              }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="font-general-sans font-bold text-sm tracking-tight hidden sm:inline"
              style={{ color: neuTheme.colors.text.heading }}
            >
              Command Center
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm no-underline"
                  style={{
                    borderRadius: neuTheme.radii.sm,
                    boxShadow: isActive ? neuTheme.shadows.insetSm : 'none',
                    color: isActive ? neuTheme.colors.accent.primary : neuTheme.colors.text.body,
                    fontWeight: isActive ? 600 : 500,
                    transition: neuTheme.transitions.fast,
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center border-none cursor-pointer"
            aria-label="User menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: neuTheme.radii.full,
              background: neuTheme.colors.accent.primary,
              boxShadow: neuTheme.shadows.raisedSm,
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {initial}
          </button>
          {menuOpen && (
            <div
              className="absolute right-4 top-[52px] min-w-[180px] py-2 font-satoshi text-sm"
              style={{
                background: neuTheme.colors.bg,
                borderRadius: neuTheme.radii.md,
                boxShadow: neuTheme.shadows.raised,
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false)
                  router.push('/vbrick/dashboard/settings')
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 border-none bg-transparent cursor-pointer text-left"
                style={{ color: neuTheme.colors.text.body }}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2 border-none bg-transparent cursor-pointer text-left"
                style={{ color: neuTheme.colors.text.body }}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      <nav
        className="md:hidden flex items-center justify-between px-1 pb-2 pt-1"
        style={{
          borderTop: `1px solid ${neuTheme.colors.shadow}22`,
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-0.5 px-1 py-1.5 text-[11px] no-underline"
              style={{
                color: isActive ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
                fontWeight: isActive ? 600 : 500,
                touchAction: 'manipulation',
                minHeight: 44,
              }}
            >
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
