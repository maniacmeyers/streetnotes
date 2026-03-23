'use client'

import { Settings, ClipboardPaste } from 'lucide-react'
import { PlayerCard } from './player-card'
import { MicButton } from './mic-button'
import { LuminousDivider } from './luminous-divider'
import { VBRICK_CONFIG } from '@/lib/vbrick/config'

interface SidebarProps {
  name: string
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
}

export function Sidebar({
  name,
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
}: SidebarProps) {
  return (
    <div
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-white/10"
      style={{
        width: 320,
        background: `radial-gradient(ellipse at 50% 30%, rgba(126,212,247,0.05) 0%, transparent 70%), #0d1e3a`,
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-[11px] uppercase tracking-[0.2em] text-white font-inter font-medium">
          Vbrick Command Center
        </h1>
        <p className="text-[10px] text-gray-500 font-inter mt-1">
          Powered by StreetNotes.ai
        </p>
      </div>

      <LuminousDivider />

      {/* Player Card */}
      <div className="px-5 py-5">
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

      {/* Queue contact info during recording */}
      {isRecording && queueContact && (
        <div className="px-6 pb-3">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-inter mb-1">
            Debriefing
          </p>
          <p className="text-white font-inter font-bold text-sm">
            {queueContact.contactName}
          </p>
          {queueContact.contactTitle && (
            <p className="text-gray-400 text-xs font-inter">
              {queueContact.contactTitle} — {queueContact.company}
            </p>
          )}
        </div>
      )}

      {/* Mic Button — positioned high, right below player card */}
      <div className="flex flex-col items-center pt-6 pb-4">
        <MicButton
          isRecording={isRecording}
          durationSec={durationSec}
          onStart={onMicStart}
          onStop={onMicStop}
          disabled={micDisabled}
        />

        {/* Coaching prompts during recording */}
        {isRecording && (
          <p className="mt-6 text-xs text-gray-500 font-inter text-center px-6 italic max-w-[250px]">
            {VBRICK_CONFIG.coachingPrompts[coachingPromptIndex % VBRICK_CONFIG.coachingPrompts.length]}
          </p>
        )}

        {/* Paste / drop transcript button */}
        {!isRecording && (
          <button
            onClick={onPasteTranscript}
            className="mt-4 flex items-center gap-2 text-gray-400 text-xs font-inter hover:text-[#7ed4f7] transition-colors cursor-pointer"
          >
            <ClipboardPaste className="w-4 h-4" />
            Paste Chorus Transcript
          </button>
        )}
      </div>

      <div className="flex-1" />

      <LuminousDivider />

      {/* Bottom */}
      <div className="px-6 py-4 flex items-center justify-between">
        <button
          onClick={onSettingsClick}
          className="text-gray-500 hover:text-gray-300 transition-colors duration-200 cursor-pointer p-1"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
        <p
          className="text-[11px] text-[#7ed4f7] font-inter italic max-w-[200px] text-right tracking-wide"
          style={{ textShadow: '0 0 12px rgba(126,212,247,0.4)' }}
        >
          How you do anything is how you do everything
        </p>
      </div>
    </div>
  )
}
