'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import type { DealSegment } from '@/lib/debrief/types'

interface SegmentSelectorProps {
  onSelect: (segment: DealSegment) => void
}

const dealSegments: Array<{
  value: DealSegment
  label: string
  description: string
}> = [
  {
    value: 'smb',
    label: 'SMB',
    description: 'Small business, short sales cycle',
  },
  {
    value: 'mid-market',
    label: 'Mid-Market',
    description: 'Growing company, 2-4 week cycle',
  },
  {
    value: 'enterprise',
    label: 'Enterprise',
    description: 'Large org, long cycle, committee',
  },
  {
    value: 'partner-channel',
    label: 'Partner/Channel',
    description: 'Channel sale or referral',
  },
]

export default function SegmentSelector({ onSelect }: SegmentSelectorProps) {
  const [selected, setSelected] = useState<DealSegment | null>(null)

  function handleSelect(segment: DealSegment) {
    if (selected) return
    setSelected(segment)
    setTimeout(() => onSelect(segment), 200)
  }

  return (
    <div className="text-center">
      {/* Badge */}
      <motion.div
        className="mb-4 sm:mb-6"
        initial={{ opacity: 0, rotate: -4 }}
        animate={{ opacity: 1, rotate: -2 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <span className="inline-block bg-white border-2 sm:border-3 border-black px-2.5 py-1 sm:px-3 sm:py-1.5 -rotate-2 font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]">
          Step 1 of 3
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="font-display uppercase text-[28px] sm:text-[48px] leading-[0.85] text-white mb-3 sm:mb-4"
        style={{ textShadow: '3px 3px 0px #000000' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        What kind of
        <br />
        <span className="text-volt">call</span> was this?
      </motion.h1>

      {/* Subline */}
      <motion.p
        className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-gray-500 mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        This calibrates your analysis.
      </motion.p>

      {/* BDR Cold Call — full-width primary option */}
      <motion.div
        className="max-w-sm sm:max-w-md mx-auto mb-4 sm:mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
      >
        <motion.button
          type="button"
          onClick={() => handleSelect('bdr-cold-call')}
          disabled={selected !== null && selected !== 'bdr-cold-call'}
          className={`
            w-full border-2 sm:border-4 border-black
            p-4 sm:p-5
            min-h-[72px] sm:min-h-[80px]
            text-left
            transition-all duration-100
            cursor-pointer
            ${
              selected === 'bdr-cold-call'
                ? 'bg-volt text-black shadow-none translate-x-[2px] translate-y-[2px] sm:translate-x-[4px] sm:translate-y-[4px]'
                : selected !== null
                  ? 'bg-gray-900 text-white shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000] opacity-40'
                  : 'bg-gray-900 text-white shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:bg-gray-800 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] sm:active:translate-x-[4px] sm:active:translate-y-[4px]'
            }
            disabled:cursor-default
          `}
        >
          <span className={`font-display uppercase text-base sm:text-lg block leading-tight ${selected === 'bdr-cold-call' ? 'text-black' : 'text-volt'}`}>
            BDR Cold Call
          </span>
          <span className={`font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] block mt-1.5 leading-snug ${selected === 'bdr-cold-call' ? 'text-black/60' : 'text-gray-400'}`}>
            Quick call log + AE briefing
          </span>
        </motion.button>
      </motion.div>

      {/* Divider */}
      <motion.div
        className="max-w-sm sm:max-w-md mx-auto flex items-center gap-3 mb-4 sm:mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <div className="flex-1 h-px bg-gray-700" />
        <span className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.15em] text-gray-600">
          or select deal type
        </span>
        <div className="flex-1 h-px bg-gray-700" />
      </motion.div>

      {/* 2x2 Deal Segment Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        {dealSegments.map((segment, i) => {
          const isSelected = selected === segment.value

          return (
            <motion.button
              key={segment.value}
              type="button"
              onClick={() => handleSelect(segment.value)}
              disabled={selected !== null && !isSelected}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.06, duration: 0.35 }}
              className={`
                border-2 sm:border-4 border-black
                p-4 sm:p-5
                min-h-[88px] sm:min-h-[100px]
                text-left
                transition-all duration-100
                cursor-pointer
                ${
                  isSelected
                    ? 'bg-volt text-black shadow-none translate-x-[2px] translate-y-[2px] sm:translate-x-[4px] sm:translate-y-[4px]'
                    : selected !== null
                      ? 'bg-white text-black shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000] opacity-40'
                      : 'bg-white text-black shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:bg-gray-50 active:shadow-none active:translate-x-[2px] active:translate-y-[2px] sm:active:translate-x-[4px] sm:active:translate-y-[4px]'
                }
                disabled:cursor-default
              `}
            >
              <span className="font-display uppercase text-base sm:text-lg block leading-tight">
                {segment.label}
              </span>
              <span className="font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-black/60 block mt-1.5 leading-snug">
                {segment.description}
              </span>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
