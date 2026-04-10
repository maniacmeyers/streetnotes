'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { Settings, ChevronLeft, Mic } from 'lucide-react'
import Link from 'next/link'
import VoiceNoteCapture from '@/components/voice-note-capture'
import RecentNotes from '@/components/dashboard/recent-notes'
import SignOutButton from '@/components/sign-out-button'
import ElectricBorder from '@/components/electric-border'
import { BrutalCard } from '@/components/streetnotes/brutal'

interface DashboardStats {
  totalNotes: number
  thisWeek: number
}

export default function DashboardClient({ userEmail }: { userEmail: string }) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const hasWorkInProgress = useRef(false)
  const [stats, setStats] = useState<DashboardStats>({ totalNotes: 0, thisWeek: 0 })

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
      <div className="min-h-[100dvh] bg-dark text-white px-4 py-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-volt min-w-[44px] min-h-[44px]"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <Link
            href="/settings"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-black border-4 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-transform duration-100"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-volt" />
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
    <div className="min-h-[100dvh] bg-dark text-white flex flex-col">
      {/* Header */}
      <header className="px-4 pt-safe border-b-4 border-black/60">
        <div className="flex items-center justify-between h-20">
          <div className="min-w-0">
            <h1
              className="font-display uppercase text-2xl text-white leading-[0.85]"
              style={{ textShadow: '2px 2px 0px #000000' }}
            >
              Street<span className="text-volt">Notes</span>
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 truncate max-w-[220px] mt-1">
              {userEmail}
            </p>
          </div>
          <Link
            href="/settings"
            className="w-11 h-11 flex items-center justify-center bg-black border-4 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-transform duration-100"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-volt" />
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 px-4">
        {/* Stats row */}
        <motion.div
          className="grid grid-cols-2 gap-3 mt-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <BrutalCard variant="volt" padded={false} className="p-4 text-center">
            <p className="font-display text-4xl text-black leading-none">
              {stats.thisWeek}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold mt-2 text-black">
              This Week
            </p>
          </BrutalCard>
          <BrutalCard variant="white" padded={false} className="p-4 text-center">
            <p className="font-display text-4xl text-black leading-none">
              {stats.totalNotes}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold mt-2 text-black">
              Total Notes
            </p>
          </BrutalCard>
        </motion.div>

        {/* Mic button — center, prominent, electric-border wrapped */}
        <motion.div
          className="flex flex-col items-center py-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="relative">
            <ElectricBorder color="#00E676" speed={1} chaos={0.3} borderRadius={0}>
              <button
                type="button"
                onClick={() => setIsCapturing(true)}
                className="w-[160px] h-[160px] flex items-center justify-center bg-black border-4 border-black cursor-pointer hover:bg-dark active:bg-dark transition-colors duration-100"
                aria-label="Record new note"
              >
                <Mic className="w-14 h-14 text-volt" />
              </button>
            </ElectricBorder>
          </div>

          <p
            className="font-display uppercase text-3xl text-white mt-5 leading-none"
            style={{ textShadow: '2px 2px 0px #000000' }}
          >
            Debrief
          </p>
          <p className="font-body italic text-sm text-gray-300 mt-2">
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
            <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold text-gray-400">
              Recent Notes
            </h2>
          </div>
          <RecentNotes refreshKey={refreshKey} />
        </motion.div>

        {/* Sign out */}
        <div className="mt-8 mb-6 flex justify-start">
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
