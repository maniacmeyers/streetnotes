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
    'rounded-full px-3 py-1 text-[11px] font-extrabold'
  if (!status) return <span className={`${base} bg-[#D4A28A]/20 text-[#8B6B40]`}>Draft</span>
  if (status === 'success') return <span className={`${base} bg-[#A8855A] text-[#FAF6EE] shadow-[0_10px_18px_rgba(168,133,90,0.32)]`}>Saved</span>
  if (status === 'failed') return <span className={`${base} bg-[#8B6B40] text-[#FAF6EE]`}>Retry</span>
  if (status === 'pending') return <span className={`${base} bg-[#D4A28A]/30 text-[#8B6B40]`}>Pending</span>
  return null
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="fg-card-sm animate-pulse px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3.5 w-3/4 rounded bg-[#A8855A]/15" />
              <div className="h-2.5 w-1/4 rounded bg-[#A8855A]/10" />
            </div>
            <div className="ml-3 h-5 w-14 rounded bg-[#A8855A]/15" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RecentNotes({ refreshKey }: { refreshKey?: number }) {
  const [notes, setNotes] = useState<NoteListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch('/api/notes')
      .then(res => {
        if (!res.ok) throw new Error(`status ${res.status}`)
        return res.json()
      })
      .then(data => setNotes(data.notes ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [refreshKey, retryKey])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="fg-card p-6 text-center">
        <p className="text-base font-extrabold text-[#1A1410]">Couldn&apos;t load notes</p>
        <p className="mt-1 text-sm leading-6 text-[#3D332A]">
          Network or backend issue. Try again.
        </p>
        <button
          type="button"
          onClick={() => setRetryKey(k => k + 1)}
          className="fg-secondary-action mt-4 px-5"
        >
          Retry
        </button>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="fg-card p-8 text-center">
        <p className="text-xl font-extrabold text-[#1A1410]">No results yet</p>
        <p className="mt-2 text-sm font-medium leading-6 text-[#3D332A]">
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
              className="fg-card-sm block min-h-[68px] cursor-pointer rounded-[22px] px-4 py-4 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <p className="truncate text-[15px] font-extrabold leading-tight text-[#1A1410]">
                    {note.title || 'Untitled'}
                  </p>
                  <p className="mt-1 text-[13px] font-medium text-[#3D332A]">
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
