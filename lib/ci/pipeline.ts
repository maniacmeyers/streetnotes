import type { SupabaseClient } from '@supabase/supabase-js'
import type { CIExtraction, ServiceNowCategory } from './types'
import { SERVICENOW_WATCHLIST } from './types'

interface CIMentionMetadata {
  repEmail: string
  repName?: string
  companyName?: string
  dealStage?: string
  dealSegment?: string
  sourceType: 'debrief' | 'bdr-call' | 'live-call'
  accountName?: string
}

/**
 * Normalize a competitor name: trim, proper case, resolve common abbreviations.
 */
export function normalizeCompetitorName(name: string): string {
  const trimmed = name.trim()

  // Common abbreviations
  const aliases: Record<string, string> = {
    'sfdc': 'salesforce',
    'ms stream': 'microsoft stream',
    'ms teams': 'microsoft teams',
    'hubspot': 'hubspot',
    'gong.io': 'gong',
  }

  const lower = trimmed.toLowerCase()
  return aliases[lower] || lower
}

/**
 * Resolve alias from database. Falls back to normalizeCompetitorName if no alias found.
 */
async function resolveAlias(
  name: string,
  supabase: SupabaseClient
): Promise<string> {
  const normalized = normalizeCompetitorName(name)

  const { data } = await supabase
    .from('ci_competitor_aliases')
    .select('canonical_name')
    .eq('alias', normalized)
    .single()

  if (data?.canonical_name) {
    return data.canonical_name.toLowerCase()
  }

  return normalized
}

/**
 * Process CI mentions from GPT-4o output and write to ci_mentions table.
 */
export async function processCIMentions(
  sessionId: string,
  ciMentions: CIExtraction[],
  metadata: CIMentionMetadata,
  supabase: SupabaseClient
): Promise<void> {
  if (!ciMentions || ciMentions.length === 0) return

  const rows = await Promise.all(
    ciMentions.map(async (mention) => {
      const normalized = await resolveAlias(mention.competitorName, supabase)

      // Classify ServiceNow mentions
      const snCategory = classifyServiceNow(normalized, mention.contextQuote)

      return {
        debrief_session_id: sessionId,
        competitor_name: mention.competitorName.trim(),
        competitor_name_normalized: normalized,
        context_quote: mention.contextQuote,
        sentiment: mention.sentiment,
        mention_category: mention.mentionCategory,
        rep_email: metadata.repEmail,
        rep_name: metadata.repName || null,
        company_name: metadata.companyName || null,
        deal_stage: metadata.dealStage || null,
        deal_segment: metadata.dealSegment || null,
        source_type: metadata.sourceType,
        sn_category: snCategory,
        account_name: metadata.accountName || metadata.companyName || null,
      }
    })
  )

  const { error } = await supabase.from('ci_mentions').insert(rows)

  if (error) {
    console.error('Failed to insert CI mentions:', error)
  }
}

/**
 * Classify whether a mention is ServiceNow-related and categorize it.
 * Uses keyword matching on the normalized competitor name and context quote.
 */
function classifyServiceNow(normalizedName: string, contextQuote: string): ServiceNowCategory | null {
  const isServiceNow = SERVICENOW_WATCHLIST.some((kw) => normalizedName.includes(kw))
  if (!isServiceNow) return null

  // Direct ServiceNow mentions get categorized by context
  const quote = contextQuote.toLowerCase()

  if (normalizedName.includes('servicenow') || normalizedName.includes('snow') || normalizedName.includes('service now')) {
    if (quote.includes('expand') || quote.includes('roll out') || quote.includes('next phase') || quote.includes('adding')) {
      return 'servicenow_expansion'
    }
    if (quote.includes('frustrat') || quote.includes('pain') || quote.includes('problem') || quote.includes('rigid') || quote.includes('slow') || quote.includes('hate')) {
      return 'servicenow_pain'
    }
    if (quote.includes('integrat') || quote.includes('connect') || quote.includes('talk to') || quote.includes('sync')) {
      return 'integration_opportunity'
    }
    if (quote.includes('using') || quote.includes('deployed') || quote.includes('running') || quote.includes('just got') || quote.includes('implemented')) {
      return 'servicenow_adoption'
    }
    return 'servicenow_adoption' // default for direct SN mentions
  }

  // ServiceNow competitor mentions
  return 'servicenow_competitor'
}
