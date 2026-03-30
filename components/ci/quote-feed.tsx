'use client'

import { motion } from 'motion/react'
import { MessageSquareQuote } from 'lucide-react'

interface QuoteFeedMention {
  id: string
  competitorName: string
  contextQuote: string
  sentiment: 'positive' | 'negative' | 'neutral'
  mentionCategory: string
  repEmail: string
  repName: string | null
  companyName: string | null
  dealStage: string | null
  createdAt: string
}

interface QuoteFeedProps {
  mentions: QuoteFeedMention[]
  loading?: boolean
}

const SENTIMENT_COLORS: Record<QuoteFeedMention['sentiment'], string> = {
  positive: '#00E676',
  negative: '#FF5252',
  neutral: '#6B7280',
}

const DEAL_STAGE_STYLES: Record<string, string> = {
  discovery: 'bg-blue-500/15 text-blue-400',
  qualification: 'bg-amber-500/15 text-amber-400',
  proposal: 'bg-purple-500/15 text-purple-400',
  negotiation: 'bg-orange-500/15 text-orange-400',
  'closed-won': 'bg-[#00E676]/15 text-[#00E676]',
  'closed-lost': 'bg-red-500/15 text-red-400',
}

function getDealStageBadgeClass(stage: string): string {
  const key = stage.toLowerCase().replace(/\s+/g, '-')
  return DEAL_STAGE_STYLES[key] ?? 'bg-white/5 text-white/50'
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffHr = Math.floor(diffMs / 3_600_000)
  const diffDay = Math.floor(diffMs / 86_400_000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="animate-pulse rounded-lg bg-white/5 h-28 border-l-4 border-white/10"
      style={{ animationDelay: `${index * 150}ms` }}
    />
  )
}

function QuoteCard({ mention, index }: { mention: QuoteFeedMention; index: number }) {
  const borderColor = SENTIMENT_COLORS[mention.sentiment]
  const displayName = mention.repName || mention.repEmail

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="rounded-lg bg-[#1a1a1a] border-l-4 p-4"
      style={{ borderLeftColor: borderColor }}
    >
      {/* Top row: competitor + category + timestamp */}
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="inline-block h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: borderColor }}
        />
        <span className="bg-white/10 text-white px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
          {mention.competitorName}
        </span>
        <span className="bg-white/5 text-white/50 px-1.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide">
          {mention.mentionCategory}
        </span>
        <span className="ml-auto text-xs text-white/40 flex-shrink-0">
          {formatTimestamp(mention.createdAt)}
        </span>
      </div>

      {/* Quote */}
      <div className="mb-3 pl-1">
        <p className="text-sm text-white/80 italic leading-relaxed">
          <span className="text-white/20 text-lg font-serif mr-1 select-none">&ldquo;</span>
          {mention.contextQuote}
        </p>
      </div>

      {/* Bottom row: rep + company + deal stage */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-white/40">
        <span>{displayName}</span>
        {mention.companyName && (
          <>
            <span className="text-white/15">|</span>
            <span>{mention.companyName}</span>
          </>
        )}
        {mention.dealStage && (
          <span
            className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wide ${getDealStageBadgeClass(mention.dealStage)}`}
          >
            {mention.dealStage}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function QuoteFeed({ mentions, loading = false }: QuoteFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    )
  }

  if (mentions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <MessageSquareQuote className="h-10 w-10 text-white/15 mb-4" />
        <p className="text-sm text-white/40 max-w-xs leading-relaxed">
          No competitive intel yet. Record a Brain Dump that mentions a competitor to see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 overflow-y-auto">
      {mentions.map((mention, i) => (
        <QuoteCard key={mention.id} mention={mention} index={i} />
      ))}
    </div>
  )
}
