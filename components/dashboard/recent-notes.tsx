'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { neuTheme } from '@/lib/vbrick/theme'

const t = neuTheme

interface NoteListItem {
  id: string
  title: string
  status: string
  push_status: string | null
  created_at: string
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMin = Math.floor((now - then) / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay}d ago`
  const date = new Date(dateStr)
  const thisYear = new Date().getFullYear()
  if (date.getFullYear() === thisYear) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function PushBadge({ status }: { status: string | null }) {
  const base = 'font-inter text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-md'
  if (!status) return (
    <span className={base} style={{ color: t.colors.text.subtle, background: `${t.colors.text.subtle}15` }}>Draft</span>
  )
  if (status === 'success') return (
    <span className={base} style={{ color: t.colors.score.green, background: `${t.colors.score.green}15` }}>Pushed</span>
  )
  if (status === 'failed') return (
    <span className={base} style={{ color: t.colors.score.red, background: `${t.colors.score.red}15` }}>Failed</span>
  )
  if (status === 'pending') return (
    <span className={base} style={{ color: t.colors.score.amber, background: `${t.colors.score.amber}15` }}>Pending</span>
  )
  return null
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="rounded-xl px-4 py-3 animate-pulse"
          style={{ background: t.colors.bg, boxShadow: t.shadows.raisedSm }}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-4 rounded w-3/4" style={{ background: t.colors.shadow }} />
              <div className="h-3 rounded w-1/4" style={{ background: `${t.colors.shadow}80` }} />
            </div>
            <div className="h-3 rounded w-12 ml-3" style={{ background: `${t.colors.shadow}60` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RecentNotes({ refreshKey }: { refreshKey?: number }) {
  const [notes, setNotes] = useState<NoteListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/notes')
      .then(res => res.json())
      .then(data => setNotes(data.notes ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [refreshKey])

  if (loading) return <Skeleton />

  if (notes.length === 0) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: t.colors.bg, boxShadow: t.shadows.raised }}
      >
        <p className="font-inter text-sm" style={{ color: t.colors.text.muted }}>
          No notes yet
        </p>
        <p className="font-inter text-xs mt-1" style={{ color: t.colors.text.subtle }}>
          Tap the mic to capture your first one
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {notes.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            layout
          >
            <Link
              href={`/notes/${note.id}`}
              className="flex items-center justify-between px-4 py-3 rounded-xl min-h-[44px] transition-all duration-200"
              style={{
                background: t.colors.bg,
                boxShadow: t.shadows.raisedSm,
              }}
            >
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <p
                  className="font-inter font-semibold text-sm truncate"
                  style={{ color: t.colors.text.heading }}
                >
                  {note.title || 'Untitled'}
                </p>
                <p
                  className="font-fira-code text-xs"
                  style={{ color: t.colors.text.subtle }}
                >
                  {timeAgo(note.created_at)}
                </p>
              </div>
              <div className="flex-shrink-0 ml-3">
                <PushBadge status={note.push_status} />
              </div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
