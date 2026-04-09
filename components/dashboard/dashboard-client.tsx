'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import VoiceNoteCapture from '@/components/voice-note-capture'
import RecentNotes from '@/components/dashboard/recent-notes'
import SignOutButton from '@/components/sign-out-button'

export default function DashboardClient({ userEmail }: { userEmail: string }) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const hasWorkInProgress = useRef(false)

  const exitCapture = () => {
    setIsCapturing(false)
    setRefreshKey(k => k + 1)
    hasWorkInProgress.current = false
  }

  const handleBack = () => {
    if (hasWorkInProgress.current) {
      const confirmed = window.confirm(
        'You have an in-progress note. Leave and lose your work?'
      )
      if (!confirmed) return
    }
    exitCapture()
  }

  if (isCapturing) {
    return (
      <div className="px-6 py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="text-base text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center"
            aria-label="Back to dashboard"
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
        <VoiceNoteCapture
          autoStart
          onSaved={exitCapture}
          onProgress={(active) => { hasWorkInProgress.current = active }}
        />
      </div>
    )
  }

  return (
    <div className="px-6 py-8 flex flex-col gap-6">
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

      {/* Record button — large, pulsing, unmissable */}
      <div className="flex flex-col items-center gap-4 py-8">
        <button
          type="button"
          onClick={() => setIsCapturing(true)}
          className="relative w-28 h-28 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 flex items-center justify-center shadow-xl transition-transform active:scale-95"
          aria-label="Record new note"
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20" />
          <svg width="44" height="44" viewBox="0 0 24 24" fill="white" className="relative z-10">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>
        <p className="text-base font-medium text-gray-700">Record a meeting note</p>
        <p className="text-sm text-gray-400">Talk for 60 seconds. We handle the rest.</p>
      </div>

      {/* Recent notes */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Recent Notes</h2>
        <RecentNotes refreshKey={refreshKey} />
      </div>

      <SignOutButton />
    </div>
  )
}
