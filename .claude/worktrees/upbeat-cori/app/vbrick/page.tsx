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
      window.location.href = '/debrief'
    } else {
      setLoading(false)
    }
  }, [])

  function handleCTA() {
    setCookie('vbrick_visited', '1', 365)
    window.location.href = '/debrief'
  }

  if (loading || shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#061222' }}>
        <div className="text-white/60 text-sm font-sans">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#061222' }}>
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="text-white font-bold text-sm uppercase tracking-wider">
          Vbrick Command Center
        </span>
        <span className="text-gray-500 text-xs">
          Powered by StreetNotes.ai
        </span>
      </header>

      {/* Hero */}
      <section className="w-full max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          Your team makes 200 calls a week. Salesforce captures maybe 20% of what actually happened.
        </h1>
        <p className="mt-6 text-gray-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
          The other 80% dies in the parking lot. Your forecast is built on whatever your reps remembered to type at the end of the day. That&apos;s not a CRM problem. That&apos;s an intelligence problem.
        </p>
      </section>

      {/* Fix Section */}
      <section className="w-full max-w-2xl mx-auto px-6 pb-16 text-center">
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
          Vbrick Command Center gives every BDR a 60-second post-call debrief. AI extracts the CRM data, scores their questioning technique, and generates AE-ready briefings. No typing. No training. No behavior change — just talk.
        </p>
      </section>

      {/* Stat Cards */}
      <section className="w-full max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            className="rounded-lg border border-white/10 p-8 text-center"
            style={{ backgroundColor: '#0d1e3a' }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: '#7ed4f7' }}>
              100%
            </div>
            <div className="text-gray-400 text-sm">of calls captured</div>
          </div>
          <div
            className="rounded-lg border border-white/10 p-8 text-center"
            style={{ backgroundColor: '#0d1e3a' }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: '#7ed4f7' }}>
              S.P.I.N.
            </div>
            <div className="text-gray-400 text-sm">scored every call</div>
          </div>
          <div
            className="rounded-lg border border-white/10 p-8 text-center"
            style={{ backgroundColor: '#0d1e3a' }}
          >
            <div className="text-3xl font-bold mb-2" style={{ color: '#7ed4f7' }}>
              AE Brief
            </div>
            <div className="text-gray-400 text-sm">generated automatically</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-4xl mx-auto px-6 pb-24 text-center">
        <button
          onClick={handleCTA}
          className="font-bold uppercase text-sm rounded-lg px-8 py-4 cursor-pointer transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#7ed4f7', color: '#061222' }}
        >
          See it in action &rarr;
        </button>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/5">
        <span className="text-gray-500 text-xs">Powered by StreetNotes.ai</span>
        <span className="text-gray-500 text-xs">Confidential</span>
      </footer>
    </div>
  )
}
