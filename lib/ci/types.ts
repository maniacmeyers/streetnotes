/* ─── CI Sentiment & Category ─── */

export type CISentiment = 'positive' | 'negative' | 'neutral'

export type CIMentionCategory =
  | 'pricing'
  | 'features'
  | 'switching'
  | 'satisfaction'
  | 'comparison'
  | 'contract'
  | 'migration'
  | 'general'

/* ─── GPT-4o Extraction Shape ─── */

export interface CIExtraction {
  competitorName: string
  contextQuote: string
  sentiment: CISentiment
  mentionCategory: CIMentionCategory
}

/* ─── ServiceNow Categories ─── */

export type ServiceNowCategory =
  | 'servicenow_adoption'
  | 'servicenow_pain'
  | 'servicenow_expansion'
  | 'servicenow_competitor'
  | 'integration_opportunity'
  | 'general_competitor'

export const SN_CATEGORY_LABELS: Record<ServiceNowCategory, string> = {
  servicenow_adoption: 'Adoption',
  servicenow_pain: 'Pain Point',
  servicenow_expansion: 'Expansion',
  servicenow_competitor: 'SN Competitor',
  integration_opportunity: 'Integration',
  general_competitor: 'Competitor',
}

/* ─── ServiceNow Competitor Watchlist ─── */

export const SERVICENOW_WATCHLIST = [
  'servicenow', 'snow', 'service now',
  'bmc helix', 'bmc',
  'freshservice', 'freshworks',
  'jira service management', 'jsm', 'atlassian',
  'ivanti',
  'manageengine',
  'cherwell',
  'sysaid',
  'topdesk',
]

/* ─── Database Row ─── */

export interface CIMention {
  id: string
  debrief_session_id: string
  competitor_name: string
  competitor_name_normalized: string
  context_quote: string
  sentiment: CISentiment
  mention_category: CIMentionCategory
  rep_email: string
  rep_name: string | null
  company_name: string | null
  deal_stage: string | null
  deal_segment: string | null
  territory: string | null
  source_type: 'debrief' | 'bdr-call' | 'live-call'
  sn_category: ServiceNowCategory | null
  account_name: string | null
  confidence_score: number | null
  acknowledged: boolean
  acknowledged_by: string | null
  acknowledged_at: string | null
  created_at: string
}

/* ─── Dashboard Aggregates ─── */

export interface CompetitorTrendPoint {
  week: string
  weekLabel: string
  count: number
}

export interface CompetitorTrendData {
  competitorName: string
  trend: CompetitorTrendPoint[]
  totalMentions: number
  sentimentBreakdown: {
    positive: number
    negative: number
    neutral: number
  }
}

export interface HeatmapCell {
  competitor: string
  dimension: string
  count: number
  dominantSentiment: CISentiment
}

export interface QuoteFeedItem {
  id: string
  competitorName: string
  contextQuote: string
  sentiment: CISentiment
  mentionCategory: CIMentionCategory
  repEmail: string
  repName: string | null
  companyName: string | null
  dealStage: string | null
  snCategory: ServiceNowCategory | null
  accountName: string | null
  acknowledged: boolean
  createdAt: string
}

export interface CIDashboardStats {
  totalMentions: number
  uniqueCompetitors: number
  topCompetitor: { name: string; count: number } | null
  sentimentBreakdown: { positive: number; negative: number; neutral: number }
  recentTrend: 'up' | 'down' | 'flat'
}

/* ─── Filter State ─── */

export type CITimeRange = '7d' | '30d' | '90d' | 'all'

export interface CIDashboardFilters {
  timeRange: CITimeRange
  competitors: string[]
  sentiment: CISentiment | 'all'
  category: CIMentionCategory | 'all'
  repEmail: string | 'all'
}
