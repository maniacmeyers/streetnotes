'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { IntentionScreen } from '@/components/vbrick/intention-screen'
import { Leaderboard } from '@/components/vbrick/leaderboard'
import { PerformanceCards } from '@/components/vbrick/performance-cards'
import { RecentCalls, type RecentCall } from '@/components/vbrick/recent-calls'
import { DashboardDebriefFlow } from '@/components/vbrick/dashboard-debrief-flow'
import { TranscriptInput } from '@/components/vbrick/transcript-input'
import { QuickStartTiles } from '@/components/vbrick/quick-start-tiles'
import type { DebriefOutput, CallDisposition, ProspectStatus } from '@/lib/debrief/types'
import { isBDROutput, isVbrickBDROutput } from '@/lib/debrief/types'
import { isVbrickBdr, VBRICK_CONFIG } from '@/lib/vbrick/config'
import { neuTheme } from '@/lib/vbrick/theme'

interface StatsData {
  thisWeek: {
    totalCalls: number
    connectedCalls: number
    appointmentsBooked: number
    callToConversationRate: number
    conversationToAppointmentRate: number
    averageSpin: number
    bestSpin: number
    bestSpinContact: string
  }
  lastWeek: {
    totalCalls: number
    connectedCalls: number
    appointmentsBooked: number
    callToConversationRate: number
    conversationToAppointmentRate: number
    averageSpin: number
    bestSpin: number
  }
  personalBests: {
    bestSpin: number
    bestConvRate: number
    bestApptRate: number
  }
  streak: number
  todayCalls: number
  allBdrs: Array<{
    email: string
    name: string
    callToConversationRate: number
    conversationToAppointmentRate: number
    averageSpin: number
    convTrend: number
    apptTrend: number
    spinTrend: number
    practiceThisWeek: {
      elevatorPitch: number
      objectionHandling: number
      customerStory: number
      total: number
    }
    elevatorTrend: number
    objectionTrend: number
    customerTrend: number
  }>
}

type DashboardView = 'dashboard' | 'debrief' | 'transcript'

