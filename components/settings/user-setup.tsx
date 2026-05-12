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
  'fg-card'
const GLASS_VOLT =
  'fg-featured-card'

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

  // Salesforce-only: always fetch the SF schema once prefs have loaded
  useEffect(() => {
    if (!prefs) return
    setLoadingPipelines(true)
    fetch(`/api/crm/schema?crmType=salesforce`)
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
  }, [prefs])

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
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#A8855A] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="fg-card-sm px-4 py-3">
          <p className="text-sm font-extrabold text-[#8B6B40]">
            {toast}
          </p>
        </div>
      )}

      {/* Pipeline Picker — Salesforce only */}
      <div className={`${GLASS_VOLT} flex flex-col gap-4 p-[22px]`}>
        <div>
          <p className="text-[16px] font-extrabold text-[#1A1410]">
            Salesforce Pipeline
          </p>
          <p className="mt-1 text-sm leading-6 text-[#3D332A]">
            Which pipeline should new deals land in?
          </p>
        </div>
        {loadingPipelines ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#A8855A] border-t-transparent" />
            <span className="text-sm text-[#3D332A]">Loading pipelines...</span>
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
            className="fg-input"
          >
            <option value="">Select a pipeline</option>
            {pipelines.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        ) : (
          <p className="text-sm leading-6 text-[#3D332A]">
            Pipeline selection is automatic for Salesforce.
          </p>
        )}
        {prefs?.pipeline_label && (
          <p className="text-sm font-extrabold text-[#8B6B40]">
            Current: {prefs.pipeline_label}
          </p>
        )}
      </div>

      {/* Time Zone */}
      <div className={`${GLASS_BASE} flex flex-col gap-4 p-[22px]`}>
        <div>
          <p className="text-[16px] font-extrabold text-[#1A1410]">
            Time Zone
          </p>
          <p className="mt-1 text-sm leading-6 text-[#3D332A]">
            Used for date inference and export timestamps.
          </p>
        </div>
        <select
          value={prefs?.timezone ?? 'America/New_York'}
          onChange={e => void save({ timezone: e.target.value })}
          disabled={saving}
          aria-label="Select your time zone"
          className="fg-input"
        >
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
