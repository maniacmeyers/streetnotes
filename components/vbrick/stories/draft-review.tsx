'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { Pencil, Check, Mic } from 'lucide-react'
import { NeuCard, NeuButton, NeuBadge } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { fadeIn } from '@/lib/vbrick/animations'
import { STORY_TYPE_LABELS, type StoryType } from '@/lib/vbrick/story-types'

interface DraftReviewProps {
  content: string
  storyType: StoryType
  title?: string | null
  onStartPractice: () => void
  onEdit: (content: string) => void
  onTitleChange?: (title: string) => void
}

export function DraftReview({
  content,
  storyType,
  title,
  onStartPractice,
  onEdit,
  onTitleChange,
}: DraftReviewProps) {
  const [editing, setEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [titleDraft, setTitleDraft] = useState(title ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditedContent(content)
  }, [content])

  useEffect(() => {
    setTitleDraft(title ?? '')
  }, [title])

  function handleTitleBlur() {
    if (!onTitleChange) return
    const next = titleDraft.trim()
    if (next === (title ?? '').trim()) return
    onTitleChange(next)
  }

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
      {/* Title — user-editable name for this story */}
      {onTitleChange && (
        <div className="mb-4">
          <label
            className="block font-satoshi text-xs font-medium mb-2"
            style={{ color: neuTheme.colors.text.subtle }}
          >
            Name this story
          </label>
          <input
            type="text"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            placeholder="e.g., Healthcare CIO 30-sec pitch"
            maxLength={80}
            className="w-full p-3 rounded-xl font-satoshi text-base outline-none"
            style={{
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.inset,
              color: neuTheme.colors.text.heading,
            }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NeuBadge variant="accent">{STORY_TYPE_LABELS[storyType]}</NeuBadge>
        {!editing ? (
          <NeuButton variant="raised" size="sm" onClick={() => setEditing(true)}>
            <Pencil size={14} className="mr-1.5 inline-block" />
            Edit
          </NeuButton>
        ) : (
          <NeuButton variant="accent" size="sm" onClick={handleSave}>
            <Check size={14} className="mr-1.5 inline-block" />
            Save
          </NeuButton>
        )}
      </div>

      {/* Content Card */}
      <NeuCard variant="inset" hover={false} padding="lg" className="mb-6">
        {editing ? (
          <textarea
            ref={textareaRef}
            value={editedContent}
            onChange={handleTextareaInput}
            className="w-full font-satoshi text-base leading-relaxed bg-transparent outline-none resize-none"
            style={{ color: neuTheme.colors.text.body, minHeight: 200 }}
          />
        ) : (
          <p
            className="font-satoshi text-base leading-relaxed whitespace-pre-wrap"
            style={{ color: neuTheme.colors.text.body }}
          >
            {editedContent}
          </p>
        )}
      </NeuCard>

      {/* Practice CTA */}
      <div className="flex justify-center">
        <NeuButton variant="accent" size="lg" onClick={onStartPractice}>
          <Mic size={20} className="mr-2 inline-block" />
          Practice This Story
        </NeuButton>
      </div>
    </motion.div>
  )
}
