'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { NeuCard, NeuButton } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
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
    <div className="min-h-screen" style={{ background: neuTheme.colors.bg }}>
      <div className="max-w-2xl mx-auto px-6 py-8 font-satoshi">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push('/vbrick/dashboard')}
            className="cursor-pointer transition-colors"
            style={{ color: neuTheme.colors.text.muted }}
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1
            className="text-[11px] uppercase tracking-[0.2em] font-general-sans font-semibold"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            Settings
          </h1>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <NeuCard>
            <h2 className="text-xs uppercase tracking-widest font-general-sans font-semibold mb-4" style={{ color: neuTheme.colors.accent.primary }}>
              Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-[0.1em] font-satoshi block mb-1" style={{ color: neuTheme.colors.text.muted }}>
                  Email
                </label>
                <p className="text-sm font-satoshi" style={{ color: neuTheme.colors.text.heading }}>{email}</p>
              </div>
              <div>
                <label htmlFor="displayName" className="text-[10px] uppercase tracking-[0.1em] font-satoshi block mb-1" style={{ color: neuTheme.colors.text.muted }}>
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-2xl px-4 py-2 text-sm font-satoshi outline-none"
                  style={{
                    background: neuTheme.colors.bg,
                    boxShadow: neuTheme.shadows.inset,
                    color: neuTheme.colors.text.body,
                    border: 'none',
                  }}
                />
              </div>
            </div>
          </NeuCard>

          {/* CSV Import Mapping */}
          <NeuCard>
            <h2 className="text-xs uppercase tracking-widest font-general-sans font-semibold mb-2" style={{ color: neuTheme.colors.accent.primary }}>
              CSV Import Mapping
            </h2>
            <p className="text-xs font-satoshi mb-4" style={{ color: neuTheme.colors.text.muted }}>
              Map your Salesforce export column headers to StreetNotes fields
            </p>
            <div className="space-y-3">
              {Object.entries(importMapping).map(([key, value]) => (
                <div key={key} className="flex items-center gap-4">
                  <span className="text-xs font-satoshi uppercase tracking-wider w-20" style={{ color: neuTheme.colors.text.muted }}>
                    {key}
                  </span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) =>
                      setImportMapping(prev => ({ ...prev, [key]: e.target.value }))
                    }
                    className="flex-1 rounded-xl px-3 py-2 text-sm font-satoshi outline-none"
                    style={{
                      background: neuTheme.colors.bg,
                      boxShadow: neuTheme.shadows.insetSm,
                      color: neuTheme.colors.text.body,
                      border: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
          </NeuCard>

          {/* CSV Export Columns */}
          <NeuCard>
            <h2 className="text-xs uppercase tracking-widest font-general-sans font-semibold mb-2" style={{ color: neuTheme.colors.accent.primary }}>
              CSV Export Columns
            </h2>
            <p className="text-xs font-satoshi mb-4" style={{ color: neuTheme.colors.text.muted }}>
              Column names used when exporting session data for Salesforce import
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(DEFAULT_EXPORT_MAPPING).map(col => (
                <span
                  key={col}
                  className="text-xs font-fira-code px-2 py-1"
                  style={{
                    background: neuTheme.colors.bg,
                    boxShadow: neuTheme.shadows.insetSm,
                    borderRadius: '8px',
                    color: neuTheme.colors.text.body,
                  }}
                >
                  {col}
                </span>
              ))}
            </div>
          </NeuCard>

          {/* Save button */}
          <NeuButton
            variant="accent"
            size="lg"
            className="w-full"
            onClick={handleSave}
          >
            {saved ? 'Saved' : 'Save Settings'}
          </NeuButton>

          {/* Divider */}
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}, transparent)` }} />

          {/* Session History */}
          <NeuCard>
            <h2 className="text-xs uppercase tracking-widest font-general-sans font-semibold mb-4" style={{ color: neuTheme.colors.accent.primary }}>
              Session History
            </h2>
            {sessions.length === 0 ? (
              <p className="text-sm font-satoshi" style={{ color: neuTheme.colors.text.muted }}>No sessions yet</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-satoshi" style={{ color: neuTheme.colors.text.heading }}>
                        {new Date(s.started_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs font-fira-code" style={{ color: neuTheme.colors.text.muted }}>
                        {s.total_calls} calls | SPIN avg: {Number(s.average_spin).toFixed(1)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/api/vbrick/export/csv?sessionId=${s.id}`}
                        className="text-xs font-satoshi hover:underline cursor-pointer"
                        style={{ color: neuTheme.colors.accent.primary }}
                        download
                      >
                        CSV
                      </a>
                      <a
                        href={`/api/vbrick/export/pdf?sessionId=${s.id}`}
                        className="text-xs font-satoshi hover:underline cursor-pointer"
                        style={{ color: neuTheme.colors.accent.primary }}
                        download
                      >
                        PDF
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </NeuCard>
        </div>
      </div>
    </div>
  )
}
