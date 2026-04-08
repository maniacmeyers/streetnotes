'use client'

import { useState } from 'react'
import Link from 'next/link'
import VoiceNoteCapture from '@/components/voice-note-capture'
import RecentNotes from '@/components/dashboard/recent-notes'
import SignOutButton from '@/components/sign-out-button'

export default function DashboardClient({ userEmail }: { userEmail: string }) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const exitCapture = () => {
    setIsCapturing(false)
    setRefreshKey(k => k + 1)
  }

  if (isCapturing) {
    return (
      <main className="px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={exitCapture}
            className="text-base text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center"
          >
            &larr; Back
          </button>
          <Link
            href="/settings"
            className="text-sm text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            Settings
          </Link>
        </div>
        <VoiceNoteCapture autoStart onSaved={exitCapture} />
      </main>
    )
  }

  return (
    <main className="px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">StreetNotes</h1>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>
        <Link
          href="/settings"
          className="text-sm text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          Settings
        </Link>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center gap-3 py-6">
        <button
          type="button"
          onClick={() => setIsCapturing(true)}
          className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 flex items-center justify-center shadow-lg"
          aria-label="Record new note"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>
        <p className="text-sm text-gray-500">Tap to record</p>
      </div>

      {/* Recent notes */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Notes</h2>
        <RecentNotes refreshKey={refreshKey} />
      </div>

      <SignOutButton />
    </main>
  )
}
