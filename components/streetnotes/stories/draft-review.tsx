'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { Pencil, Check, Mic } from 'lucide-react'
import { BrutalCard, BrutalButton, BrutalBadge } from '@/components/streetnotes/brutal'
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
        <BrutalBadge variant="black">{STORY_TYPE_LABELS[storyType]}</BrutalBadge>
        {!editing ? (
          <BrutalButton variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil size={14} />
            Edit
          </BrutalButton>
        ) : (
          <BrutalButton variant="volt" size="sm" onClick={handleSave}>
            <Check size={14} />
            Save
          </BrutalButton>
        )}
      </div>

      {/* Content Card */}
      <BrutalCard variant="white" padded className="mb-6">
        {editing ? (
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={handleTextareaInput}
            className="w-full font-body text-base leading-relaxed bg-transparent outline-none resize-none text-black"
            style={{ minHeight: 200 }}
          />
        ) : (
          <p className="font-body text-base leading-relaxed whitespace-pre-wrap text-black">
            {editedContent}
          </p>
        )}
      </BrutalCard>

      {/* Practice CTA */}
      <div className="flex justify-center">
        <BrutalButton variant="volt" size="lg" onClick={onStartPractice}>
          <Mic size={20} />
          Practice This Story
        </BrutalButton>
      </div>
    </motion.div>
  )
}
