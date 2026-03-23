'use client'

import { Mic, Square } from 'lucide-react'

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
        @keyframes mic-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(126,212,247,0.5), 0 0 80px rgba(126,212,247,0.2); }
          50% { box-shadow: 0 0 60px rgba(126,212,247,0.7), 0 0 100px rgba(126,212,247,0.3); }
        }
        @keyframes mic-pulse-red {
          0%, 100% { box-shadow: 0 0 40px rgba(239,68,68,0.5); }
          50% { box-shadow: 0 0 60px rgba(239,68,68,0.7), 0 0 100px rgba(239,68,68,0.3); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mic-btn { animation: none !important; }
        }
      `}</style>

      <button
        onClick={isRecording ? onStop : onStart}
        disabled={disabled}
        className={`mic-btn w-[150px] h-[150px] rounded-full border-none cursor-pointer relative transition-transform duration-150 ease-out
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'}
        `}
        style={{
          backgroundColor: isRecording ? '#EF4444' : '#7ed4f7',
          animation: disabled
            ? 'none'
            : isRecording
            ? 'mic-pulse-red 0.8s ease-in-out infinite'
            : 'mic-pulse 1.2s ease-in-out infinite',
        }}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <Square className="w-12 h-12 mx-auto" style={{ color: '#FFFFFF' }} />
        ) : (
          <Mic className="w-12 h-12 mx-auto" style={{ color: '#061222' }} />
        )}
      </button>

      {isRecording ? (
        <span className="font-fira-code text-lg text-white font-medium">
          {formatDuration(durationSec)}
        </span>
      ) : (
        <span className="font-inter font-bold uppercase tracking-widest text-sm text-white">
          Debrief
        </span>
      )}
    </div>
  )
}
