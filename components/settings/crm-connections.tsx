'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { BrutalCard, BrutalButton, BrutalBadge } from '@/components/streetnotes/brutal'

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
        <div className="w-6 h-6 border-4 border-volt border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="bg-volt/20 border-4 border-volt px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider font-bold text-volt">
            {toast}
          </p>
        </div>
      )}

      {Object.entries(CRM_CONFIG).map(([key, config]) => {
        const conn = getConnection(key)
        const crmStages = stages[key]

        return (
          <BrutalCard key={key} variant="white" padded>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-4 h-4 border-2 border-black ${conn ? 'bg-volt' : 'bg-white'}`} />
                <span className="font-display uppercase text-xl text-black leading-none">
                  {config.name}
                </span>
              </div>

              {conn ? (
                <BrutalButton
                  onClick={() => disconnect(key)}
                  disabled={disconnecting === key}
                  variant="danger"
                  size="sm"
                >
                  {disconnecting === key ? 'Disconnecting...' : 'Disconnect'}
                </BrutalButton>
              ) : (
                <a
                  href={config.connectUrl}
                  className="inline-flex items-center justify-center gap-2 font-display uppercase cursor-pointer transition-transform duration-100 bg-black text-volt border-4 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1 px-3 py-2 text-xs min-h-[44px]"
                >
                  Connect
                </a>
              )}
            </div>

            {conn && (
              <div className="mt-3 flex flex-col gap-1 font-mono text-[10px] uppercase tracking-wider text-black/60">
                {conn.instanceUrl && (
                  <span>Org: {conn.instanceUrl.replace('https://', '')}</span>
                )}
                <span>Connected {new Date(conn.connectedAt).toLocaleDateString()}</span>
              </div>
            )}

            {conn && !crmStages && (
              <button
                onClick={() => fetchStages(key)}
                disabled={loadingStages === key}
                className="mt-3 font-mono text-xs uppercase tracking-widest font-bold text-black hover:text-volt text-left min-h-[44px] flex items-center disabled:opacity-50 border-b-2 border-black self-start"
              >
                {loadingStages === key ? 'Loading stages...' : 'Load deal stages →'}
              </button>
            )}

            {crmStages && crmStages.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-black/70">
                  Pipeline Stages
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {crmStages.map((stage, i) => (
                    <BrutalBadge key={i} variant="white">
                      {stage.label}
                    </BrutalBadge>
                  ))}
                </div>
              </div>
            )}
          </BrutalCard>
        )
      })}
    </div>
  )
}
