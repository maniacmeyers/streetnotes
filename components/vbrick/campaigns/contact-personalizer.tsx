'use client'

import { useState } from 'react'
import { User, Loader2, Copy, Check } from 'lucide-react'
import { NeuCard, NeuButton, NeuInput } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import type { ChannelType, FrameworkType, CampaignChannel } from '@/lib/vbrick/campaign-types'
import { CHANNEL_LABELS, SN_MODULES } from '@/lib/vbrick/campaign-types'

interface ContactPersonalizerProps {
  campaignId: string
  channels: CampaignChannel[]
}

export function ContactPersonalizer({ campaignId, channels }: ContactPersonalizerProps) {
  const [contactName, setContactName] = useState('')
  const [contactTitle, setContactTitle] = useState('')
  const [company, setCompany] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [industry, setIndustry] = useState('')
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('cold_call')
  const [selectedFramework] = useState<FrameworkType>('maniac_method')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function toggleModule(mod: string) {
    setSelectedModules(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    )
  }

  async function handleGenerate() {
    if (!contactName.trim() || !company.trim()) {
      setError('Contact name and company are required')
      return
    }

    setGenerating(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/vbrick/campaigns/${campaignId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_name: contactName.trim(),
          contact_title: contactTitle.trim() || undefined,
          company: company.trim(),
          module_stack: selectedModules,
          company_size: companySize.trim() || undefined,
          industry: industry.trim() || undefined,
          channel_type: selectedChannel,
          framework: selectedFramework,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Generation failed' }))
        throw new Error(data.error || 'Generation failed')
      }

      const data = await res.json()
      const content = data.script?.personalized_content?.[selectedChannel] || 'No content generated'
      setResult(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const availableChannels = Array.from(new Set(channels.filter(c => c.status === 'approved').map(c => c.channel_type))) as ChannelType[]

  if (availableChannels.length === 0) {
    return (
      <NeuCard variant="inset" className="text-center py-8">
        <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>
          No approved channels yet. Generate and approve messaging first.
        </p>
      </NeuCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Contact info form */}
      <NeuCard padding="md">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} style={{ color: neuTheme.colors.accent.primary }} />
          <h4 className="font-general-sans font-bold text-sm" style={{ color: neuTheme.colors.text.heading }}>
            Contact Details
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NeuInput
            label="Contact Name *"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="John Smith"
          />
          <NeuInput
            label="Title"
            value={contactTitle}
            onChange={(e) => setContactTitle(e.target.value)}
            placeholder="VP of IT"
          />
          <NeuInput
            label="Company *"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
          />
          <NeuInput
            label="Company Size"
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            placeholder="5,000 employees"
          />
          <NeuInput
            label="Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Financial Services"
          />
        </div>

        {/* Module selection */}
        <div className="mt-4">
          <p className="font-satoshi text-xs font-medium mb-2" style={{ color: neuTheme.colors.text.muted }}>
            ServiceNow Modules
          </p>
          <div className="flex flex-wrap gap-2">
            {SN_MODULES.map(mod => (
              <button
                key={mod}
                onClick={() => toggleModule(mod)}
                className="px-3 py-1.5 text-xs font-satoshi font-medium border-none cursor-pointer"
                style={{
                  borderRadius: neuTheme.radii.sm,
                  boxShadow: selectedModules.includes(mod) ? neuTheme.shadows.insetSm : neuTheme.shadows.raisedSm,
                  color: selectedModules.includes(mod) ? neuTheme.colors.accent.primary : neuTheme.colors.text.body,
                  background: neuTheme.colors.bg,
                  transition: neuTheme.transitions.fast,
                }}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>
      </NeuCard>

      {/* Channel + Framework selection */}
      <NeuCard padding="md">
        <h4 className="font-general-sans font-bold text-sm mb-3" style={{ color: neuTheme.colors.text.heading }}>
          Generate For
        </h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {availableChannels.map(ch => (
            <NeuButton
              key={ch}
              variant={selectedChannel === ch ? 'accent' : 'raised'}
              size="sm"
              onClick={() => setSelectedChannel(ch)}
            >
              {CHANNEL_LABELS[ch]}
            </NeuButton>
          ))}
        </div>
      </NeuCard>

      {/* Generate button */}
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
            Personalizing for {contactName || 'contact'}...
          </>
        ) : (
          <>Generate Personalized Script</>
        )}
      </NeuButton>

      {/* Error */}
      {error && (
        <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.status.danger }}>{error}</p>
      )}

      {/* Result */}
      {result && (
        <NeuCard padding="md">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-general-sans font-bold text-sm" style={{ color: neuTheme.colors.text.heading }}>
              Personalized Script — {contactName}
            </h4>
            <NeuButton variant="raised" size="sm" onClick={handleCopy}>
              {copied ? <Check size={14} className="mr-1 inline-block" /> : <Copy size={14} className="mr-1 inline-block" />}
              {copied ? 'Copied' : 'Copy'}
            </NeuButton>
          </div>
          <div
            className="px-4 py-4 font-satoshi text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              color: neuTheme.colors.text.body,
              borderRadius: neuTheme.radii.md,
              boxShadow: neuTheme.shadows.inset,
            }}
          >
            {result}
          </div>
        </NeuCard>
      )}
    </div>
  )
}
