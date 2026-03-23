'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AuroraBackground from '@/components/vbrick/aurora-background'
import { Sidebar } from '@/components/vbrick/sidebar'
import { IntentionScreen } from '@/components/vbrick/intention-screen'
import { Leaderboard } from '@/components/vbrick/leaderboard'
import { PerformanceCards } from '@/components/vbrick/performance-cards'
import { RecentCalls, type RecentCall } from '@/components/vbrick/recent-calls'
import { CallQueue, type QueueItem } from '@/components/vbrick/call-queue'
import { CsvImportZone } from '@/components/vbrick/csv-import-zone'
import { SessionReport } from '@/components/vbrick/session-report'
import { DashboardDebriefFlow } from '@/components/vbrick/dashboard-debrief-flow'
import { TranscriptInput } from '@/components/vbrick/transcript-input'
import { GlassCard } from '@/components/vbrick/glass-card'
import { LuminousDivider } from '@/components/vbrick/luminous-divider'
import type { QueueContact } from '@/lib/vbrick/csv-parser'
import type { DebriefOutput, CallDisposition, ProspectStatus } from '@/lib/debrief/types'
import { isBDROutput, isVbrickBDROutput } from '@/lib/debrief/types'
import { isVbrickBdr } from '@/lib/vbrick/config'

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
  }>
}

type DashboardView = 'dashboard' | 'debrief' | 'transcript' | 'report'

