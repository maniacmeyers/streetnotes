'use client'

import { useState, useCallback, useEffect } from 'react'

interface ExportLog {
  id: string
  flavor: string
  row_count: number
  byte_size: number
  created_at: string
}

const GLASS_BASE =
  'rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]'
const BTN_VOLT =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-volt/50 bg-volt/15 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-volt/25 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]'

type Flavor = 'hubspot' | 'salesforce'
type Preset = 'new' | 'today' | 'week' | 'all'

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
  const [flavor, setFlavor] = useState<Flavor>('hubspot')
  const [preset, setPreset] = useState<Preset>('new')
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentExports, setRecentExports] = useState<ExportLog[]>([])
  const [showRecent, setShowRecent] = useState(false)
  const [hasConnectedCrm, setHasConnectedCrm] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/crm/connections')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.connections) {
          setHasConnectedCrm(data.connections.length > 0)
        } else {
          setHasConnectedCrm(false)
        }
      })
      .catch(() => setHasConnectedCrm(false))
  }, [])

  const buildParams = useCallback((): URLSearchParams => {
    const params = new URLSearchParams({ flavor })
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
  }, [preset, flavor])

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
      a.download = `streetnotes-${flavor}-${new Date().toISOString().slice(0, 10)}.csv`
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
      {hasConnectedCrm === false && (
        <div
          className="rounded-xl border border-amber-500/20 bg-amber-500/8 backdrop-blur-md px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <p className="font-body text-sm text-amber-200/90">
            Your admin hasn&apos;t approved native CRM push yet. Use this export to get your call
            activity into HubSpot or Salesforce in the meantime. When the admin green-lights
            OAuth, native push turns on automatically.
          </p>
        </div>
      )}

      <div className={`${GLASS_BASE} p-5 flex flex-col gap-5`}>
        {/* Flavor selector */}
        <div className="flex gap-2">
          {(['hubspot', 'salesforce'] as const).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFlavor(f)}
              className={`flex-1 rounded-xl border px-3 py-2.5 font-mono text-xs uppercase tracking-[0.15em] font-bold transition min-h-[44px] ${
                flavor === f
                  ? 'border-volt/50 bg-volt/15 text-volt'
                  : 'border-white/12 bg-white/5 text-white/60 hover:bg-white/10'
              }`}
              aria-pressed={flavor === f}
            >
              {f === 'hubspot' ? 'HubSpot' : 'Salesforce'}
            </button>
          ))}
        </div>

        {/* Export scope */}
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
            What to export
          </p>
          <div className="flex gap-2 flex-wrap">
            {(['new', 'today', 'week', 'all'] as const).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setPreset(key)}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] font-bold transition min-h-[44px] ${
                  preset === key
                    ? 'border-volt/40 bg-volt/10 text-volt'
                    : 'border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/5'
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
          {downloading ? 'Exporting...' : `Download ${flavor === 'hubspot' ? 'HubSpot' : 'Salesforce'} CSV`}
        </button>

        {error && (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-red-400">
            {error}
          </p>
        )}

        {/* Recent exports toggle */}
        <button
          type="button"
          onClick={() => void loadRecentExports()}
          className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/40 hover:text-white/70 transition self-start min-h-[44px]"
        >
          {showRecent ? 'Hide recent exports' : 'Recent exports'}
        </button>

        {showRecent && recentExports.length > 0 && (
          <div className="flex flex-col gap-2">
            {recentExports.map(exp => (
              <div
                key={exp.id}
                className="rounded-lg border border-white/6 bg-black/30 px-3 py-2 flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/60">
                    {new Date(exp.created_at).toLocaleDateString()} · {exp.flavor}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                    {exp.row_count} rows · {formatBytes(exp.byte_size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showRecent && recentExports.length === 0 && (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            No exports yet.
          </p>
        )}
      </div>
    </div>
  )
}
