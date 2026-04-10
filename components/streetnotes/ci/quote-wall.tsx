'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search } from 'lucide-react'
import type { QuoteFeedItem } from '@/lib/ci/types'

interface QuoteWallProps {
  mentions: QuoteFeedItem[]
  loading?: boolean
}

const SENTIMENT_DOT: Record<string, { color: string; glow: string }> = {
  positive: { color: '#00E676', glow: '0 0 10px rgba(0, 230, 118, 0.6)' },
  negative: { color: '#f87171', glow: '0 0 10px rgba(248, 113, 113, 0.5)' },
  neutral: { color: '#9ca3af', glow: 'none' },
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
        <div className="h-12 glass rounded-xl animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-3 bg-white/10 rounded w-full" />
              <div className="h-3 bg-white/10 rounded w-3/4" />
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
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 z-10"
        />
        <input
          type="text"
          placeholder="Search quotes, competitors, accounts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full glass rounded-xl pl-11 pr-4 py-3 font-mono text-sm text-white placeholder:text-white/40 outline-none focus:border-volt/40 transition-all min-h-[44px]"
        />
      </div>

      {/* Quotes */}
      <AnimatePresence initial={false}>
        {filtered.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="font-mono text-xs uppercase tracking-wider font-bold text-white/50">
              {mentions.length === 0 ? 'No quotes collected yet.' : 'No matches for that search.'}
            </p>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const dot = SENTIMENT_DOT[item.sentiment] ?? SENTIMENT_DOT.neutral
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: idx * 0.03, duration: 0.25 }}
                className="glass rounded-xl p-5"
              >
                <p className="font-body text-sm mb-4 leading-relaxed text-white/85 italic">
                  &ldquo;{item.contextQuote}&rdquo;
                </p>

                <div className="flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center glass-inset rounded-md px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] font-bold text-volt">
                    {item.competitorName}
                  </span>

                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: dot.color, boxShadow: dot.glow }}
                    title={item.sentiment}
                  />

                  {item.accountName && (
                    <span className="font-bold text-xs text-white leading-none">
                      {item.accountName}
                    </span>
                  )}

                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/50 font-bold">
                    {item.repName || item.repEmail}
                  </span>

                  <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
      </AnimatePresence>
    </div>
  )
}
