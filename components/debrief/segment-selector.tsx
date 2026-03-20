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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <span className="inline-block uppercase text-xs tracking-widest text-[#7ed4f7]">
          SELECT CALL TYPE
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="font-bold text-[28px] sm:text-[48px] leading-[0.85] text-white mb-3 sm:mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        What kind of
        <br />
        <span className="text-[#7ed4f7]">call</span> was this?
      </motion.h1>

      {/* Subline */}
      <motion.p
        className="text-xs uppercase tracking-widest text-gray-500 mb-6 sm:mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        This calibrates your analysis.
      </motion.p>

      {/* BDR Cold Call — primary option */}
      <motion.div
        className="max-w-sm sm:max-w-md mx-auto mb-4 sm:mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <button
          type="button"
          onClick={() => handleSelect('bdr-cold-call')}
          disabled={selected !== null && selected !== 'bdr-cold-call'}
          className={`
            w-full border-l-4 rounded-lg
            p-4 sm:p-5
            min-h-[80px] sm:min-h-[88px]
            text-left
            transition-all duration-150
            cursor-pointer
            ${
              selected === 'bdr-cold-call'
                ? 'bg-[#7ed4f7]/20 border-[#7ed4f7]'
                : selected !== null
                  ? 'bg-white/5 border-[#7ed4f7] opacity-40'
                  : 'bg-white/5 border-[#7ed4f7] hover:bg-white/10'
            }
            disabled:cursor-default
          `}
        >
          <span className="font-bold text-base sm:text-lg block leading-tight text-white">
            BDR Cold Call
          </span>
          <span className="text-xs uppercase tracking-widest text-gray-400 block mt-1.5 leading-snug">
            Quick call log + AE briefing + SPIN score
          </span>
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div
        className="max-w-sm sm:max-w-md mx-auto flex items-center gap-3 mb-4 sm:mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.3 }}
      >
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-xs uppercase tracking-widest text-gray-600">
          or log a meeting
        </span>
        <div className="flex-1 h-px bg-gray-700" />
      </motion.div>

      {/* 2x2 Deal Segment Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {dealSegments.map((segment, i) => {
          const isSelected = selected === segment.value

          return (
            <motion.button
              key={segment.value}
              type="button"
              onClick={() => handleSelect(segment.value)}
              disabled={selected !== null && !isSelected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.05, duration: 0.3 }}
              className={`
                rounded-lg border
                p-4 sm:p-5
                min-h-[88px] sm:min-h-[100px]
                text-left
                transition-all duration-150
                cursor-pointer
                ${
                  isSelected
                    ? 'bg-[#7ed4f7]/20 border-[#7ed4f7]'
                    : selected !== null
                      ? 'bg-white/5 border-white/10 opacity-40'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
                disabled:cursor-default
              `}
            >
              <span className="font-bold uppercase text-base sm:text-lg block leading-tight text-white">
                {segment.label}
              </span>
              <span className="text-[9px] sm:text-xs uppercase tracking-widest text-gray-400 block mt-1.5 leading-snug">
                {segment.description}
              </span>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
