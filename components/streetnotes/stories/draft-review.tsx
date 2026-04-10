'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { Pencil, Check, Mic } from 'lucide-react'
import { fadeIn } from '@/lib/vbrick/animations'
import { STORY_TYPE_LABELS, type StoryType } from '@/lib/vbrick/story-types'

interface DraftReviewProps {
  content: string
  storyType: StoryType
  onStartPractice: () => void
  onEdit: (content: string) => void
}

export function DraftReview({ content, storyType, onStartPractice, onEdit }: DraftReviewProps) {
  const [editing, setEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditedContent(content)
  }, [content])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editing])

  function handleSave() {
    setEditing(false)
    if (editedContent.trim() !== content.trim()) {
      onEdit(editedContent.trim())
    }
  }

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditedContent(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-block rounded-md glass-inset px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] font-bold text-volt">
          {STORY_TYPE_LABELS[storyType]}
        </span>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md transition hover:bg-white/10"
          >
            <Pencil size={14} />
            Edit
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-volt/50 bg-volt/15 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-volt/25"
          >
            <Check size={14} />
            Save
          </button>
        )}
      </div>

      {/* Content Card */}
      <div className="rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] p-5 mb-6">
        <div className="rounded-xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-4">
          {editing ? (
            <textarea
              ref={textareaRef}
              value={editedContent}
              onChange={handleTextareaInput}
              className="w-full font-body text-base leading-relaxed bg-transparent outline-none resize-none text-white"
              style={{ minHeight: 200 }}
            />
          ) : (
            <p className="font-body text-base leading-relaxed whitespace-pre-wrap text-white/85">
              {editedContent}
            </p>
          )}
        </div>
      </div>

      {/* Practice CTA */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onStartPractice}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-volt/50 bg-volt/15 px-6 py-4 font-mono text-sm uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-volt/25"
        >
          <Mic size={20} />
          Practice This Story
        </button>
      </div>
    </motion.div>
  )
}
