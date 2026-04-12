'use client'

import { useState, useEffect, useCallback } from 'react'

interface Preferences {
  crm_type: string | null
  pipeline_id: string | null
  pipeline_label: string | null
  timezone: string
}

interface Pipeline {
  id: string
  label: string
  stageIds: string[]
}

const GLASS_BASE =
  'rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]'
const GLASS_VOLT =
  'rounded-2xl border border-volt/22 bg-gradient-to-br from-volt/8 via-white/5 to-volt/3 backdrop-blur-xl shadow-[0_24px_80px_-20px_rgba(0,230,118,0.25),inset_0_1px_0_rgba(255,255,255,0.22)]'

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Berlin', label: 'Central Europe (CET)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' },
]

export default function UserSetup() {
  const [prefs, setPrefs] = useState<Preferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [loadingPipelines, setLoadingPipelines] = useState(false)

  const fetchPrefs = useCallback(async () => {
    const res = await fetch('/api/user/preferences')
    if (res.ok) {
      const data = await res.json()
      setPrefs(data.preferences)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPrefs()
  }, [fetchPrefs])

  // Load pipelines when CRM is selected and schema is available
  useEffect(() => {
    if (!prefs?.crm_type) {
      setPipelines([])
      return
    }
    setLoadingPipelines(true)
    fetch(`/api/crm/schema?crmType=${prefs.crm_type}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.schema?.pipelines) {
          setPipelines(data.schema.pipelines)
        } else {
          setPipelines([])
        }
      })
      .catch(() => setPipelines([]))
      .finally(() => setLoadingPipelines(false))
  }, [prefs?.crm_type])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const save = async (updates: Partial<{ crmType: string | null; pipelineId: string | null; pipelineLabel: string | null; timezone: string }>) => {
    setSaving(true)
    const res = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      setPrefs(prev => prev ? {
        ...prev,
        crm_type: updates.crmType !== undefined ? updates.crmType : prev.crm_type,
        pipeline_id: updates.pipelineId !== undefined ? updates.pipelineId : prev.pipeline_id,
        pipeline_label: updates.pipelineLabel !== undefined ? updates.pipelineLabel : prev.pipeline_label,
        timezone: updates.timezone ?? prev.timezone,
      } : prev)
      setToast('Saved.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-volt border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const selectedCrm = prefs?.crm_type

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="rounded-xl border border-volt/40 bg-volt/15 backdrop-blur-md px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt">
            {toast}
          </p>
        </div>
      )}

      {/* CRM Selection */}
      <div className={`${GLASS_BASE} p-5 flex flex-col gap-4`}>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
            Your CRM
          </p>
          <p className="font-body text-sm text-white/40 mt-1">
            Pick the CRM your team uses. This controls where notes get pushed.
          </p>
        </div>
        <div className="flex gap-3">
          {(['salesforce', 'hubspot'] as const).map(crm => {
            const isSelected = selectedCrm === crm
            const label = crm === 'salesforce' ? 'Salesforce' : 'HubSpot'
            return (
              <button
                key={crm}
                type="button"
                onClick={() => {
                  if (isSelected) return
                  void save({ crmType: crm, pipelineId: null, pipelineLabel: null })
                }}
                disabled={saving}
                aria-pressed={isSelected}
                className={`flex-1 rounded-xl border px-4 py-4 font-display uppercase text-lg transition min-h-[44px] ${
                  isSelected
                    ? 'border-volt/50 bg-volt/15 text-volt shadow-[0_8px_24px_-8px_rgba(0,230,118,0.3)]'
                    : 'border-white/12 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pipeline Picker — only shows after CRM is selected */}
      {selectedCrm && (
        <div className={`${selectedCrm ? GLASS_VOLT : GLASS_BASE} p-5 flex flex-col gap-4`}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
              Default Pipeline
            </p>
            <p className="font-body text-sm text-white/40 mt-1">
              Which pipeline should new deals land in?
            </p>
          </div>
          {loadingPipelines ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-volt border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">Loading pipelines...</span>
            </div>
          ) : pipelines.length > 0 ? (
            <select
              value={prefs?.pipeline_id ?? ''}
              onChange={e => {
                const selected = pipelines.find(p => p.id === e.target.value)
                void save({
                  pipelineId: e.target.value || null,
                  pipelineLabel: selected?.label ?? null,
                })
              }}
              disabled={saving}
              aria-label="Select default pipeline"
              className="rounded-xl border border-white/15 bg-black/60 text-white/90 font-mono text-sm px-4 py-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-volt/50"
            >
              <option value="">Select a pipeline</option>
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          ) : (
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
              {selectedCrm === 'hubspot' ? 'No pipelines loaded yet. Your admin may need to connect HubSpot first.' : 'Pipeline selection is automatic for Salesforce.'}
            </p>
          )}
          {prefs?.pipeline_label && (
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-volt/80">
              Current: {prefs.pipeline_label}
            </p>
          )}
        </div>
      )}

      {/* Time Zone */}
      <div className={`${GLASS_BASE} p-5 flex flex-col gap-4`}>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
            Time Zone
          </p>
          <p className="font-body text-sm text-white/40 mt-1">
            Used for date inference and export timestamps.
          </p>
        </div>
        <select
          value={prefs?.timezone ?? 'America/New_York'}
          onChange={e => void save({ timezone: e.target.value })}
          disabled={saving}
          aria-label="Select your time zone"
          className="rounded-xl border border-white/15 bg-black/60 text-white/90 font-mono text-sm px-4 py-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-volt/50"
        >
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
