'use client'

import { motion, AnimatePresence } from 'motion/react'
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
    <motion.div
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-white/10"
      style={{
        width: 320,
        background: `radial-gradient(ellipse at 50% 30%, rgba(126,212,247,0.05) 0%, transparent 70%), #0d1e3a`,
        zIndex: 10,
      }}
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <motion.div
        className="px-6 pt-6 pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h1 className="text-[11px] uppercase tracking-[0.2em] text-white font-inter font-medium">
          Vbrick Command Center
        </h1>
        <p className="text-[10px] text-gray-500 font-inter mt-1">
          Powered by StreetNotes.ai
        </p>
      </motion.div>

      <LuminousDivider />

      {/* Player Card */}
      <motion.div
        className="px-5 py-5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
      >
        <PlayerCard
          name={name}
          title={role}
          streak={streak}
          todayCalls={todayCalls}
          spinAvg={spinAvg}
          compact={isRecording}
          showStats={showStats}
        />
      </motion.div>

      {/* Queue contact info during recording */}
      <AnimatePresence>
        {isRecording && queueContact && (
          <motion.div
            className="px-6 pb-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic Button — positioned high, right below player card */}
      <motion.div
        className="flex flex-col items-center pt-6 pb-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
      >
        <MicButton
          isRecording={isRecording}
          durationSec={durationSec}
          onStart={onMicStart}
          onStop={onMicStop}
          disabled={micDisabled}
        />

        {/* Coaching prompts during recording — crossfade */}
        <AnimatePresence mode="wait">
          {isRecording && (
            <motion.p
              key={coachingPromptIndex}
              className="mt-6 text-xs text-gray-400 font-inter text-center px-6 italic max-w-[250px]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {VBRICK_CONFIG.coachingPrompts[coachingPromptIndex % VBRICK_CONFIG.coachingPrompts.length]}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Paste / drop transcript button */}
        {!isRecording && (
          <motion.button
            onClick={onPasteTranscript}
            className="mt-4 flex items-center gap-2 text-gray-400 text-xs font-inter hover:text-[#7ed4f7] transition-colors cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            <ClipboardPaste className="w-4 h-4" />
            Paste Chorus Transcript
          </motion.button>
        )}
      </motion.div>

      <div className="flex-1" />

      <LuminousDivider />

      {/* Bottom */}
      <motion.div
        className="px-6 py-4 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
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
      </motion.div>
    </motion.div>
  )
}
