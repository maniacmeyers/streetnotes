'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search } from 'lucide-react'
import { BrutalCard, BrutalBadge, BrutalInput } from '@/components/streetnotes/brutal'
import type { QuoteFeedItem } from '@/lib/ci/types'

interface QuoteWallProps {
  mentions: QuoteFeedItem[]
  loading?: boolean
}

const SENTIMENT_DOT: Record<string, string> = {
  positive: '#00E676',
  negative: '#dc2626',
  neutral: '#9ca3af',
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
        m.repEmail.toLowerCase().includes(lower),
    )
  }, [mentions, query])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-12 bg-gray-800 border-4 border-black animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border-4 border-black p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-gray-300 w-full" />
              <div className="h-3 bg-gray-300 w-3/4" />
            </div>
          </div>
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
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-black/60 z-10"
        />
        <BrutalInput
          placeholder="Search quotes, competitors, accounts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-11"
        />
      </div>

      {/* Quotes */}
      <AnimatePresence initial={false}>
        {filtered.length === 0 ? (
          <BrutalCard variant="white" padded>
            <p className="font-mono text-xs uppercase tracking-wider font-bold text-black/60 text-center">
              {mentions.length === 0 ? 'No quotes collected yet.' : 'No matches for that search.'}
            </p>
          </BrutalCard>
        ) : (
          filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
            >
              <BrutalCard variant="white" padded>
                <p className="font-body text-sm mb-3 leading-relaxed text-black italic">
                  &ldquo;{item.contextQuote}&rdquo;
                </p>

                <div className="flex items-center flex-wrap gap-2">
                  <BrutalBadge variant="black">{item.competitorName}</BrutalBadge>

                  <span
                    className="inline-block w-3 h-3 border-2 border-black flex-shrink-0"
                    style={{ background: SENTIMENT_DOT[item.sentiment] }}
                    title={item.sentiment}
                  />

                  {item.accountName && (
                    <span className="font-display uppercase text-xs text-black leading-none">
                      {item.accountName}
                    </span>
                  )}

                  <span className="font-mono text-[10px] uppercase tracking-wider text-black/60 font-bold">
                    {item.repName || item.repEmail}
                  </span>

                  <span className="font-mono text-[10px] uppercase tracking-wider text-black/50">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </BrutalCard>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
