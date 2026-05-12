'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'motion/react'
import { Settings, ChevronLeft, TrendingUp, Mic2, ScanLine, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import VoiceNoteCapture from '@/components/voice-note-capture'
import RecentNotes from '@/components/dashboard/recent-notes'
import MicInstrument from '@/components/mic-instrument'

interface DashboardStats {
  totalNotes: number
  thisWeek: number
}

export default function DashboardClient() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const hasWorkInProgress = useRef(false)
  const captureGuardArmed = useRef(false)
  const [stats, setStats] = useState<DashboardStats>({ totalNotes: 0, thisWeek: 0 })
  const [statsError, setStatsError] = useState(false)

  useEffect(() => {
    setStatsError(false)
    fetch('/api/notes')
      .then(res => {
        if (!res.ok) throw new Error(`status ${res.status}`)
        return res.json()
      })
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
      .catch(() => setStatsError(true))
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

  useEffect(() => {
    if (!isCapturing || captureGuardArmed.current) return

    captureGuardArmed.current = true
    window.history.pushState(
      { ...(window.history.state ?? {}), fieldGlowCaptureGuard: true },
      '',
      window.location.href
    )

    const confirmCaptureExit = () => {
      if (!hasWorkInProgress.current) return true
      return window.confirm('You have an in-progress note. Leave and lose your work?')
    }

    const handlePopState = () => {
      if (confirmCaptureExit()) {
        captureGuardArmed.current = false
        exitCapture()
        return
      }

      window.history.pushState(
        { ...(window.history.state ?? {}), fieldGlowCaptureGuard: true },
        '',
        window.location.href
      )
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasWorkInProgress.current) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      captureGuardArmed.current = false
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [exitCapture, isCapturing])

  // Capture mode — full screen recording flow
  if (isCapturing) {
    return (
      <div className="fg-page flex flex-col overscroll-y-contain">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="fg-secondary-action px-4"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <Link
            href="/settings"
            className="fg-convex flex h-12 w-12 items-center justify-center"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-[#A8855A]" />
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
    <div className="fg-page flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          <span className="fg-eyebrow">Ready to debrief</span>
          <h1 className="fg-title">
            Log this visit now
          </h1>
          <p className="fg-subtitle">
            Tap the mic. Brain dump everything. Get CRM-ready fields fast.
          </p>
        </motion.div>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Mic instrument — primary CTA */}
        <motion.div
          className="fg-featured-card flex flex-col items-center p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
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

          <p className="mt-6 text-[26px] font-extrabold tracking-[-0.03em] text-[#1A1410] text-center">
            Tap to debrief
          </p>
          <p className="mt-2 text-center text-[15px] leading-6 text-[#3D332A]">
            Talk as long as you need. We turn raw thoughts into structured CRM-ready notes.
          </p>
        </motion.div>

        {/* Optimization summary */}
        <motion.div
          className="fg-card mt-5 p-[22px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <span className="fg-icon">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[21px] font-extrabold leading-tight tracking-[-0.02em] text-[#1A1410]">
                Glow Score
              </p>
              <p className="mt-1 text-[15px] leading-6 text-[#3D332A]">
                {statsError
                  ? "Couldn't load your stats."
                  : `${stats.thisWeek} scans this week, ${stats.totalNotes} total saved.`}
              </p>
            </div>
          </div>
          {statsError ? (
            <button
              type="button"
              onClick={() => setRefreshKey(k => k + 1)}
              className="fg-inset mt-5 flex w-full items-center justify-center gap-2 p-4 text-sm font-extrabold text-[#8B6B40]"
            >
              <AlertCircle className="h-4 w-4" />
              Retry
            </button>
          ) : (
            <div className="fg-inset mt-5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-[#3D332A]">Field Balance</span>
                <span className="text-sm font-extrabold text-[#8B6B40]">
                  {Math.min(100, stats.thisWeek * 18)}%
                </span>
              </div>
              <div className="fg-progress-track">
                <div
                  className="fg-progress-fill"
                  style={{ width: `${Math.min(100, stats.thisWeek * 18)}%` }}
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Result cards */}
        <motion.div
          className="mt-5 flex flex-col gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="fg-card p-[22px]">
            <span className="fg-icon mb-4">
              <ScanLine className="h-5 w-5" />
            </span>
            <p className="text-[21px] font-extrabold tracking-[-0.02em] text-[#1A1410]">
              Weekly capture
            </p>
            <p className="mt-2 text-[15px] leading-6 text-[#3D332A]">
              Recent field work converted into CRM-ready output.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-full px-4 py-3 text-sm font-bold text-[#3D332A] fg-inset">
              <span>This week</span>
              <span className="text-2xl font-extrabold text-[#A8855A] tabular-nums">
              {stats.thisWeek}
              </span>
            </div>
          </div>
          <div className="fg-card p-[22px]">
            <span className="fg-icon mb-4">
              <Mic2 className="h-5 w-5" />
            </span>
            <p className="text-[21px] font-extrabold tracking-[-0.02em] text-[#1A1410]">
              Saved results
            </p>
            <p className="mt-2 text-[15px] leading-6 text-[#3D332A]">
              Every saved note stays ready for review, export, or CRM push.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-full px-4 py-3 text-sm font-bold text-[#3D332A] fg-inset">
              <span>Total notes</span>
              <span className="text-2xl font-extrabold text-[#A8855A] tabular-nums">
              {stats.totalNotes}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Notes */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="mb-3 text-[16px] font-extrabold text-[#1A1410]">
            Recent Notes
          </h2>
          <RecentNotes refreshKey={refreshKey} />
        </motion.div>
      </div>
    </div>
  )
}
