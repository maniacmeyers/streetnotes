import type { CachedStage } from './types'

/** Normalize a stage label for comparison: lowercase, strip non-alphanumeric. */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Common synonyms between our generic stage enum and typical CRM stage names.
 * Keys are our normalized enum values, values are alternatives to try.
 */
const SYNONYMS: Record<string, string[]> = {
  prospecting: ['prospecting', 'qualification', 'newlead', 'leadqualification'],
  discovery: ['discovery', 'needsanalysis', 'qualification'],
  demoevaluation: ['demo', 'evaluation', 'presentationdelivered', 'presentation'],
  proposalpricing: ['proposal', 'pricing', 'quotesent', 'quote', 'proposalpricequote'],
  negotiation: ['negotiation', 'review', 'negotiationreview', 'contractsent'],
  verbalcommit: ['verbalcommit', 'contractsigned', 'commitment', 'pendingclose'],
  closedwon: ['closedwon', 'won', 'closed'],
  closedlost: ['closedlost', 'lost'],
}

/**
 * Map our generic CRMNote.dealStage enum to the user's actual CRM stage value.
 * Returns the CRM-native value/stageId + label, or null if no reasonable match.
 */
export function mapDealStage(
  ourStage: string,
  cachedStages: CachedStage[],
  crmType: 'salesforce' | 'hubspot'
): { value: string; label: string } | null {
  if (!ourStage || cachedStages.length === 0) return null

  const normalizedOurs = normalize(ourStage)

  // Exact normalized match first
  for (const stage of cachedStages) {
    if (normalize(stage.label) === normalizedOurs) {
      const id = crmType === 'hubspot' ? (stage.stageId ?? stage.value) : stage.value
      return { value: id, label: stage.label }
    }
  }

  // Synonym match
  const synonyms = SYNONYMS[normalizedOurs]
  if (synonyms) {
    for (const syn of synonyms) {
      for (const stage of cachedStages) {
        if (normalize(stage.label).includes(syn) || syn.includes(normalize(stage.label))) {
          const id = crmType === 'hubspot' ? (stage.stageId ?? stage.value) : stage.value
          return { value: id, label: stage.label }
        }
      }
    }
  }

  // Substring match as last resort
  for (const stage of cachedStages) {
    const normLabel = normalize(stage.label)
    if (normLabel.includes(normalizedOurs) || normalizedOurs.includes(normLabel)) {
      const id = crmType === 'hubspot' ? (stage.stageId ?? stage.value) : stage.value
      return { value: id, label: stage.label }
    }
  }

  return null
}

/**
 * Parse free-text estimated value into a number.
 * Handles: "$150K", "$2.5M", "150000", "about 50 thousand", "$1,200,000"
 */
export function parseEstimatedValue(value: string): number | null {
  if (!value) return null

  let cleaned = value.replace(/[,$\s]/g, '').toLowerCase()

  // Handle "K" and "M" suffixes
  let multiplier = 1
  if (cleaned.endsWith('k')) {
    multiplier = 1_000
    cleaned = cleaned.slice(0, -1)
  } else if (cleaned.endsWith('m')) {
    multiplier = 1_000_000
    cleaned = cleaned.slice(0, -1)
  } else if (cleaned.includes('thousand')) {
    multiplier = 1_000
    cleaned = cleaned.replace('thousand', '').trim()
  } else if (cleaned.includes('million')) {
    multiplier = 1_000_000
    cleaned = cleaned.replace('million', '').trim()
  }

  // Strip remaining non-numeric except dots
  cleaned = cleaned.replace(/[^0-9.]/g, '')

  const num = parseFloat(cleaned)
  if (isNaN(num)) return null

  return Math.round(num * multiplier)
}

/**
 * Parse a full name into first/last. Splits on the last space.
 * "Sarah Chen" → { firstName: "Sarah", lastName: "Chen" }
 * "Sarah van Chen" → { firstName: "Sarah van", lastName: "Chen" }
 * "Sarah" → { firstName: "", lastName: "Sarah" }
 */
export function parseName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim()
  const lastSpace = trimmed.lastIndexOf(' ')

  if (lastSpace === -1) {
    return { firstName: '', lastName: trimmed }
  }

  return {
    firstName: trimmed.slice(0, lastSpace),
    lastName: trimmed.slice(lastSpace + 1),
  }
}
