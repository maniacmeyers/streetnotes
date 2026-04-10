'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { Settings, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import VoiceNoteCapture from '@/components/voice-note-capture'
import RecentNotes from '@/components/dashboard/recent-notes'
import SignOutButton from '@/components/sign-out-button'
import MicInstrument from '@/components/mic-instrument'

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
      <div className="px-4 py-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-volt min-w-[44px] min-h-[44px] cursor-pointer transition-colors"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <Link
            href="/settings"
            className="w-11 h-11 flex items-center justify-center rounded-xl glass cursor-pointer"
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
    <div className="flex flex-col">
      {/* Greeting */}
      <div className="px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80">
            Welcome back
          </p>
          <h1 className="font-bold text-2xl text-white leading-tight mt-1">
            Ready to <span className="text-volt drop-shadow-[0_0_16px_rgba(0,230,118,0.4)]">debrief</span>?
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 truncate max-w-[280px] mt-1.5">
            {userEmail}
          </p>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4">
        {/* Stats row — glass tiles */}
        <motion.div
          className="grid grid-cols-2 gap-3 mt-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="glass-volt rounded-2xl p-5 text-center">
            <p className="font-bold text-4xl text-white leading-none tabular-nums drop-shadow-[0_0_12px_rgba(0,230,118,0.3)]">
              {stats.thisWeek}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold mt-2 text-volt/80">
              This Week
            </p>
          </div>
          <div className="glass rounded-2xl p-5 text-center">
            <p className="font-bold text-4xl text-white leading-none tabular-nums">
              {stats.totalNotes}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold mt-2 text-white/50">
              Total Notes
            </p>
          </div>
        </motion.div>

        {/* Mic instrument — the centerpiece */}
        <motion.div
          className="flex flex-col items-center py-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <MicInstrument
            isRecording={false}
            disabled={false}
            canStop={false}
            durationSec={0}
            maxDurationSec={300}
            analyserNode={null}
            onStart={() => setIsCapturing(true)}
            onStop={() => {}}
            idleLabel="Tap to debrief"
          />

          <p className="font-bold text-2xl text-white mt-6 leading-none">
            Debrief
          </p>
          <p className="font-body text-sm text-white/50 mt-2">
            Talk for 60 seconds after your call
          </p>
        </motion.div>

        {/* Recent Notes */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt/80">
              Recent Notes
            </h2>
            <Link
              href="/settings"
              className="font-mono text-[10px] uppercase tracking-widest text-white/40 hover:text-volt transition-colors"
            >
              Settings →
            </Link>
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
