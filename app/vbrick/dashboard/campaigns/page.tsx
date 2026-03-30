'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Plus, Loader2, Sparkles, CheckCircle, FileText, Megaphone } from 'lucide-react'
import { NeuCard, NeuButton, NeuTabs, NeuBadge, NeuInput, NeuTextarea } from '@/components/vbrick/neu'
import { FileUploader } from '@/components/vbrick/campaigns/file-uploader'
import { ChannelViewer } from '@/components/vbrick/campaigns/channel-viewer'
import { ContactPersonalizer } from '@/components/vbrick/campaigns/contact-personalizer'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer } from '@/lib/vbrick/animations'
import type { Campaign, CampaignFile, CampaignChannel } from '@/lib/vbrick/campaign-types'
import { STATUS_LABELS } from '@/lib/vbrick/campaign-types'

type PageView = 'list' | 'create' | 'detail'
type DetailTab = 'files' | 'messaging' | 'personalize'

export default function CampaignsPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [view, setView] = useState<PageView>('list')
  const [detailTab, setDetailTab] = useState<DetailTab>('files')

  // List state
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  // Detail state
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [files, setFiles] = useState<CampaignFile[]>([])
  const [channels, setChannels] = useState<CampaignChannel[]>([])

  // Create form
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formEventName, setFormEventName] = useState('')
  const [formTargetAudience, setFormTargetAudience] = useState('')
  const [creating, setCreating] = useState(false)

  // Generate state
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('vbrick_email')
    if (stored) setEmail(stored)
  }, [])

  const isJeff = email === 'jeff@forgetime.ai'

  const fetchCampaigns = useCallback(async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch(`/api/vbrick/campaigns?email=${encodeURIComponent(email)}`)
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.campaigns || [])
      }
    } finally {
      setLoading(false)
    }
  }, [email])

  const fetchCampaignDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/vbrick/campaigns/${id}`)
    if (res.ok) {
      const data = await res.json()
      setActiveCampaign(data.campaign)
      setFiles(data.files || [])
      setChannels(data.channels || [])
    }
  }, [])

  useEffect(() => {
    if (email) fetchCampaigns()
  }, [email, fetchCampaigns])

  // Handlers
  async function handleCreate() {
    if (!email || !formName.trim()) return
    setCreating(true)

    const res = await fetch('/api/vbrick/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formName.trim(),
        description: formDescription.trim() || null,
        event_name: formEventName.trim() || null,
        target_audience: formTargetAudience.trim() || null,
        email,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setActiveCampaign(data.campaign)
      setFiles([])
      setChannels([])
      setView('detail')
      setDetailTab('files')
      // Reset form
      setFormName('')
      setFormDescription('')
      setFormEventName('')
      setFormTargetAudience('')
    }
    setCreating(false)
  }

  function handleOpenCampaign(campaign: Campaign) {
    setActiveCampaign(campaign)
    fetchCampaignDetail(campaign.id)
    setView('detail')
    setDetailTab(campaign.status === 'draft' ? 'files' : 'messaging')
  }

  async function handleGenerate() {
    if (!activeCampaign) return
    setGenerating(true)
    setGenerateError(null)

    try {
      const res = await fetch(`/api/vbrick/campaigns/${activeCampaign.id}/generate`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Generation failed' }))
        throw new Error(data.error || 'Generation failed')
      }

      // Refresh campaign detail
      await fetchCampaignDetail(activeCampaign.id)
      setDetailTab('messaging')
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function handleApproveAll() {
    if (!activeCampaign || !email) return
    await fetch(`/api/vbrick/campaigns/${activeCampaign.id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve_all', email }),
    })
    await fetchCampaignDetail(activeCampaign.id)
  }

  async function handleApproveChannel(channelIds: string[]) {
    if (!activeCampaign || !email) return
    await fetch(`/api/vbrick/campaigns/${activeCampaign.id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve_channel', email, channel_ids: channelIds }),
    })
    await fetchCampaignDetail(activeCampaign.id)
  }

  async function handleRejectChannel(channelIds: string[]) {
    if (!activeCampaign || !email) return
    await fetch(`/api/vbrick/campaigns/${activeCampaign.id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject_channel', email, channel_ids: channelIds }),
    })
    await fetchCampaignDetail(activeCampaign.id)
  }

  async function handleActivate() {
    if (!activeCampaign || !email) return
    await fetch(`/api/vbrick/campaigns/${activeCampaign.id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'activate', email }),
    })
    await fetchCampaignDetail(activeCampaign.id)
    await fetchCampaigns()
  }

  async function handleDeleteCampaign(id: string) {
    await fetch(`/api/vbrick/campaigns/${id}`, { method: 'DELETE' })
    setView('list')
    fetchCampaigns()
  }

  // Email gate
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: neuTheme.colors.bg }}>
        <NeuCard className="max-w-sm w-full text-center">
          <p className="font-satoshi text-sm mb-4" style={{ color: neuTheme.colors.text.body }}>
            Enter your email to access Campaigns
          </p>
          <input
            type="email"
            className="w-full p-3 rounded-xl text-sm font-satoshi outline-none mb-4"
            style={{ background: neuTheme.colors.bg, boxShadow: neuTheme.shadows.inset, color: neuTheme.colors.text.body }}
            placeholder="you@company.com"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim()
                if (val) { localStorage.setItem('vbrick_email', val); setEmail(val) }
              }
            }}
          />
        </NeuCard>
      </div>
    )
  }

  // ─── CREATE VIEW ───
  if (view === 'create') {
    return (
      <div className="min-h-screen p-6" style={{ background: neuTheme.colors.bg }}>
        <button
          onClick={() => setView('list')}
          className="flex items-center gap-2 mb-6 font-satoshi text-sm border-none bg-transparent cursor-pointer"
          style={{ color: neuTheme.colors.text.muted }}
        >
          <ArrowLeft size={16} /> Back to Campaigns
        </button>

        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-general-sans font-bold mb-6" style={{ color: neuTheme.colors.text.heading }}>
            New Campaign
          </h2>

          <div className="space-y-4">
            <NeuInput
              label="Campaign Name *"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="K26 ServiceNow Outreach"
            />
            <NeuTextarea
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description of the campaign goals and strategy"
            />
            <NeuInput
              label="Event Name"
              value={formEventName}
              onChange={(e) => setFormEventName(e.target.value)}
              placeholder="Knowledge 26"
            />
            <NeuInput
              label="Target Audience"
              value={formTargetAudience}
              onChange={(e) => setFormTargetAudience(e.target.value)}
              placeholder="Current ServiceNow customers with ITSM, HRSD, CSM modules"
            />

            <NeuButton
              variant="accent"
              size="md"
              onClick={handleCreate}
              disabled={creating || !formName.trim()}
              className="w-full"
            >
              {creating ? (
                <>
                  <Loader2 size={16} className="mr-2 inline-block animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} className="mr-2 inline-block" />
                  Create Campaign
                </>
              )}
            </NeuButton>
          </div>
        </div>
      </div>
    )
  }

  // ─── DETAIL VIEW ───
  if (view === 'detail' && activeCampaign) {
    const draftChannelCount = channels.filter(c => c.status === 'draft').length
    const approvedChannelCount = channels.filter(c => c.status === 'approved').length
    const allApproved = channels.length > 0 && draftChannelCount === 0

    const detailTabs = [
      { id: 'files' as const, label: `Files (${files.length})`, icon: <FileText size={14} /> },
      { id: 'messaging' as const, label: `Messaging (${channels.length})`, icon: <Megaphone size={14} /> },
      { id: 'personalize' as const, label: 'Personalize', icon: <Sparkles size={14} /> },
    ]

    return (
      <div className="min-h-screen p-6" style={{ background: neuTheme.colors.bg }}>
        <button
          onClick={() => { setView('list'); fetchCampaigns() }}
          className="flex items-center gap-2 mb-6 font-satoshi text-sm border-none bg-transparent cursor-pointer"
          style={{ color: neuTheme.colors.text.muted }}
        >
          <ArrowLeft size={16} /> Back to Campaigns
        </button>

        <div className="max-w-4xl mx-auto">
          {/* Campaign header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-general-sans font-bold" style={{ color: neuTheme.colors.text.heading }}>
                  {activeCampaign.name}
                </h2>
                <NeuBadge variant={activeCampaign.status === 'active' ? 'accent' : activeCampaign.status === 'approved' ? 'success' : 'default'}>
                  {STATUS_LABELS[activeCampaign.status]}
                </NeuBadge>
              </div>
              {activeCampaign.description && (
                <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>
                  {activeCampaign.description}
                </p>
              )}
              {activeCampaign.event_name && (
                <p className="font-satoshi text-xs mt-1" style={{ color: neuTheme.colors.text.subtle }}>
                  Event: {activeCampaign.event_name}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {/* Approve All button (Jeff only, when pending) */}
              {isJeff && activeCampaign.status === 'pending_approval' && draftChannelCount > 0 && (
                <NeuButton variant="accent" size="sm" onClick={handleApproveAll}>
                  <CheckCircle size={14} className="mr-1.5 inline-block" />
                  Approve All ({draftChannelCount})
                </NeuButton>
              )}

              {/* Activate button (Jeff only, when all approved) */}
              {isJeff && (activeCampaign.status === 'approved' || (activeCampaign.status === 'pending_approval' && allApproved)) && (
                <NeuButton variant="accent" size="sm" onClick={handleActivate}>
                  <Sparkles size={14} className="mr-1.5 inline-block" />
                  Activate Campaign
                </NeuButton>
              )}

              {/* Delete button (Jeff only) */}
              {isJeff && (
                <NeuButton variant="raised" size="sm" onClick={() => handleDeleteCampaign(activeCampaign.id)}>
                  Delete
                </NeuButton>
              )}
            </div>
          </div>

          {/* Approval banner for BDRs */}
          {!isJeff && activeCampaign.status === 'pending_approval' && (
            <NeuCard variant="inset" padding="sm" className="mb-4">
              <p className="font-satoshi text-sm text-center" style={{ color: neuTheme.colors.status.warning }}>
                This campaign is pending approval from Jeff. Messaging will be available once approved.
              </p>
            </NeuCard>
          )}

          {/* Tabs */}
          <NeuTabs
            tabs={detailTabs}
            activeTab={detailTab}
            onChange={(id) => setDetailTab(id as DetailTab)}
            className="mb-6"
          />

          {/* Files tab */}
          {detailTab === 'files' && (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={cascadeIn} custom={0}>
                <FileUploader
                  campaignId={activeCampaign.id}
                  email={email}
                  onUploadComplete={() => fetchCampaignDetail(activeCampaign.id)}
                />
              </motion.div>

              {/* Existing files */}
              {files.length > 0 && (
                <motion.div variants={cascadeIn} custom={1} className="mt-6">
                  <h3 className="font-general-sans font-semibold text-sm mb-3" style={{ color: neuTheme.colors.text.heading }}>
                    Uploaded Files ({files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map(f => (
                      <NeuCard key={f.id} padding="sm" className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText size={16} style={{ color: neuTheme.colors.accent.primary }} />
                          <div>
                            <p className="font-satoshi text-sm font-medium" style={{ color: neuTheme.colors.text.heading }}>
                              {f.file_name}
                            </p>
                            <p className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.subtle }}>
                              {f.extracted_text ? `${f.extracted_text.length.toLocaleString()} chars extracted` : 'Processing...'}
                            </p>
                          </div>
                        </div>
                        <NeuBadge variant="success" size="sm">Uploaded</NeuBadge>
                      </NeuCard>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Generate button */}
              {files.length > 0 && (activeCampaign.status === 'draft' || activeCampaign.status === 'pending_approval') && (
                <motion.div variants={cascadeIn} custom={2} className="mt-6">
                  <NeuButton
                    variant="accent"
                    size="md"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={16} className="mr-2 inline-block animate-spin" />
                        Generating messaging across all channels (this takes 1-2 minutes)...
                      </>
                    ) : channels.length > 0 ? (
                      <>
                        <Sparkles size={16} className="mr-2 inline-block" />
                        Regenerate All Messaging
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="mr-2 inline-block" />
                        Generate Campaign Messaging
                      </>
                    )}
                  </NeuButton>
                  {generateError && (
                    <p className="font-satoshi text-sm mt-2" style={{ color: neuTheme.colors.status.danger }}>
                      {generateError}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Messaging tab */}
          {detailTab === 'messaging' && (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={cascadeIn} custom={0}>
                {activeCampaign.status === 'generating' ? (
                  <NeuCard variant="inset" className="text-center py-12">
                    <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: neuTheme.colors.accent.primary }} />
                    <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>
                      AI is generating messaging for all channels. This takes 1-2 minutes...
                    </p>
                  </NeuCard>
                ) : (
                  <ChannelViewer
                    channels={channels}
                    isApprover={isJeff}
                    onApprove={handleApproveChannel}
                    onReject={handleRejectChannel}
                  />
                )}
              </motion.div>

              {/* Approved count summary */}
              {channels.length > 0 && (
                <motion.div variants={cascadeIn} custom={1} className="mt-4">
                  <p className="font-satoshi text-xs text-center" style={{ color: neuTheme.colors.text.subtle }}>
                    {approvedChannelCount} of {channels.length} channels approved
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Personalize tab */}
          {detailTab === 'personalize' && (
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div variants={cascadeIn} custom={0}>
                <ContactPersonalizer
                  campaignId={activeCampaign.id}
                  channels={channels}
                />
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  // ─── LIST VIEW ───
  return (
    <div className="min-h-screen" style={{ background: neuTheme.colors.bg }}>
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-general-sans font-bold" style={{ color: neuTheme.colors.text.heading }}>
              Campaigns
            </h1>
            <a
              href="/vbrick/dashboard"
              className="flex items-center gap-2 font-satoshi text-sm no-underline"
              style={{ color: neuTheme.colors.text.muted }}
            >
              <ArrowLeft size={16} /> Dashboard
            </a>
          </div>
          <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>
            Upload campaign materials, generate multi-channel messaging, and personalize per contact.
          </p>
        </motion.div>

        {/* Create button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <NeuButton variant="accent" size="md" onClick={() => setView('create')}>
            <Plus size={16} className="mr-2 inline-block" />
            New Campaign
          </NeuButton>
        </motion.div>

        {/* Campaign list */}
        {loading ? (
          <NeuCard variant="inset" className="text-center py-12">
            <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: neuTheme.colors.accent.primary }} />
            <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>Loading campaigns...</p>
          </NeuCard>
        ) : campaigns.length === 0 ? (
          <NeuCard variant="inset" className="text-center py-12">
            <Megaphone size={32} className="mx-auto mb-3" style={{ color: neuTheme.colors.text.subtle }} />
            <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>
              No campaigns yet. Create one to get started.
            </p>
          </NeuCard>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            {campaigns.map((c, i) => (
              <motion.div key={c.id} variants={cascadeIn} custom={i}>
                <NeuCard
                  padding="md"
                  className="cursor-pointer"
                  onClick={() => handleOpenCampaign(c)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-general-sans font-bold text-base" style={{ color: neuTheme.colors.text.heading }}>
                          {c.name}
                        </h3>
                        <NeuBadge
                          variant={c.status === 'active' ? 'accent' : c.status === 'approved' ? 'success' : c.status === 'pending_approval' ? 'warning' : 'default'}
                          size="sm"
                        >
                          {STATUS_LABELS[c.status]}
                        </NeuBadge>
                      </div>
                      {c.description && (
                        <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>
                          {c.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        {c.event_name && (
                          <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.subtle }}>
                            Event: {c.event_name}
                          </span>
                        )}
                        <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.subtle }}>
                          Created by {c.created_by.split('@')[0]}
                        </span>
                      </div>
                    </div>
                    <ArrowLeft size={16} style={{ color: neuTheme.colors.text.muted, transform: 'rotate(180deg)' }} />
                  </div>
                </NeuCard>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
