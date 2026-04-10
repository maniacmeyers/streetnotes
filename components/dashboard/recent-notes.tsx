'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { BrutalBadge } from '@/components/streetnotes/brutal'

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
  if (!status) return <BrutalBadge variant="white">Draft</BrutalBadge>
  if (status === 'success') return <BrutalBadge variant="black">Pushed</BrutalBadge>
  if (status === 'failed') return <BrutalBadge variant="red">Failed</BrutalBadge>
  if (status === 'pending') return <BrutalBadge variant="amber">Pending</BrutalBadge>
  return null
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="bg-gray-900 border-4 border-black shadow-neo-sm px-4 py-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 bg-gray-700 w-3/4" />
              <div className="h-3 bg-gray-800 w-1/4" />
            </div>
            <div className="h-5 bg-gray-700 w-14 ml-3" />
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
      <div className="bg-white border-4 border-black shadow-neo-sm p-8 text-center">
        <p className="font-display uppercase text-xl text-black">No notes yet</p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-black/60 mt-2">
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
              className="block bg-white border-4 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1 transition-transform duration-100 px-4 py-3 min-h-[60px]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <p className="font-display uppercase text-lg text-black truncate leading-[0.9]">
                    {note.title || 'Untitled'}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-black/60">
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
