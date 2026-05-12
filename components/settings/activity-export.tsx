'use client'

import { useState, useCallback } from 'react'

interface ExportLog {
  id: string
  flavor: string
  row_count: number
  byte_size: number
  created_at: string
}

const GLASS_BASE =
  'fg-card'
const BTN_VOLT =
  'fg-action'

type Preset = 'new' | 'today' | 'week' | 'all'

const FLAVOR = 'salesforce' as const

function startOfToday(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function startOfWeek(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1 // Monday = start of week
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const PRESET_LABELS: Record<Preset, string> = {
  new: 'Not yet exported',
  today: 'Today',
  week: 'This week',
  all: 'All time',
}

export default function ActivityExport() {
  const [preset, setPreset] = useState<Preset>('new')
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentExports, setRecentExports] = useState<ExportLog[]>([])
  const [showRecent, setShowRecent] = useState(false)

  const buildParams = useCallback((): URLSearchParams => {
    const params = new URLSearchParams({ flavor: FLAVOR })
    switch (preset) {
      case 'new':
        params.set('unexported', 'true')
        break
      case 'today':
        params.set('from', startOfToday())
        break
      case 'week':
        params.set('from', startOfWeek())
        break
      case 'all':
        break
    }
    return params
  }, [preset])

  const handleDownload = async () => {
    setDownloading(true)
    setError(null)
    try {
      const params = buildParams()
      const res = await fetch(`/api/notes/export?${params}`)

      if (res.status === 429) {
        setError('Rate limited. Try again in an hour.')
        return
      }
      if (!res.ok) {
        setError('Export failed. Try again.')
        return
      }

      const blob = await res.blob()
      if (blob.size === 0) {
        setError('Nothing to export.')
        return
      }

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `field-glow-${FLAVOR}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setError('Network error. Check your connection.')
    } finally {
      setDownloading(false)
    }
  }

  const loadRecentExports = async () => {
    if (showRecent) {
      setShowRecent(false)
      return
    }
    const res = await fetch('/api/crm/export-log')
    if (res.ok) {
      const data = await res.json()
      setRecentExports(data.exports ?? [])
    }
    setShowRecent(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`${GLASS_BASE} flex flex-col gap-5 p-[22px]`}>
        {/* Export scope */}
        <div className="flex flex-col gap-2">
          <p className="text-[16px] font-extrabold text-[#1A1410]">
            What to export
          </p>
          <div className="flex flex-col gap-2">
            {(['new', 'today', 'week', 'all'] as const).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setPreset(key)}
                className={`min-h-[48px] rounded-full px-3 py-2 text-sm font-extrabold transition active:scale-[0.98] ${
                  preset === key
                    ? 'bg-[#A8855A] text-[#FAF6EE]'
                    : 'fg-convex text-[#8B6B40]'
                }`}
                aria-pressed={preset === key}
              >
                {PRESET_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Download button */}
        <button
          type="button"
          onClick={() => void handleDownload()}
          disabled={downloading}
          className={BTN_VOLT}
          aria-busy={downloading}
        >
          {downloading ? 'Exporting...' : 'Download Salesforce CSV'}
        </button>

        {error && (
          <p className="text-sm font-extrabold text-[#8B6B40]">
            {error}
          </p>
        )}

        {/* Recent exports toggle */}
        <button
          type="button"
          onClick={() => void loadRecentExports()}
          className="flex min-h-[48px] items-center gap-2 self-start text-sm font-extrabold text-[#8B6B40] transition"
          aria-expanded={showRecent}
        >
          {showRecent ? 'Hide recent exports' : 'Recent exports'}
          <svg
            className={`h-4 w-4 transition-transform ${showRecent ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showRecent && recentExports.length > 0 && (
          <div className="flex flex-col gap-2">
            {recentExports.map(exp => (
              <div
                key={exp.id}
                className="fg-inset flex items-center justify-between px-3 py-2"
              >
                <div className="flex flex-col">
                  <p className="text-xs font-bold text-[#3D332A]">
                    {new Date(exp.created_at).toLocaleDateString()} · {exp.flavor}
                  </p>
                  <p className="text-xs text-[#3D332A]/70">
                    {exp.row_count} rows · {formatBytes(exp.byte_size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showRecent && recentExports.length === 0 && (
          <p className="text-sm text-[#3D332A]">
            No exports yet.
          </p>
        )}
      </div>
    </div>
  )
}
