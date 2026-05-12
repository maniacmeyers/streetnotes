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
} as const

const GLASS_BASE =
  'fg-card'
const GLASS_VOLT =
  'fg-featured-card'
const BTN_VOLT =
  'fg-action'
const BTN_GHOST_RED =
  'fg-secondary-action px-4'

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
      setStages((prev) => ({ ...prev, [crmType]: data.stages }))
    }
    setLoadingStages(null)
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

      {Object.entries(CRM_CONFIG).map(([key, config]) => {
        const conn = getConnection(key)
        const crmStages = stages[key]
        const cardClass = conn ? GLASS_VOLT : GLASS_BASE

        return (
          <div key={key} className={`${cardClass} p-[22px]`}>
            <div className="flex flex-col gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    conn
                      ? 'bg-[#A8855A] shadow-[0_10px_18px_rgba(168,133,90,0.28)]'
                      : 'bg-[#D4A28A]/45'
                  }`}
                />
                <span className="text-xl font-extrabold tracking-[-0.02em] text-[#1A1410]">
                  {config.name}
                </span>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-[11px] font-extrabold ${
                    conn
                      ? 'bg-[#A8855A] text-[#FAF6EE]'
                      : 'bg-[#D4A28A]/24 text-[#8B6B40]'
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
              <div className="mt-3 flex flex-col gap-1 text-xs font-bold text-[#3D332A]">
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
                className="mt-3 flex min-h-[48px] items-center self-start text-left text-sm font-extrabold text-[#8B6B40] underline underline-offset-4 disabled:opacity-50"
              >
                {loadingStages === key ? 'Loading stages...' : 'Load deal stages'}
              </button>
            )}

            {crmStages && crmStages.length > 0 && (
              <div className="fg-inset mt-4 flex flex-col gap-2 px-4 py-3">
                <span className="text-xs font-extrabold text-[#3D332A]">
                  Pipeline Stages
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {crmStages.map((stage, i) => (
                    <span
                      key={i}
                      className="inline-block rounded-full bg-[#D4A28A]/24 px-3 py-1 text-xs font-extrabold text-[#8B6B40]"
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
