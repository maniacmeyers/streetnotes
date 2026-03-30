'use client'

import { AnimatePresence, motion } from 'motion/react'
import { Settings, ClipboardPaste, Zap, LayoutDashboard, BookOpen, Radar, Radio } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { PlayerCard } from './player-card'
import { MicButton } from './mic-button'
import { CoachingPanel, type CoachingSummary } from './coaching/coaching-panel'
import { VBRICK_CONFIG } from '@/lib/vbrick/config'
import { neuTheme } from '@/lib/vbrick/theme'

const navItems = [
  { label: 'Dashboard', href: '/vbrick/dashboard', icon: LayoutDashboard },
  { label: 'Stories', href: '/vbrick/dashboard/stories', icon: BookOpen },
  { label: 'Intel', href: '/vbrick/dashboard/ci', icon: Radar },
]

interface SidebarProps {
  name: string
  email: string
  role?: string
  showStats?: boolean
  streak: number
  todayCalls: number
  spinAvg: number
  isRecording: boolean
  durationSec: number
  onMicStart: () => void
  onMicStop: () => void
  onSettingsClick: () => void
  onPasteTranscript: () => void
  micDisabled?: boolean
  queueContact?: {
    contactName: string
    contactTitle?: string
    company: string
  } | null
  coachingPromptIndex?: number
  isCoaching?: boolean
  onStartCoaching?: () => void
  onEndCoaching?: (summary: CoachingSummary | null) => void
  callingSessionId?: string | null
}

export function Sidebar({
  name,
  email,
  role = 'BDR — Vbrick',
  showStats = true,
  streak,
  todayCalls,
  spinAvg,
  isRecording,
  durationSec,
  onMicStart,
  onMicStop,
  onSettingsClick,
  onPasteTranscript,
  micDisabled = false,
  queueContact,
  coachingPromptIndex = 0,
  isCoaching = false,
  onStartCoaching,
  onEndCoaching,
  callingSessionId,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className="fixed left-0 top-0 h-screen flex flex-col"
      style={{
        width: neuTheme.spacing.sidebar,
        background: neuTheme.colors.bg,
        zIndex: 10,
        boxShadow: `4px 0 12px ${neuTheme.colors.shadow}40`,
      }}
    >
      {/* Header — pinned top */}
      <div className="shrink-0 px-6 pt-6 pb-4 flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32, height: 32,
            borderRadius: neuTheme.radii.sm,
            background: neuTheme.colors.accent.primary,
            boxShadow: neuTheme.shadows.raisedSm,
          }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold font-general-sans tracking-tight" style={{ color: neuTheme.colors.text.heading }}>
            Command Center
          </h1>
          <p className="text-[10px] font-satoshi" style={{ color: neuTheme.colors.text.muted }}>
            Powered by StreetNotes.ai
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="shrink-0 h-px mx-6" style={{ background: `linear-gradient(to right, transparent, ${neuTheme.colors.shadow}60, transparent)` }} />

      {/* Scrollable middle section — handles Windows scaling and small viewports */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
        {/* Player Card */}
        <div className="px-5 py-5 shrink-0">
          <PlayerCard
            name={name}
            title={role}
            streak={streak}
            todayCalls={todayCalls}
            spinAvg={spinAvg}
            compact={isRecording}
            showStats={showStats}
          />
        </div>

        {/* Navigation */}
        <nav className="px-5 pb-2 shrink-0">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 font-satoshi text-sm no-underline"
                  style={{
                    borderRadius: neuTheme.radii.sm,
                    boxShadow: isActive ? neuTheme.shadows.insetSm : neuTheme.shadows.raisedSm,
                    color: isActive ? neuTheme.colors.accent.primary : neuTheme.colors.text.body,
                    fontWeight: isActive ? 600 : 400,
                    transition: neuTheme.transitions.default,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted }} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Queue contact info during recording */}
        <AnimatePresence>
          {isRecording && queueContact && (
            <motion.div
              className="px-6 pb-3 shrink-0"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-[10px] uppercase tracking-[0.15em] font-general-sans font-semibold mb-1" style={{ color: neuTheme.colors.accent.primary }}>
                Debriefing
              </p>
              <p className="font-general-sans font-bold text-sm" style={{ color: neuTheme.colors.text.heading }}>
                {queueContact.contactName}
              </p>
              {queueContact.contactTitle && (
                <p className="text-xs font-satoshi" style={{ color: neuTheme.colors.text.body }}>
                  {queueContact.contactTitle} — {queueContact.company}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mic Button */}
        <div className="flex flex-col items-center pt-6 pb-4 shrink-0">
          <MicButton
            isRecording={isRecording}
            durationSec={durationSec}
            onStart={onMicStart}
            onStop={onMicStop}
            disabled={micDisabled}
          />

          {/* Coaching prompts during recording */}
          <AnimatePresence mode="wait">
            {isRecording && (
              <motion.div
                key={coachingPromptIndex}
                className="mt-6 mx-5 px-4 py-3"
                style={{ borderRadius: neuTheme.radii.sm, boxShadow: neuTheme.shadows.inset, maxWidth: 240 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-xs font-satoshi text-center italic" style={{ color: neuTheme.colors.text.muted }}>
                  {VBRICK_CONFIG.coachingPrompts[coachingPromptIndex % VBRICK_CONFIG.coachingPrompts.length]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Paste transcript button */}
          {!isRecording && !isCoaching && (
            <button
              onClick={onPasteTranscript}
              className="mt-4 flex items-center gap-2 text-xs font-satoshi cursor-pointer border-none bg-transparent"
              style={{ color: neuTheme.colors.text.muted }}
            >
              <ClipboardPaste className="w-4 h-4" />
              Paste Chorus Transcript
            </button>
          )}

          {/* Start Live Coaching button */}
          {!isRecording && !isCoaching && onStartCoaching && (
            <button
              onClick={onStartCoaching}
              className="mt-3 flex items-center gap-2 text-xs font-general-sans font-semibold cursor-pointer border-none bg-transparent"
              style={{ color: neuTheme.colors.accent.primary }}
            >
              <Radio className="w-4 h-4" />
              Start Live Coaching
            </button>
          )}
        </div>

        {/* Live Coaching Panel */}
        {isCoaching && onEndCoaching && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <CoachingPanel
              email={email}
              callingSessionId={callingSessionId}
              contactName={queueContact?.contactName}
              company={queueContact?.company}
              onEnd={onEndCoaching}
            />
          </div>
        )}

        {!isCoaching && <div className="flex-1" />}
      </div>

      {/* Bottom divider — pinned bottom */}
      <div className="shrink-0 h-px mx-6" style={{ background: `linear-gradient(to right, transparent, ${neuTheme.colors.shadow}60, transparent)` }} />

      {/* Bottom — pinned bottom */}
      <div className="shrink-0 px-6 py-4 flex items-center justify-between">
        <button
          onClick={onSettingsClick}
          className="border-none bg-transparent cursor-pointer p-1"
          style={{ color: neuTheme.colors.text.subtle }}
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <p className="text-[10px] font-satoshi italic max-w-[200px] text-right tracking-wide" style={{ color: `${neuTheme.colors.accent.primary}99` }}>
          How you do anything is how you do everything
        </p>
      </div>
    </div>
  )
}
