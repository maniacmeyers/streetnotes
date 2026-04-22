'use client'

import { useState, useEffect } from 'react'
import { NeuCard, NeuButton } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { DEFAULT_IMPORT_MAPPING, DEFAULT_EXPORT_MAPPING } from '@/lib/vbrick/csv-parser'

export default function SettingsPage() {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [importMapping, setImportMapping] = useState(DEFAULT_IMPORT_MAPPING)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const storedEmail = localStorage.getItem('vbrick_email') || ''
    setEmail(storedEmail)
    setDisplayName(localStorage.getItem('vbrick_display_name') || storedEmail.split('@')[0] || '')

    const savedMapping = localStorage.getItem('vbrick_import_mapping')
    if (savedMapping) {
      try { setImportMapping(JSON.parse(savedMapping)) } catch {}
    }
  }, [])

  function handleSave() {
    localStorage.setItem('vbrick_display_name', displayName)
    localStorage.setItem('vbrick_import_mapping', JSON.stringify(importMapping))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      <h1 className="font-general-sans font-bold text-2xl tracking-tight" style={{ color: '#2d3436' }}>
        Settings
      </h1>
      <div className="max-w-2xl font-satoshi">
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
        </div>
      </div>
    </div>
  )
}
