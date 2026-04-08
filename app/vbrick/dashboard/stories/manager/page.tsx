'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { NeuCard } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { ManagerDashboard } from '@/components/vbrick/stories/manager-dashboard'

export default function ManagerPage() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmail(stored)
  }, [])

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: neuTheme.colors.bg }}>
        <NeuCard className="max-w-sm w-full text-center">
          <p className="font-satoshi text-sm mb-4" style={{ color: neuTheme.colors.text.body }}>
            Enter your email to access the Manager Dashboard
          </p>
          <input
            type="email"
            className="w-full p-3 rounded-xl text-sm font-satoshi outline-none"
            style={{ background: neuTheme.colors.bg, boxShadow: neuTheme.shadows.inset, color: neuTheme.colors.text.body }}
            placeholder="you@company.com"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim()
                if (val) {
                  localStorage.setItem('vbrick_email', val)
                  setEmail(val)
                }
              }
            }}
          />
        </NeuCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: neuTheme.colors.bg }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-general-sans font-bold" style={{ color: neuTheme.colors.text.heading }}>
            Manager Dashboard
          </h1>
          <a
            href="/vbrick/dashboard/stories"
            className="flex items-center gap-2 font-satoshi text-sm"
            style={{ color: neuTheme.colors.text.muted }}
          >
            <ArrowLeft size={16} /> Story Vault
          </a>
        </div>

        <ManagerDashboard email={email} />
      </div>
    </div>
  )
}