export default function VbrickDashboardPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [showIntention, setShowIntention] = useState(false)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [view, setView] = useState<DashboardView>('dashboard')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [coachingIdx, setCoachingIdx] = useState(0)
  const [pastedTranscript, setPastedTranscript] = useState<string | null>(null)

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [recentCalls, setRecentCalls] = useState<RecentCall[]>([])
  const [sessionReport, setSessionReport] = useState<{
    sessionId: string
    duration: string
    totalCalls: number
    connectedCount: number
    appointmentsCount: number
    convRate: number
    apptRate: number
    averageSpin: number
    bestSpin: number
    bestSpinContact: string
  } | null>(null)
  const sessionStartRef = useRef<Date | null>(null)
  const timerRef = useRef<number | null>(null)

  // Load email from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) {
      setEmail(stored)
    }
  }, [])

  // Check intention + load data once email is set
  useEffect(() => {
    if (!email) return

    const today = new Date().toISOString().split('T')[0]
    const intentionKey = `vbrick_intention_${today}`
    const completedToday = localStorage.getItem(intentionKey)

    if (!completedToday) {
      setShowIntention(true)
    }

    fetchStats()
    fetchActiveSession()
    fetchRecentCalls()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0)
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)

      // Rotate coaching prompts every 8 seconds
      const coachingTimer = window.setInterval(() => {
        setCoachingIdx(prev => prev + 1)
      }, 8000)

      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current)
        window.clearInterval(coachingTimer)
      }
    } else {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  async function fetchStats() {
    if (!email) return
    try {
      const res = await fetch(`/api/vbrick/stats?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (res.ok) setStats(data)
    } catch {}
  }

  async function fetchActiveSession() {
    if (!email) return
    try {
      const res = await fetch(`/api/vbrick/session?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (res.ok && data.session) {
        setSessionId(data.session.id)
        setQueue(data.queue || [])
        sessionStartRef.current = new Date(data.session.started_at)
      }
    } catch {}
  }

  async function fetchRecentCalls() {
    if (!email) return
    try {
      const res = await fetch(`/api/vbrick/stats?email=${encodeURIComponent(email)}`)
      const data = await res.json()
      if (res.ok && data.thisWeek) {
        // Build recent calls from debrief sessions... for now use empty
        // This gets populated as debriefs complete
      }
    } catch {}
  }

  function handleIntentionComplete() {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`vbrick_intention_${today}`, '1')
    setShowIntention(false)
  }

  async function handleCsvImport(contacts: QueueContact[]) {
    if (!email) return
    try {
      const res = await fetch('/api/vbrick/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, contacts }),
      })
      const data = await res.json()
      if (res.ok) {
        setSessionId(data.sessionId)
        sessionStartRef.current = new Date()
        await fetchActiveSession()
      }
    } catch {}
  }

  function handleMicStart() {
    setView('debrief')
    setIsRecording(true)
  }

  function handleMicStop() {
    setIsRecording(false)
  }

  const handleDebriefComplete = useCallback(async (debriefSessionId: string, output: DebriefOutput) => {
    // Update queue if active session
    if (sessionId && queue.length > 0) {
      const upNext = queue.find(q => q.status === 'pending')
      if (upNext) {
        await fetch('/api/vbrick/queue', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queueItemId: upNext.id,
            status: 'completed',
            debriefSessionId,
          }),
        })
      }
    }

    // Recalculate stats
    if (email) {
      await fetch('/api/vbrick/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    }

    // Add to recent calls
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

    // Refresh data
    await fetchStats()
    await fetchActiveSession()
    setView('dashboard')
    setIsRecording(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, sessionId, queue])

  async function handleSkipQueueItem(itemId: string) {
    await fetch('/api/vbrick/queue', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queueItemId: itemId, status: 'skipped' }),
    })
    await fetchActiveSession()
  }

  async function handleJumpTo(itemId: string) {
    // Move the targeted item to top of pending by reordering
    setQueue(prev => {
      const target = prev.find(q => q.id === itemId)
      if (!target) return prev
      const minPending = Math.min(...prev.filter(q => q.status === 'pending').map(q => q.queue_position))
      return prev.map(q =>
        q.id === itemId ? { ...q, queue_position: minPending - 1 } : q
      ).sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1
        if (a.status !== 'pending' && b.status === 'pending') return 1
        return a.queue_position - b.queue_position
      })
    })
  }

  async function handleEndSession() {
    if (!sessionId) return
    try {
      const res = await fetch('/api/vbrick/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const data = await res.json()
      if (res.ok) {
        const duration = sessionStartRef.current
          ? formatSessionDuration(sessionStartRef.current, new Date())
          : '0m'

        setSessionReport({
          sessionId,
          duration,
          totalCalls: data.totalCalls || 0,
          connectedCount: data.connectedCount || 0,
          appointmentsCount: data.appointmentsCount || 0,
          convRate: data.totalCalls > 0 ? Math.round((data.connectedCount / data.totalCalls) * 100) : 0,
          apptRate: data.connectedCount > 0 ? Math.round((data.appointmentsCount / data.connectedCount) * 100) : 0,
          averageSpin: data.averageSpin || 0,
          bestSpin: data.bestSpin || 0,
          bestSpinContact: '',
        })
        setView('report')
      }
    } catch {}
  }

  function handleCloseReport() {
    setSessionId(null)
    setQueue([])
    setSessionReport(null)
    sessionStartRef.current = null
    setView('dashboard')
    fetchStats()
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    const clean = emailInput.trim().toLowerCase()
    if (!clean) return
    localStorage.setItem('vbrick_email', clean)
    setEmail(clean)
  }

  // Email gate
  if (!email) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 font-inter"
        style={{ background: '#061222' }}
      >
        <h1 className="text-[11px] uppercase tracking-[0.2em] text-[#7ed4f7] font-medium mb-8">
          Vbrick Command Center
        </h1>
        <form onSubmit={handleEmailSubmit} className="w-full max-w-sm space-y-4">
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Enter your Vbrick email"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-base font-inter placeholder:text-gray-500 focus:border-[#7ed4f7] focus:outline-none focus:ring-2 focus:ring-[#7ed4f7]/15"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#7ed4f7', color: '#061222' }}
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  // Intention screen
  if (showIntention) {
    return <IntentionScreen email={email} onComplete={handleIntentionComplete} />
  }

  const localPart = email.split('@')[0]
  const firstName = localPart.split('.')[0]
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
  const userIsBdr = isVbrickBdr(email)
  const upNextContact = queue.find(q => q.status === 'pending')
  const completedCount = queue.filter(q => q.status === 'completed' || q.status === 'skipped').length

  return (
    <div className="h-screen overflow-hidden font-inter" style={{ background: '#061222' }}>
      {/* Sidebar */}
      <Sidebar
        name={displayName}
        role={userIsBdr ? 'BDR — Vbrick' : 'Coach — Vbrick'}
        showStats={userIsBdr}
        streak={stats?.streak || 0}
        todayCalls={stats?.todayCalls || 0}
        spinAvg={stats?.thisWeek.averageSpin || 0}
        isRecording={isRecording}
        durationSec={recordingDuration}
        onMicStart={handleMicStart}
        onMicStop={handleMicStop}
        onSettingsClick={() => router.push('/vbrick/dashboard/settings')}
        onPasteTranscript={() => setView('transcript')}
        micDisabled={view === 'debrief' && !isRecording}
        queueContact={upNextContact ? {
          contactName: upNextContact.contact_name,
          contactTitle: upNextContact.contact_title || undefined,
          company: upNextContact.company,
        } : null}
        coachingPromptIndex={coachingIdx}
      />

      {/* Main content */}
      <div className="ml-[320px] h-screen overflow-y-auto relative">
        <AuroraBackground className="min-h-full">
          {/* Recording overlay dim */}
          {isRecording && (
            <div className="fixed inset-0 ml-[320px] bg-black/30 z-20 pointer-events-none" />
          )}

          <div className="px-8 py-8 space-y-6 relative z-10">
            {/* Debrief flow (from mic recording) */}
            {view === 'debrief' && !pastedTranscript && (
              <DashboardDebriefFlow
                email={email}
                queueContact={upNextContact ? {
                  id: upNextContact.id,
                  contactName: upNextContact.contact_name,
                  contactTitle: upNextContact.contact_title || undefined,
                  company: upNextContact.company,
                } : null}
                onComplete={handleDebriefComplete}
                onCancel={() => { setView('dashboard'); setIsRecording(false) }}
                isRecording={isRecording}
                onRecordingStart={() => setIsRecording(true)}
              />
            )}

            {/* Transcript paste/drop */}
            {view === 'transcript' && (
              <TranscriptInput
                onSubmit={(text) => {
                  setPastedTranscript(text)
                  setView('debrief')
                }}
                onCancel={() => setView('dashboard')}
              />
            )}

            {/* Debrief from pasted transcript */}
            {view === 'debrief' && pastedTranscript && (
              <DashboardDebriefFlow
                email={email}
                queueContact={upNextContact ? {
                  id: upNextContact.id,
                  contactName: upNextContact.contact_name,
                  contactTitle: upNextContact.contact_title || undefined,
                  company: upNextContact.company,
                } : null}
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

            {/* Session report */}
            {view === 'report' && sessionReport && (
              <SessionReport
                {...sessionReport}
                calls={queue}
                onClose={handleCloseReport}
              />
            )}

            {/* Dashboard content */}
            {view === 'dashboard' && (
              <>
                {/* Call Queue or Import */}
                {sessionId ? (
                  <GlassCard>
                    <CallQueue
                      queue={queue}
                      totalCount={queue.length}
                      completedCount={completedCount}
                      onSkip={handleSkipQueueItem}
                      onJumpTo={handleJumpTo}
                      onEndSession={handleEndSession}
                    />
                  </GlassCard>
                ) : (
                  <CsvImportZone onImport={handleCsvImport} />
                )}

                <LuminousDivider />

                {/* Leaderboard */}
                {stats && stats.allBdrs.length >= 2 && (
                  <Leaderboard
                    players={stats.allBdrs.map(b => ({
                      name: b.name,
                      convRate: b.callToConversationRate,
                      apptRate: b.conversationToAppointmentRate,
                      spinAvg: b.averageSpin,
                      convTrend: b.convTrend,
                      apptTrend: b.apptTrend,
                      spinTrend: b.spinTrend,
                    }))}
                  />
                )}

                {/* Performance Cards — only for BDRs */}
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

                <LuminousDivider />

                {/* Recent Calls */}
                <div>
                  <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#7ed4f7] font-inter font-medium mb-3">
                    Recent Calls
                  </h3>
                  <RecentCalls calls={recentCalls} />
                </div>
              </>
            )}
          </div>
        </AuroraBackground>
      </div>
    </div>
  )
}

function formatSessionDuration(start: Date, end: Date): string {
  const diffMs = end.getTime() - start.getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(mins / 60)
  const remainMins = mins % 60
  if (hours > 0) return `${hours}h ${remainMins}m`
  return `${mins}m`
}
