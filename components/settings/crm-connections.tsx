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
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700',
  },
  hubspot: {
    name: 'HubSpot',
    connectUrl: '/api/auth/hubspot/connect',
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
  },
  pipedrive: {
    name: 'Pipedrive',
    connectUrl: '/api/auth/pipedrive/connect',
    color: 'bg-green-600',
    hoverColor: 'hover:bg-green-700',
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
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && (
        <div className="px-4 py-3 rounded-lg bg-gray-100 text-sm text-gray-800">
          {toast}
        </div>
      )}

      {Object.entries(CRM_CONFIG).map(([key, config]) => {
        const conn = getConnection(key)
        const crmStages = stages[key]

        return (
          <div
            key={key}
            className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${conn ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="font-semibold text-base">{config.name}</span>
              </div>

              {conn ? (
                <button
                  onClick={() => disconnect(key)}
                  disabled={disconnecting === key}
                  className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 min-h-[44px] disabled:opacity-50"
                >
                  {disconnecting === key ? 'Disconnecting...' : 'Disconnect'}
                </button>
              ) : (
                <a
                  href={config.connectUrl}
                  className={`px-4 py-2 text-sm rounded-lg text-white min-h-[44px] flex items-center ${config.color} ${config.hoverColor}`}
                >
                  Connect
                </a>
              )}
            </div>

            {conn && (
              <div className="text-xs text-gray-500 flex flex-col gap-1">
                {conn.instanceUrl && (
                  <span>Org: {conn.instanceUrl.replace('https://', '')}</span>
                )}
                <span>
                  Connected {new Date(conn.connectedAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {conn && !crmStages && (
              <button
                onClick={() => fetchStages(key)}
                disabled={loadingStages === key}
                className="text-sm text-blue-600 hover:text-blue-800 text-left min-h-[44px] flex items-center disabled:opacity-50"
              >
                {loadingStages === key ? 'Loading stages...' : 'Load deal stages'}
              </button>
            )}

            {crmStages && crmStages.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Pipeline Stages
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {crmStages.map((stage, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-gray-100 rounded-md text-gray-700"
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
