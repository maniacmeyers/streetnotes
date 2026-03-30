'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Mic, Square } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'

interface MicButtonProps {
  isRecording: boolean
  durationSec?: number
  onStart: () => void
  onStop: () => void
  disabled?: boolean
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MicButton({
  isRecording,
  durationSec = 0,
  onStart,
  onStop,
  disabled = false,
}: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <style>{`
        @keyframes mic-pulse-neu {
          0%, 100% { box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff, 0 0 30px rgba(99,102,241,0.3); }
          50% { box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff, 0 0 50px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.15); }
        }
        @keyframes mic-pulse-red-neu {
          0%, 100% { box-shadow: inset 2px 2px 5px #a3b1c6, inset -2px -2px 5px #ffffff, 0 0 30px rgba(239,68,68,0.4); }
          50% { box-shadow: inset 2px 2px 5px #a3b1c6, inset -2px -2px 5px #ffffff, 0 0 50px rgba(239,68,68,0.6), 0 0 80px rgba(239,68,68,0.2); }
        }
        @keyframes mic-burst-neu {
          0% { box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff, 0 0 60px rgba(99,102,241,0.6); }
          100% { box-shadow: 6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff, 0 0 30px rgba(99,102,241,0.3); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mic-btn { animation: none !important; }
        }
      `}</style>

      {/* Outer ring ripple effect */}
      <div className="relative">
        {!disabled && !isRecording && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: `${neuTheme.colors.accent.primary}1A` }}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        <button
          onClick={isRecording ? onStop : onStart}
          disabled={disabled}
          className={`mic-btn w-[140px] h-[140px] rounded-full border-none cursor-pointer relative transition-transform duration-150 ease-out
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}
          `}
          style={{
            backgroundColor: isRecording ? '#EF4444' : neuTheme.colors.bg,
            animation: disabled
              ? 'none'
              : isRecording
              ? 'mic-pulse-red-neu 0.8s ease-in-out infinite'
              : 'mic-burst-neu 0.5s ease-out forwards, mic-pulse-neu 1.5s ease-in-out 0.5s infinite',
            boxShadow: isRecording
              ? neuTheme.shadows.pressed
              : neuTheme.shadows.raised,
          }}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="stop"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <Square className="w-11 h-11 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <Mic className="w-11 h-11" style={{ color: neuTheme.colors.accent.primary }} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isRecording ? (
          <motion.span
            key="timer"
            className="font-fira-code text-xl font-medium"
            style={{ color: neuTheme.colors.text.heading }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {formatDuration(durationSec)}
          </motion.span>
        ) : (
          <motion.span
            key="label"
            className="font-inter font-bold uppercase tracking-widest text-sm"
            style={{ color: neuTheme.colors.text.heading }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            Debrief
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
