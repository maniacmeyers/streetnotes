'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { Settings, ChevronLeft, Mic } from 'lucide-react'
import Link from 'next/link'
import VoiceNoteCapture from '@/components/voice-note-capture'
import RecentNotes from '@/components/dashboard/recent-notes'
import SignOutButton from '@/components/sign-out-button'
import { neuTheme } from '@/lib/vbrick/theme'

const t = neuTheme

interface DashboardStats {
  totalNotes: number
  thisWeek: number
}

export default function DashboardClient({ userEmail }: { userEmail: string }) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const hasWorkInProgress = useRef(false)
  const [stats, setStats] = useState<DashboardStats>({ totalNotes: 0, thisWeek: 0 })

  // Fetch note stats
  useEffect(() => {
    fetch('/api/notes')
      .then(res => res.json())
      .then(data => {
        const notes = data.notes ?? []
        const now = new Date()
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        const thisWeek = notes.filter((n: { created_at: string }) =>
          new Date(n.created_at) >= weekStart
        ).length
        setStats({ totalNotes: notes.length, thisWeek })
      })
      .catch(() => {})
  }, [refreshKey])

  const exitCapture = useCallback(() => {
    setIsCapturing(false)
    setRefreshKey(k => k + 1)
    hasWorkInProgress.current = false
  }, [])

  const handleBack = useCallback(() => {
    if (hasWorkInProgress.current) {
      const confirmed = window.confirm(
        'You have an in-progress note. Leave and lose your work?'
      )
      if (!confirmed) return
    }
    exitCapture()
  }, [exitCapture])

  // Capture mode — full screen recording flow
  if (isCapturing) {
    return (
      <div
        className="min-h-[100dvh] px-4 py-6 flex flex-col"
        style={{ background: t.colors.bg }}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 font-inter text-sm font-medium min-w-[44px] min-h-[44px]"
            style={{ color: t.colors.text.muted }}
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <Link
            href="/settings"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl"
            style={{ boxShadow: t.shadows.raisedSm, background: t.colors.bg }}
          >
            <Settings className="w-5 h-5" style={{ color: t.colors.text.muted }} />
          </Link>
        </div>
        <VoiceNoteCapture
          autoStart
          onSaved={exitCapture}
          onProgress={(active) => { hasWorkInProgress.current = active }}
        />
      </div>
    )
  }

  // Dashboard home
  return (
    <div
      className="min-h-[100dvh] flex flex-col"
      style={{ background: t.colors.bg }}
    >
      {/* Header */}
      <header className="px-4 pt-safe">
        <div className="flex items-center justify-between h-16">
          <div>
            <h1
              className="font-inter font-bold text-lg tracking-tight"
              style={{ color: t.colors.text.heading }}
            >
              StreetNotes
            </h1>
            <p
              className="font-inter text-xs truncate max-w-[200px]"
              style={{ color: t.colors.text.muted }}
            >
              {userEmail}
            </p>
          </div>
          <Link
            href="/settings"
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ boxShadow: t.shadows.raisedSm, background: t.colors.bg }}
          >
            <Settings className="w-5 h-5" style={{ color: t.colors.text.muted }} />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 px-4 pb-safe">
        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 gap-3 mt-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: t.colors.bg, boxShadow: t.shadows.raisedSm }}
          >
            <p
              className="font-fira-code font-bold text-2xl"
              style={{ color: t.colors.accent.primary }}
            >
              {stats.thisWeek}
            </p>
            <p
              className="font-inter text-[11px] uppercase tracking-[0.15em] mt-1"
              style={{ color: t.colors.text.muted }}
            >
              This Week
            </p>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: t.colors.bg, boxShadow: t.shadows.raisedSm }}
          >
            <p
              className="font-fira-code font-bold text-2xl"
              style={{ color: t.colors.text.heading }}
            >
              {stats.totalNotes}
            </p>
            <p
              className="font-inter text-[11px] uppercase tracking-[0.15em] mt-1"
              style={{ color: t.colors.text.muted }}
            >
              Total Notes
            </p>
          </div>
        </motion.div>

        {/* Mic button — center, prominent */}
        <motion.div
          className="flex flex-col items-center py-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <style>{`
            @keyframes sn-mic-pulse {
              0%, 100% { box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff, 0 0 30px rgba(99,102,241,0.25); }
              50% { box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff, 0 0 50px rgba(99,102,241,0.45), 0 0 80px rgba(99,102,241,0.12); }
            }
            @media (prefers-reduced-motion: reduce) {
              .sn-mic-btn { animation: none !important; }
            }
          `}</style>

          {/* Ripple */}
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: `${t.colors.accent.primary}1A` }}
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />

            <button
              type="button"
              onClick={() => setIsCapturing(true)}
              className="sn-mic-btn w-[140px] h-[140px] rounded-full flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-150"
              style={{
                background: t.colors.bg,
                animation: 'sn-mic-pulse 1.5s ease-in-out infinite',
                boxShadow: t.shadows.raised,
              }}
              aria-label="Record new note"
            >
              <Mic className="w-11 h-11" style={{ color: t.colors.accent.primary }} />
            </button>
          </div>

          <p
            className="font-inter font-bold uppercase tracking-widest text-sm mt-4"
            style={{ color: t.colors.text.heading }}
          >
            Debrief
          </p>
          <p
            className="font-inter text-sm mt-1"
            style={{ color: t.colors.text.muted }}
          >
            Tap to record your post-call notes
          </p>
        </motion.div>

        {/* Recent Notes */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2
              className="font-inter font-bold text-[11px] uppercase tracking-[0.15em]"
              style={{ color: t.colors.text.muted }}
            >
              Recent Notes
            </h2>
          </div>
          <RecentNotes refreshKey={refreshKey} />
        </motion.div>

        {/* Sign out */}
        <div className="mt-8 mb-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
