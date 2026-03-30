'use client'

import { useState } from 'react'
import { Phone, Voicemail, Mail, Linkedin, Shield, Check, X, Copy, ChevronDown } from 'lucide-react'
import { motion } from 'motion/react'
import { NeuCard, NeuButton, NeuBadge } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import type { CampaignChannel, ChannelType, FrameworkType } from '@/lib/vbrick/campaign-types'
import { CHANNEL_LABELS } from '@/lib/vbrick/campaign-types'

const CHANNEL_ICON_MAP: Record<ChannelType, React.ReactNode> = {
  cold_call: <Phone size={16} />,
  voicemail: <Voicemail size={16} />,
  email_sequence: <Mail size={16} />,
  linkedin: <Linkedin size={16} />,
  objection_handling: <Shield size={16} />,
}

interface ChannelViewerProps {
  channels: CampaignChannel[]
  isApprover: boolean
  onApprove?: (channelIds: string[]) => void
  onReject?: (channelIds: string[]) => void
}

export function ChannelViewer({ channels, isApprover, onApprove, onReject }: ChannelViewerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeFramework] = useState<FrameworkType>('maniac_method')
  const [copied, setCopied] = useState<string | null>(null)

  // Group channels by type, then filter by active framework
  const filteredChannels = channels.filter(c => c.framework === activeFramework)

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function renderContent(channel: CampaignChannel) {
    // Channel content is dynamic JSON from GPT — shape varies by channel_type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = channel.content as any

    if (channel.channel_type === 'cold_call') {
      return (
        <div className="space-y-4">
          <ContentBlock label="Opener" text={content.opener as string} id={`${channel.id}-opener`} onCopy={handleCopy} copied={copied} />
          <ContentBlock label="Value Prop" text={content.value_prop as string} id={`${channel.id}-vp`} onCopy={handleCopy} copied={copied} />
          <ContentBlock label="Binary Ask" text={content.binary_ask as string} id={`${channel.id}-ask`} onCopy={handleCopy} copied={copied} />
          <ContentBlock label="Closing" text={content.closing as string} id={`${channel.id}-close`} onCopy={handleCopy} copied={copied} />
          {content.module_variants && (
            <div className="mt-4">
              <p className="font-general-sans font-semibold text-xs uppercase tracking-widest mb-2" style={{ color: neuTheme.colors.accent.primary }}>
                Module Variants
              </p>
              {Object.entries(content.module_variants as Record<string, Record<string, string>>).map(([mod, variant]) => (
                <NeuCard key={mod} variant="inset" padding="sm" className="mb-2">
                  <NeuBadge variant="accent" size="sm">{mod}</NeuBadge>
                  <div className="mt-2 space-y-1">
                    {typeof variant === 'object' && Object.entries(variant).map(([key, val]) => (
                      <p key={key} className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.body }}>
                        <span className="font-medium" style={{ color: neuTheme.colors.text.muted }}>{key}: </span>
                        {val}
                      </p>
                    ))}
                    {typeof variant === 'string' && (
                      <p className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.body }}>{variant}</p>
                    )}
                  </div>
                </NeuCard>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (channel.channel_type === 'voicemail') {
      return (
        <div className="space-y-4">
          <ContentBlock label="Script" text={content.script as string} id={`${channel.id}-script`} onCopy={handleCopy} copied={copied} />
          <p className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.subtle }}>
            Target duration: {content.duration_target as string}
          </p>
          {content.module_variants && (
            <div>
              <p className="font-general-sans font-semibold text-xs uppercase tracking-widest mb-2" style={{ color: neuTheme.colors.accent.primary }}>
                Module Variants
              </p>
              {Object.entries(content.module_variants as Record<string, string>).map(([mod, script]) => (
                <ContentBlock key={mod} label={mod} text={script} id={`${channel.id}-vm-${mod}`} onCopy={handleCopy} copied={copied} />
              ))}
            </div>
          )}
        </div>
      )
    }

    if (channel.channel_type === 'email_sequence') {
      const emails = (content.emails as Array<{ subject: string; body: string; send_day: number; purpose: string }>) || []
      return (
        <div className="space-y-4">
          {emails.map((email, i) => (
            <NeuCard key={i} variant="inset" padding="sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <NeuBadge variant="accent" size="sm">Day {email.send_day}</NeuBadge>
                  <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.subtle }}>
                    {email.purpose}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`, `${channel.id}-email-${i}`)}
                  className="border-none bg-transparent cursor-pointer p-1"
                  style={{ color: copied === `${channel.id}-email-${i}` ? neuTheme.colors.status.success : neuTheme.colors.text.subtle }}
                >
                  {copied === `${channel.id}-email-${i}` ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <p className="font-satoshi text-xs font-medium mb-1" style={{ color: neuTheme.colors.text.muted }}>
                Subject: <span style={{ color: neuTheme.colors.text.heading }}>{email.subject}</span>
              </p>
              <p className="font-satoshi text-sm leading-relaxed whitespace-pre-wrap" style={{ color: neuTheme.colors.text.body }}>
                {email.body}
              </p>
            </NeuCard>
          ))}
        </div>
      )
    }

    if (channel.channel_type === 'linkedin') {
      return (
        <div className="space-y-4">
          <ContentBlock label="Connection Request" text={content.connection_request as string} id={`${channel.id}-conn`} onCopy={handleCopy} copied={copied} />
          <ContentBlock label="InMail" text={content.inmail as string} id={`${channel.id}-inmail`} onCopy={handleCopy} copied={copied} />
          <ContentBlock label="Follow Up" text={content.follow_up as string} id={`${channel.id}-follow`} onCopy={handleCopy} copied={copied} />
          <ContentBlock label="Video InMail Script" text={content.video_inmail_script as string} id={`${channel.id}-video`} onCopy={handleCopy} copied={copied} />
        </div>
      )
    }

    if (channel.channel_type === 'objection_handling') {
      const objections = ((content.objections || []) as Array<{ objection: string; response: string; follow_up_question: string; reframe: string }>)
      return (
        <div className="space-y-3">
          {objections.map((obj, i) => (
            <NeuCard key={i} variant="inset" padding="sm">
              <p className="font-general-sans font-bold text-sm mb-2" style={{ color: neuTheme.colors.text.heading }}>
                &ldquo;{obj.objection}&rdquo;
              </p>
              <div className="space-y-2">
                <div>
                  <span className="font-satoshi text-xs font-medium" style={{ color: neuTheme.colors.accent.primary }}>Response: </span>
                  <span className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>{obj.response}</span>
                </div>
                <div>
                  <span className="font-satoshi text-xs font-medium" style={{ color: neuTheme.colors.accent.primary }}>Follow-up: </span>
                  <span className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>{obj.follow_up_question}</span>
                </div>
                {obj.reframe && (
                  <div>
                    <span className="font-satoshi text-xs font-medium" style={{ color: neuTheme.colors.accent.primary }}>Reframe: </span>
                    <span className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>{obj.reframe}</span>
                  </div>
                )}
              </div>
            </NeuCard>
          ))}
        </div>
      )
    }

    // Fallback: render raw JSON
    return (
      <pre className="font-satoshi text-xs whitespace-pre-wrap" style={{ color: neuTheme.colors.text.body }}>
        {JSON.stringify(content, null, 2)}
      </pre>
    )
  }

  return (
    <div className="space-y-4">
      {/* Channel cards */}
      {filteredChannels.map(channel => {
        const isExpanded = expandedId === channel.id
        return (
          <NeuCard key={channel.id} padding="md">
            <button
              onClick={() => setExpandedId(isExpanded ? null : channel.id)}
              className="w-full flex items-center justify-between text-left border-none bg-transparent cursor-pointer p-0"
            >
              <div className="flex items-center gap-3">
                <div style={{ color: neuTheme.colors.accent.primary }}>
                  {CHANNEL_ICON_MAP[channel.channel_type]}
                </div>
                <div>
                  <p className="font-general-sans font-bold text-sm" style={{ color: neuTheme.colors.text.heading }}>
                    {CHANNEL_LABELS[channel.channel_type]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <NeuBadge
                  variant={channel.status === 'approved' ? 'success' : channel.status === 'rejected' ? 'danger' : 'default'}
                  size="sm"
                >
                  {channel.status}
                </NeuBadge>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown size={16} style={{ color: neuTheme.colors.text.muted }} />
                </motion.div>
              </div>
            </button>

            {/* Expandable content */}
            <div
              style={{
                display: 'grid',
                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${neuTheme.colors.shadow}30` }}>
                  {renderContent(channel)}

                  {/* Approval buttons */}
                  {isApprover && channel.status === 'draft' && onApprove && onReject && (
                    <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: `1px solid ${neuTheme.colors.shadow}20` }}>
                      <NeuButton variant="accent" size="sm" onClick={() => onApprove([channel.id])}>
                        <Check size={14} className="mr-1.5 inline-block" />
                        Approve
                      </NeuButton>
                      <NeuButton variant="raised" size="sm" onClick={() => onReject([channel.id])}>
                        <X size={14} className="mr-1.5 inline-block" />
                        Reject
                      </NeuButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </NeuCard>
        )
      })}

      {filteredChannels.length === 0 && (
        <NeuCard variant="inset" className="text-center py-8">
          <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>
            No messaging generated yet. Upload files and generate to see content here.
          </p>
        </NeuCard>
      )}
    </div>
  )
}

/* ─── Content Block (reusable copyable text section) ─── */
function ContentBlock({ label, text, id, onCopy, copied }: {
  label: string
  text: string
  id: string
  onCopy: (text: string, id: string) => void
  copied: string | null
}) {
  if (!text) return null
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-general-sans font-semibold text-xs uppercase tracking-widest" style={{ color: neuTheme.colors.accent.primary }}>
          {label}
        </span>
        <button
          onClick={() => onCopy(text, id)}
          className="border-none bg-transparent cursor-pointer p-1"
          style={{ color: copied === id ? neuTheme.colors.status.success : neuTheme.colors.text.subtle }}
        >
          {copied === id ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <p className="font-satoshi text-sm leading-relaxed whitespace-pre-wrap" style={{ color: neuTheme.colors.text.body }}>
        {text}
      </p>
    </div>
  )
}
