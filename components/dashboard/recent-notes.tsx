'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

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
  const base =
    'font-mono text-[9px] uppercase tracking-[0.15em] font-bold px-2.5 py-1 rounded-md border backdrop-blur-sm'
  if (!status) return <span className={`${base} text-white/50 border-white/15 bg-white/5`}>Draft</span>
  if (status === 'success') return <span className={`${base} text-volt border-volt/40 bg-volt/10 shadow-[0_0_12px_rgba(0,230,118,0.2)]`}>Pushed</span>
  if (status === 'failed') return <span className={`${base} text-red-400 border-red-400/40 bg-red-400/10`}>Failed</span>
  if (status === 'pending') return <span className={`${base} text-amber-400 border-amber-400/40 bg-amber-400/10`}>Pending</span>
  return null
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="glass rounded-xl px-4 py-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3.5 bg-white/10 rounded w-3/4" />
              <div className="h-2.5 bg-white/5 rounded w-1/4" />
            </div>
            <div className="h-5 bg-white/10 rounded w-14 ml-3" />
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
      <div className="glass rounded-2xl p-8 text-center">
        <p className="font-bold text-xl text-white">No notes yet</p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-white/50 mt-2">
          Tap the mic to capture your first one
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
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
              className="block glass rounded-xl px-4 py-3.5 min-h-[60px] cursor-pointer hover:border-volt/30 hover:shadow-glow-volt transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <p className="font-bold text-sm text-white truncate leading-tight">
                    {note.title || 'Untitled'}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                    {timeAgo(note.created_at)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <PushBadge status={note.push_status} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
