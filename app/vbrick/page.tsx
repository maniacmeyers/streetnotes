'use client'

import { useEffect, useState } from 'react'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

export default function VbrickPage() {
  const [loading, setLoading] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    const visited = getCookie('vbrick_visited')
    if (visited) {
      setShouldRedirect(true)
      window.location.href = '/vbrick/dashboard'
    } else {
      setLoading(false)
    }
  }, [])

  function handleCTA() {
    setCookie('vbrick_visited', '1', 365)
    window.location.href = '/vbrick/dashboard'
  }

  if (loading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
        <div className="text-white/40 text-sm font-inter">Loading...</div>
      </div>
    )
  }

  // Simple entry page — the real CRO landing page lives at vbrick.streetnotes.ai
  return (
    <div className="min-h-screen font-inter flex flex-col items-center justify-center px-6 relative" style={{ background: 'linear-gradient(180deg, #0c1a2e 0%, #060e1a 100%)' }}>
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }}
      />
      <div className="relative text-center max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Vbrick Command Center
          </span>
        </div>
        <p className="text-slate-500 text-sm mb-10">
          Powered by StreetNotes.ai
        </p>
        <button
          onClick={handleCTA}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-10 py-4 rounded-xl transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
        >
          Enter Command Center
        </button>
      </div>
    </div>
  )
}
