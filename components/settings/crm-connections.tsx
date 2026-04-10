'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

interface CrmConnection {
  crmType: string
  instanceUrl: string | null
  connectedAt: string
  lastRefreshed: string
  tokenExpiresAt: string | null
}

interface CrmStage {
  label: string
  value?: string
  stageId?: string
}

const CRM_CONFIG = {
  salesforce: {
    name: 'Salesforce',
    connectUrl: '/api/auth/salesforce/connect',
  },
  hubspot: {
    name: 'HubSpot',
    connectUrl: '/api/auth/hubspot/connect',
  },
  pipedrive: {
    name: 'Pipedrive',
    connectUrl: '/api/auth/pipedrive/connect',
  },
} as const

const GLASS_BASE =
  'rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]'
const GLASS_VOLT =
  'rounded-2xl border border-volt/22 bg-gradient-to-br from-volt/8 via-white/5 to-volt/3 backdrop-blur-xl shadow-[0_24px_80px_-20px_rgba(0,230,118,0.25),inset_0_1px_0_rgba(255,255,255,0.22)]'
const BTN_VOLT =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-volt/50 bg-volt/15 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-volt/25 disabled:opacity-40 disabled:cursor-not-allowed'
const BTN_GHOST_RED =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md transition hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-300 disabled:opacity-40'

export default function CrmConnections() {
  const searchParams = useSearchParams()
  const [connections, setConnections] = useState<CrmConnection[]>([])
  const [stages, setStages] = useState<Record<string, CrmStage[]>>({})
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [loadingStages, setLoadingStages] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const connected = searchParams.get('connected')
  const error = searchParams.get('error')

  const fetchConnections = useCallback(async () => {
    const res = await fetch('/api/crm/connections')
    if (res.ok) {
      const data = await res.json()
      setConnections(data.connections)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchConnections()
  }, [fetchConnections])

  useEffect(() => {
    if (connected) {
      setToast(`${CRM_CONFIG[connected as keyof typeof CRM_CONFIG]?.name || connected} connected.`)
      // Clear the query param without a full reload
      window.history.replaceState({}, '', '/settings')
    }
    if (error) {
      const messages: Record<string, string> = {
        csrf_mismatch: 'Security check failed. Try again.',
        token_exchange_failed: 'Failed to connect. Try again.',
        db_save_failed: 'Failed to save connection. Try again.',
        no_code: 'Authorization was cancelled.',
      }
      setToast(messages[error] || `Connection error: ${error}`)
      window.history.replaceState({}, '', '/settings')
    }
  }, [connected, error])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const getConnection = (crmType: string) =>
    connections.find((c) => c.crmType === crmType)

  const disconnect = async (crmType: string) => {
    setDisconnecting(crmType)
    const res = await fetch(`/api/crm/connections?crm=${crmType}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setConnections((prev) => prev.filter((c) => c.crmType !== crmType))
      setStages((prev) => {
        const next = { ...prev }
        delete next[crmType]
        return next
      })
      setToast(`${CRM_CONFIG[crmType as keyof typeof CRM_CONFIG]?.name} disconnected.`)
    }
    setDisconnecting(null)
  }

  const fetchStages = async (crmType: string) => {
    setLoadingStages(crmType)
    const res = await fetch(`/api/crm/stages?crm=${crmType}`)
    if (res.ok) {
      const data = await res.json()
      // Normalize stages: SF returns flat array, HS returns pipeline array
      const stageList = crmType === 'hubspot' && Array.isArray(data.stages)
        ? data.stages.flatMap((p: { stages: CrmStage[] }) => p.stages)
        : data.stages
      setStages((prev) => ({ ...prev, [crmType]: stageList }))
    }
    setLoadingStages(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-volt border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="rounded-xl border border-volt/40 bg-volt/15 backdrop-blur-md px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt">
            {toast}
          </p>
        </div>
      )}

      {Object.entries(CRM_CONFIG).map(([key, config]) => {
        const conn = getConnection(key)
        const crmStages = stages[key]
        const cardClass = conn ? GLASS_VOLT : GLASS_BASE

        return (
          <div key={key} className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    conn
                      ? 'bg-volt shadow-[0_0_10px_rgba(0,230,118,0.8)]'
                      : 'bg-white/20'
                  }`}
                />
                <span className="font-display uppercase text-xl text-white leading-none">
                  {config.name}
                </span>
                <span
                  className={`inline-block rounded-md px-2 py-1 font-mono text-[9px] uppercase tracking-[0.15em] font-bold ${
                    conn
                      ? 'border border-volt/40 bg-volt/15 text-volt backdrop-blur-md'
                      : 'border border-white/15 bg-white/5 text-white/50 backdrop-blur-md'
                  }`}
                >
                  {conn ? 'Connected' : 'Not connected'}
                </span>
              </div>

              {conn ? (
                <button
                  type="button"
                  onClick={() => disconnect(key)}
                  disabled={disconnecting === key}
                  className={BTN_GHOST_RED}
                >
                  {disconnecting === key ? 'Disconnecting...' : 'Disconnect'}
                </button>
              ) : (
                <a href={config.connectUrl} className={BTN_VOLT}>
                  Connect
                </a>
              )}
            </div>

            {conn && (
              <div className="mt-3 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                {conn.instanceUrl && (
                  <span>Org: {conn.instanceUrl.replace('https://', '')}</span>
                )}
                <span>Connected {new Date(conn.connectedAt).toLocaleDateString()}</span>
              </div>
            )}

            {conn && !crmStages && (
              <button
                type="button"
                onClick={() => fetchStages(key)}
                disabled={loadingStages === key}
                className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/60 hover:text-volt text-left min-h-[44px] flex items-center disabled:opacity-50 underline underline-offset-4 self-start"
              >
                {loadingStages === key ? 'Loading stages...' : 'Load deal stages →'}
              </button>
            )}

            {crmStages && crmStages.length > 0 && (
              <div className="mt-4 rounded-xl border border-white/6 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-3 flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
                  Pipeline Stages
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {crmStages.map((stage, i) => (
                    <span
                      key={i}
                      className="inline-block rounded-md border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md"
                    >
                      {stage.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
