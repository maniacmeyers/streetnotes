'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { FaMicrophone } from 'react-icons/fa'

interface ImportSummaryProps {
  onSubmit: (text: string) => void
  onSwitchToVoice: () => void
}

const SUPPORTED_TOOLS = [
  'Zoom AI Companion',
  'Fireflies.ai',
  'Chorus',
  'Gong',
  'Otter.ai',
  'Microsoft Teams',
  'Google Meet',
  'Fathom',
  'Avoma',
]

export default function ImportSummary({ onSubmit, onSwitchToVoice }: ImportSummaryProps) {
  const [text, setText] = useState('')

  const canSubmit = text.trim().length >= 50

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-3 sm:mb-4">
          <span className="inline-block bg-white border-2 sm:border-3 border-black px-2.5 py-1 sm:px-3 sm:py-1.5 rotate-1 font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]">
            Import Summary
          </span>
        </div>
        <h2
          className="font-display text-[24px] sm:text-[40px] uppercase leading-[0.85] text-white mb-2"
          style={{ textShadow: '3px 3px 0px #000000' }}
        >
          Paste your
          <br />
          <span className="text-volt">call summary</span>
        </h2>
        <p className="font-body text-sm sm:text-base text-gray-400 max-w-sm mx-auto">
          From Zoom, Fireflies, Chorus, Gong, Otter, or any tool that
          summarizes your calls.
        </p>
      </motion.div>

      {/* Text area */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <div className="border-2 sm:border-4 border-black bg-white shadow-[2px_2px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
          <div className="border-b-2 sm:border-b-4 border-black px-4 py-2 sm:px-5 sm:py-2.5">
            <p className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-black/40">
              Paste your call summary, transcript, or meeting notes
            </p>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the call summary from your meeting tool here..."
            rows={8}
            className="w-full bg-transparent border-0 outline-none resize-none p-4 sm:p-5 font-body text-[13px] sm:text-sm text-black placeholder:text-black/20 leading-relaxed"
          />
          <div className="border-t border-black/10 px-4 py-2 sm:px-5 sm:py-2.5 flex items-center justify-between">
            <p className="font-mono text-[9px] text-black/30">
              {text.trim().length > 0
                ? `${text.trim().split(/\s+/).length} words`
                : 'Min 50 characters'}
            </p>
            <div className="flex flex-wrap gap-1">
              {SUPPORTED_TOOLS.slice(0, 4).map((tool) => (
                <span
                  key={tool}
                  className="font-mono text-[7px] sm:text-[8px] text-black/20 bg-black/5 px-1.5 py-0.5 rounded"
                >
                  {tool}
                </span>
              ))}
              <span className="font-mono text-[7px] sm:text-[8px] text-black/20 bg-black/5 px-1.5 py-0.5 rounded">
                +{SUPPORTED_TOOLS.length - 4} more
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Submit */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full flex flex-col gap-3"
      >
        <button
          type="button"
          onClick={() => onSubmit(text.trim())}
          disabled={!canSubmit}
          className="brutalist-btn bg-volt text-black w-full text-center disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Structure for CRM
        </button>

        {/* Switch to voice */}
        <button
          type="button"
          onClick={onSwitchToVoice}
          className="flex items-center justify-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 hover:text-volt transition-colors py-2"
        >
          <FaMicrophone className="text-[10px]" />
          Or record a voice dump instead
        </button>
      </motion.div>
    </div>
  )
}
