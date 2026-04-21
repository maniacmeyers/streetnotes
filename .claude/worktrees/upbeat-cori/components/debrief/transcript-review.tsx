'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'

interface TranscriptReviewProps {
  transcript: string
  onConfirm: (editedTranscript: string) => void
  onReRecord: () => void
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
}

export default function TranscriptReview({
  transcript,
  onConfirm,
  onReRecord,
}: TranscriptReviewProps) {
  const [edited, setEdited] = useState(transcript)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wordCount = countWords(edited)
  const hasEdits = edited !== transcript

  // Auto-resize textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.max(200, textareaRef.current.scrollHeight) + 'px'
    }
  }, [edited])

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, rotate: 4 }}
          animate={{ opacity: 1, rotate: 2 }}
          transition={{ delay: 0.1 }}
        >
          <span className="inline-block bg-white border-2 sm:border-3 border-black px-2.5 py-1 sm:px-3 sm:py-1.5 rotate-2 font-mono text-[9px] sm:text-xs uppercase tracking-[0.1em] text-black font-bold shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000]">
            Step 2 of 3
          </span>
        </motion.div>

        <motion.h2
          className="font-display text-[32px] sm:text-[48px] uppercase leading-[0.85] text-white mb-3"
          style={{ textShadow: '3px 3px 0px #000000' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Review your
          <br />
          <span className="text-volt">transcript</span>
        </motion.h2>

        <motion.p
          className="font-body text-base sm:text-lg text-gray-400 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Fix any names, numbers, or details before we extract the deal data.
        </motion.p>
      </div>

      {/* Transcript card */}
      <motion.div
        className="border-2 sm:border-4 border-black bg-white shadow-[2px_2px_0px_#000] sm:shadow-[8px_8px_0px_#000]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Card header */}
        <div className="border-b-2 sm:border-b-4 border-black px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-black font-bold">
              Transcript
            </span>
            <span className="bg-volt/20 text-black font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] px-1.5 sm:px-2 py-0.5 border border-volt/40">
              AI-Generated
            </span>
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] text-gray-400">
            {wordCount} words
          </span>
        </div>

        {/* Editable textarea */}
        <label htmlFor="transcript-editor" className="sr-only">
          Edit your transcript
        </label>
        <textarea
          id="transcript-editor"
          ref={textareaRef}
          value={edited}
          onChange={(e) => setEdited(e.target.value)}
          className="w-full px-3 py-3 sm:px-4 sm:py-4 font-mono text-[13px] sm:text-sm text-black bg-white leading-relaxed outline-none resize-none min-h-[200px]"
          spellCheck={true}
          aria-describedby={hasEdits ? 'edit-notice' : undefined}
        />

        {/* Card footer */}
        {hasEdits && (
          <div className="border-t-2 sm:border-t-4 border-black px-3 py-2 sm:px-4 bg-volt/10">
            <p id="edit-notice" role="status" className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.1em] text-volt">
              Edits detected — your version will be used
            </p>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          type="button"
          onClick={() => onConfirm(edited)}
          className="brutalist-btn bg-volt text-black w-full text-center"
        >
          Looks good — extract deal data
        </button>

        <button
          type="button"
          onClick={onReRecord}
          className="font-mono text-xs uppercase tracking-[0.1em] text-gray-400 hover:text-white transition-colors py-3 min-h-[44px]"
        >
          Re-record instead
        </button>
      </motion.div>
    </div>
  )
}