export default function VbrickDashboardPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [showIntention, setShowIntention] = useState(false)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [view, setView] = useState<DashboardView>('dashboard')
  const [isRecording, setIsRecording] = useState(false)
  const [pastedTranscript, setPastedTranscript] = useState<string | null>(null)
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmail(stored)
  }, [])

  useEffect(() => {
    if (!email) return
    const today = new Date().toISOString().split('T')[0]
    const intentionKey = `vbrick_intention_${today}`
    if (!localStorage.getItem(intentionKey)) setShowIntention(true)
    fetchStats()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  async function fetchStats() {
    if (!email) return
    try {
      const res = await fetch(`/api/vbrick/stats?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (res.ok) setStats(data)
    } catch {}
  }

  function handleIntentionComplete() {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`vbrick_intention_${today}`, '1')
    setShowIntention(false)
  }

  const handleDebriefComplete = useCallback(async (debriefSessionId: string, output: DebriefOutput) => {
    if (email) {
      await fetch('/api/vbrick/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    }
    if (isBDROutput(output)) {
      const spinScore = isVbrickBDROutput(output) ? output.spin.composite : undefined
      const newCall: RecentCall = {
        id: debriefSessionId,
        contactName: output.contactSnapshot.name || 'Unknown',
        company: output.contactSnapshot.company || 'Unknown',
        disposition: output.callDisposition as CallDisposition,
        prospectStatus: output.prospectStatus as ProspectStatus,
        spinScore,
        timestamp: new Date().toISOString(),
        debriefSessionId,
      }
      setRecentCalls(prev => [newCall, ...prev].slice(0, 10))
    }
    await fetchStats()
    setView('dashboard')
    setIsRecording(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = emailInput.trim().toLowerCase()
    if (!clean) return
    localStorage.setItem('vbrick_email', clean)
    setEmail(clean)
  }

  if (!email) {
    return (
      <div style={{ background: '#e0e5ec', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          className="font-satoshi"
          style={{
            background: '#e0e5ec',
            boxShadow: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
            borderRadius: '28px',
            padding: '32px',
            width: '100%',
            maxWidth: '384px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ background: '#6366f1', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width={16} height={16} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-general-sans), sans-serif', fontWeight: 700, fontSize: 18, color: '#2d3436', letterSpacing: '-0.01em' }}>
              Command Center
            </span>
          </div>
          <p style={{ fontSize: 12, textAlign: 'center', marginBottom: 32, color: '#636e72', fontFamily: 'var(--font-satoshi), sans-serif' }}>
            Powered by StreetNotes.ai
          </p>
          <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                background: '#e0e5ec',
                boxShadow: 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
                color: '#44475a',
                border: 'none',
                borderRadius: 16,
                padding: '14px 20px',
                fontSize: 14,
                fontFamily: 'var(--font-satoshi), sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: 16,
                fontFamily: 'var(--font-general-sans), sans-serif',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                color: 'white',
                background: '#6366f1',
                boxShadow: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
                border: 'none',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (showIntention) {
    return <IntentionScreen email={email} onComplete={handleIntentionComplete} />
  }

  const localPart = email.split('@')[0]
  const firstName = localPart.split('.')[0]
  const fallbackName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
  const displayName = VBRICK_CONFIG.bdrDisplayNames[email] || fallbackName
  const userIsBdr = isVbrickBdr(email)

  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 relative z-10">
          {view === 'debrief' && !pastedTranscript && (
            <DashboardDebriefFlow
              email={email}
              queueContact={null}
              onComplete={handleDebriefComplete}
              onCancel={() => { setView('dashboard'); setIsRecording(false) }}
              isRecording={isRecording}
              onRecordingStart={() => setIsRecording(true)}
            />
          )}

          {view === 'transcript' && (
            <TranscriptInput
              onSubmit={(text) => {
                setPastedTranscript(text)
                setView('debrief')
              }}
              onCancel={() => setView('dashboard')}
            />
          )}

          {view === 'debrief' && pastedTranscript && (
            <DashboardDebriefFlow
              email={email}
              queueContact={null}
              onComplete={(sid, output) => {
                setPastedTranscript(null)
                handleDebriefComplete(sid, output)
              }}
              onCancel={() => { setView('dashboard'); setPastedTranscript(null) }}
              isRecording={false}
              onRecordingStart={() => {}}
              pastedTranscript={pastedTranscript}
            />
          )}

          {view === 'dashboard' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <h1
                  className="font-general-sans font-bold text-2xl tracking-tight"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  Welcome back, {displayName}
                </h1>
                {stats && (
                  <p
                    className="text-sm font-satoshi mt-1"
                    style={{ color: neuTheme.colors.text.muted }}
                  >
                    {stats.streak}-day streak
                  </p>
                )}
              </motion.div>

              <QuickStartTiles onDebrief={() => setView('debrief')} />

              {stats && userIsBdr && (
                <PerformanceCards
                  playerName={displayName}
                  spinAvg={stats.thisWeek.averageSpin}
                  bestSpin={stats.thisWeek.bestSpin}
                  personalBestSpin={stats.personalBests.bestSpin}
                  ghostSpinAvg={stats.lastWeek.averageSpin}
                  ghostBestSpin={stats.lastWeek.bestSpin}
                  convRate={stats.thisWeek.callToConversationRate}
                  apptRate={stats.thisWeek.conversationToAppointmentRate}
                  ghostConvRate={stats.lastWeek.callToConversationRate}
                  ghostApptRate={stats.lastWeek.conversationToAppointmentRate}
                  connectedCalls={stats.thisWeek.connectedCalls}
                  totalCalls={stats.thisWeek.totalCalls}
                  appointments={stats.thisWeek.appointmentsBooked}
                  scoredCalls={stats.thisWeek.totalCalls}
                />
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h3 className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium mb-3" style={{ color: '#6366f1' }}>
                  Recent Debriefs
                </h3>
                <RecentCalls calls={recentCalls} />
              </motion.div>

              {stats && stats.allBdrs.length >= 2 && (
                <Leaderboard
                  players={stats.allBdrs.map(b => ({
                    name: b.name,
                    elevatorPitch: b.practiceThisWeek.elevatorPitch,
                    objectionHandling: b.practiceThisWeek.objectionHandling,
                    customerStory: b.practiceThisWeek.customerStory,
                    elevatorTrend: b.elevatorTrend,
                    objectionTrend: b.objectionTrend,
                    customerTrend: b.customerTrend,
                  }))}
                />
              )}
            </>
          )}
      </div>
    </div>
  )
}
