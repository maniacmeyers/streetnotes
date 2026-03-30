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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#e0e5ec' }}>
        <div className="text-sm font-satoshi" style={{ color: '#636e72' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-satoshi flex flex-col items-center justify-center px-6 relative" style={{ background: '#e0e5ec' }}>
      <div className="relative text-center max-w-lg">
        <div
          className="p-10"
          style={{
            background: '#e0e5ec',
            boxShadow: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
            borderRadius: '28px',
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className="flex-shrink-0 rounded-xl flex items-center justify-center"
              style={{ background: '#6366f1', width: 40, height: 40 }}
            >
              <svg width={20} height={20} fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="font-general-sans font-bold text-xl tracking-tight" style={{ color: '#2d3436' }}>
              Vbrick Command Center
            </span>
          </div>
          <p className="text-sm mb-10" style={{ color: '#636e72' }}>
            Powered by StreetNotes.ai
          </p>
          <button
            onClick={handleCTA}
            className="text-white font-general-sans font-bold text-base px-10 py-4 rounded-2xl transition-all duration-300 cursor-pointer"
            style={{
              background: '#6366f1',
              boxShadow: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
            }}
          >
            Enter Command Center
          </button>
        </div>
      </div>
    </div>
  )
}
