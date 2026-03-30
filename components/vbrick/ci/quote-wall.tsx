'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search } from 'lucide-react'
import { NeuCard } from '@/components/vbrick/neu'
import { NeuBadge } from '@/components/vbrick/neu'
import { NeuInput } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import type { QuoteFeedItem } from '@/lib/ci/types'

interface QuoteWallProps {
  mentions: QuoteFeedItem[]
  loading?: boolean
}

const SENTIMENT_DOT: Record<string, string> = {
  positive: neuTheme.colors.status.success,
  negative: neuTheme.colors.status.danger,
  neutral: neuTheme.colors.text.subtle,
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function QuoteWall({ mentions, loading }: QuoteWallProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return mentions
    const lower = query.toLowerCase()
    return mentions.filter(
      (m) =>
        m.contextQuote.toLowerCase().includes(lower) ||
        m.competitorName.toLowerCase().includes(lower) ||
        m.accountName?.toLowerCase().includes(lower) ||
        m.repName?.toLowerCase().includes(lower) ||
        m.repEmail.toLowerCase().includes(lower)
    )
  }, [mentions, query])

  if (loading) {
    return (
      <div className="space-y-3">
        <NeuCard hover={false} padding="sm" radius="lg">
          <div className="animate-pulse h-10 rounded-xl" style={{ background: neuTheme.colors.shadow }} />
        </NeuCard>
        {Array.from({ length: 3 }).map((_, i) => (
          <NeuCard key={i} hover={false} padding="md" radius="lg">
            <div className="animate-pulse space-y-2">
              <div className="h-3 rounded-full w-full" style={{ background: neuTheme.colors.shadow }} />
              <div className="h-3 rounded-full w-3/4" style={{ background: neuTheme.colors.shadow }} />
            </div>
          </NeuCard>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: neuTheme.colors.text.subtle }}
        />
        <NeuInput
          placeholder="Search quotes, competitors, accounts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: 44 }}
        />
      </div>

      {/* Quotes */}
      <AnimatePresence initial={false}>
        {filtered.length === 0 ? (
          <NeuCard hover={false} padding="lg" radius="lg">
            <p className="font-satoshi text-sm text-center" style={{ color: neuTheme.colors.text.muted }}>
              {mentions.length === 0 ? 'No quotes collected yet.' : 'No matches for that search.'}
            </p>
          </NeuCard>
        ) : (
          filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
            >
              <NeuCard hover padding="md" radius="lg">
                {/* Quote text */}
                <p
                  className="font-satoshi text-sm mb-3 leading-relaxed"
                  style={{ color: neuTheme.colors.text.body }}
                >
                  &ldquo;{item.contextQuote}&rdquo;
                </p>

                {/* Meta row */}
                <div className="flex items-center flex-wrap gap-2">
                  <NeuBadge variant="accent" size="sm">
                    {item.competitorName}
                  </NeuBadge>

                  <span
                    className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: SENTIMENT_DOT[item.sentiment] }}
                    title={item.sentiment}
                  />

                  {item.accountName && (
                    <span
                      className="font-satoshi text-xs font-medium"
                      style={{ color: neuTheme.colors.text.heading }}
                    >
                      {item.accountName}
                    </span>
                  )}

                  <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.muted }}>
                    {item.repName || item.repEmail}
                  </span>

                  <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.subtle }}>
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </NeuCard>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
