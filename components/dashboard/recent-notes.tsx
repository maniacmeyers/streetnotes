'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
  return new Date(dateStr).toLocaleDateString()
}

function PushBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-gray-400">Draft</span>
  if (status === 'success')
    return <span className="text-xs text-green-600 font-medium">Pushed</span>
  if (status === 'failed')
    return <span className="text-xs text-red-600 font-medium">Failed</span>
  if (status === 'pending')
    return <span className="text-xs text-yellow-600 font-medium">Pending</span>
  return null
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

  if (loading) {
    return <p className="text-sm text-gray-400 text-center py-8">Loading notes...</p>
  }

  if (notes.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        No notes yet. Tap the mic to capture your first one.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {notes.map(note => (
        <Link
          key={note.id}
          href={`/notes/${note.id}`}
          className="flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 min-h-[44px] border-b border-gray-100 last:border-0"
        >
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className="text-base font-medium truncate">
              {note.title || 'Untitled'}
            </p>
            <p className="text-sm text-gray-500">{timeAgo(note.created_at)}</p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <PushBadge status={note.push_status} />
          </div>
        </Link>
      ))}
    </div>
  )
}
