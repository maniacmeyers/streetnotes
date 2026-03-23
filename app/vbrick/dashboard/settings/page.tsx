'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { GlassCard } from '@/components/vbrick/glass-card'
import { LuminousDivider } from '@/components/vbrick/luminous-divider'
import AuroraBackground from '@/components/vbrick/aurora-background'
import { DEFAULT_IMPORT_MAPPING, DEFAULT_EXPORT_MAPPING } from '@/lib/vbrick/csv-parser'

export default function SettingsPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [importMapping, setImportMapping] = useState(DEFAULT_IMPORT_MAPPING)
  const [saved, setSaved] = useState(false)
  const [sessions, setSessions] = useState<Array<{
    id: string
    started_at: string
    ended_at: string | null
    total_calls: number
    average_spin: number
  }>>([])

  useEffect(() => {
    const storedEmail = localStorage.getItem('vbrick_email') || ''
    setEmail(storedEmail)
    setDisplayName(localStorage.getItem('vbrick_display_name') || storedEmail.split('@')[0] || '')

    const savedMapping = localStorage.getItem('vbrick_import_mapping')
    if (savedMapping) {
      try { setImportMapping(JSON.parse(savedMapping)) } catch {}
    }

    // Fetch session history
    if (storedEmail) {
      fetch(`/api/vbrick/session?email=${encodeURIComponent(storedEmail)}&history=true`)
        .then(r => r.json())
        .then(data => {
          if (data.sessions) setSessions(data.sessions)
        })
        .catch(() => {})
    }
  }, [])

  function handleSave() {
    localStorage.setItem('vbrick_display_name', displayName)
    localStorage.setItem('vbrick_import_mapping', JSON.stringify(importMapping))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AuroraBackground className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-8 font-inter">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/vbrick/dashboard')}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[11px] uppercase tracking-[0.2em] text-[#7ed4f7] font-medium">
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <GlassCard title="Profile">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-inter block mb-1">
                  Email
                </label>
                <p className="text-white text-sm font-inter">{email}</p>
              </div>
              <div>
                <label htmlFor="displayName" className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-inter block mb-1">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm font-inter focus:border-[#7ed4f7] focus:outline-none focus:ring-2 focus:ring-[#7ed4f7]/15"
                />
              </div>
            </div>
          </GlassCard>

          {/* CSV Import Mapping */}
          <GlassCard title="CSV Import Mapping">
            <p className="text-gray-400 text-xs font-inter mb-4">
              Map your Salesforce export column headers to StreetNotes fields
            </p>
            <div className="space-y-3">
              {Object.entries(importMapping).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="text-gray-400 text-xs font-inter uppercase tracking-wider w-20">
                    {key}
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setImportMapping(prev => ({ ...prev, [key]: e.target.value }))
                    }
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-inter focus:border-[#7ed4f7] focus:outline-none focus:ring-2 focus:ring-[#7ed4f7]/15"
                  />
                </div>
              ))}
            </div>
          </GlassCard>

          {/* CSV Export Columns */}
          <GlassCard title="CSV Export Columns">
            <p className="text-gray-400 text-xs font-inter mb-4">
              Column names used when exporting session data for Salesforce import
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(DEFAULT_EXPORT_MAPPING).map(col => (
                <span key={col} className="text-gray-300 text-xs font-fira-code bg-white/5 px-2 py-1 rounded">
                  {col}
                </span>
              ))}
            </div>
          </GlassCard>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-opacity hover:opacity-90"
            style={{ backgroundColor: saved ? '#22C55E' : '#7ed4f7', color: '#061222' }}
          >
            {saved ? 'Saved' : 'Save Settings'}
          </button>

          <LuminousDivider />

          {/* Session History */}
          <GlassCard title="Session History">
            {sessions.length === 0 ? (
              <p className="text-gray-500 text-sm font-inter">No sessions yet</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-white text-sm font-inter">
                        {new Date(s.started_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-500 text-xs font-fira-code">
                        {s.total_calls} calls | SPIN avg: {Number(s.average_spin).toFixed(1)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/api/vbrick/export/csv?sessionId=${s.id}`}
                        className="text-[#7ed4f7] text-xs font-inter hover:underline cursor-pointer"
                        download
                      >
                        CSV
                      </a>
                      <a
                        href={`/api/vbrick/export/pdf?sessionId=${s.id}`}
                        className="text-[#7ed4f7] text-xs font-inter hover:underline cursor-pointer"
                        download
                      >
                        PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </AuroraBackground>
  )
}
