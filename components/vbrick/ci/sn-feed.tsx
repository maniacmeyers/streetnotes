'use client'

import { motion, AnimatePresence } from 'motion/react'
import { Check, Clock } from 'lucide-react'
import { NeuCard } from '@/components/vbrick/neu'
import { NeuButton } from '@/components/vbrick/neu'
import { NeuBadge } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import { type QuoteFeedItem, type ServiceNowCategory, SN_CATEGORY_LABELS } from '@/lib/ci/types'

interface SNFeedProps {
  mentions: QuoteFeedItem[]
  onAcknowledge: (id: string) => void
  loading?: boolean
}

const SN_BADGE_VARIANT: Record<ServiceNowCategory, 'success' | 'danger' | 'accent' | 'warning' | 'default'> = {
  servicenow_adoption: 'success',
  servicenow_pain: 'danger',
  servicenow_expansion: 'accent',
  servicenow_competitor: 'warning',
  integration_opportunity: 'accent',
  general_competitor: 'default',
}

const SENTIMENT_DOT: Record<string, string> = {
  positive: neuTheme.colors.status.success,
  negative: neuTheme.colors.status.danger,
  neutral: neuTheme.colors.text.subtle,
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function SNFeed({ mentions, onAcknowledge, loading }: SNFeedProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <NeuCard key={i} hover={false} padding="md" radius="lg">
            <div className="animate-pulse space-y-3">
              <div className="h-4 rounded-full w-24" style={{ background: neuTheme.colors.shadow }} />
              <div className="h-3 rounded-full w-full" style={{ background: neuTheme.colors.shadow }} />
              <div className="h-3 rounded-full w-2/3" style={{ background: neuTheme.colors.shadow }} />
            </div>
          </NeuCard>
        ))}
      </div>
    )
  }

  if (mentions.length === 0) {
    return (
      <NeuCard hover={false} padding="lg" radius="lg">
        <p className="font-satoshi text-sm text-center" style={{ color: neuTheme.colors.text.muted }}>
          No ServiceNow mentions yet.
        </p>
      </NeuCard>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence initial={false}>
        {mentions.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: idx * 0.04, duration: 0.3 }}
          >
            <NeuCard hover padding="md" radius="lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Category + Sentiment */}
                  <div className="flex items-center gap-2 mb-2">
                    {item.snCategory && (
                      <NeuBadge variant={SN_BADGE_VARIANT[item.snCategory]} size="sm">
                        {SN_CATEGORY_LABELS[item.snCategory]}
                      </NeuBadge>
                    )}
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: SENTIMENT_DOT[item.sentiment] }}
                      title={item.sentiment}
                    />
                  </div>

                  {/* Account name */}
                  {item.accountName && (
                    <p
                      className="font-general-sans font-bold text-sm mb-1 truncate"
                      style={{ color: neuTheme.colors.text.heading }}
                    >
                      {item.accountName}
                    </p>
                  )}

                  {/* Quote */}
                  <p
                    className="font-satoshi text-sm italic line-clamp-2 mb-2"
                    style={{ color: neuTheme.colors.text.body }}
                  >
                    &ldquo;{item.contextQuote}&rdquo;
                  </p>

                  {/* Rep + timestamp */}
                  <div className="flex items-center gap-2">
                    <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.muted }}>
                      {item.repName || item.repEmail}
                    </span>
                    <span className="font-satoshi text-xs flex items-center gap-1" style={{ color: neuTheme.colors.text.subtle }}>
                      <Clock size={10} />
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Acknowledge button */}
                <div className="flex-shrink-0 pt-1">
                  {item.acknowledged ? (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: neuTheme.colors.status.success,
                        boxShadow: neuTheme.shadows.raisedSm,
                      }}
                    >
                      <Check size={14} color="#fff" />
                    </div>
                  ) : (
                    <NeuButton
                      variant="raised"
                      size="sm"
                      onClick={() => onAcknowledge(item.id)}
                      className="!px-3 !py-1.5 !text-xs !min-h-0"
                    >
                      Ack
                    </NeuButton>
                  )}
                </div>
              </div>
            </NeuCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
