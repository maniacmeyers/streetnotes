'use client'

import { motion } from 'motion/react'
import { FaMicrophone, FaStop } from 'react-icons/fa'
import ShinyText from '@/components/shiny-text'

interface MicButtonProps {
  isRecording: boolean
  disabled: boolean
  canStop: boolean
  durationSec: number
  onStart: () => void
  onStop: () => void
}

function formatTimer(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function MicButton({
  isRecording,
  disabled,
  canStop,
  durationSec,
  onStart,
  onStop,
}: MicButtonProps) {
  const handleClick = () => {
    // Haptic feedback on mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(isRecording ? [30, 30, 30] : 50)
    }

    if (isRecording && canStop) {
      onStop()
    } else if (!isRecording && !disabled) {
      onStart()
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Button container with pulse ring */}
      <div className="relative">
        {/* Pulse ring behind button when recording */}
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] rounded-full border-4 border-red-500/40 pulse-ring" />
          </div>
        )}

        <motion.button
          type="button"
          onClick={handleClick}
          disabled={disabled && !isRecording}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className={`
            relative z-10
            w-[120px] h-[120px] sm:w-[160px] sm:h-[160px]
            rounded-full
            border-4 border-black
            flex items-center justify-center
            transition-colors duration-200
            min-h-[44px]
            cursor-pointer
            ${
              isRecording
                ? 'bg-red-500 neo-shadow-sm'
                : disabled
                  ? 'bg-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-volt neo-shadow hover:shadow-none hover:translate-x-1 hover:translate-y-1'
            }
          `}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <FaStop className="text-white text-3xl sm:text-4xl" />
          ) : (
            <FaMicrophone className="text-black text-3xl sm:text-4xl" />
          )}
        </motion.button>
      </div>

      {/* Timer / Label */}
      <div className="text-center">
        {isRecording ? (
          <>
            <p className="font-mono text-2xl sm:text-3xl text-white font-bold tabular-nums">
              {formatTimer(durationSec)}
            </p>
            {!canStop && (
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-1">
                Min 15 seconds
              </p>
            )}
            {canStop && durationSec < 150 && (
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-1">
                Tap to stop when done
              </p>
            )}
            {durationSec >= 150 && (
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-red-400 mt-1 font-bold">
                Auto-stop in {180 - durationSec}s
              </p>
            )}
          </>
        ) : (
          <p className="font-mono text-sm sm:text-base uppercase tracking-[0.1em]">
            {disabled ? (
              <span className="text-gray-400">Mic unavailable</span>
            ) : (
              <ShinyText
                text="Tap to record"
                color="#9ca3af"
                shineColor="#00E676"
                speed={3}
                spread={120}
                className="font-mono text-sm sm:text-base uppercase tracking-[0.1em]"
              />
            )}
          </p>
        )}
      </div>
    </div>
  )
}
