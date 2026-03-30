import { getOpenAIClient } from '@/lib/openai/server'
import { COACHING_SYSTEM_PROMPT, FALLBACK_PROMPTS } from './coaching-prompts'

export interface ClassificationResult {
  intent: string
  coaching_prompt: string
  confidence: number
  ci_flag: boolean
}

/**
 * Classify a transcript segment and return a coaching prompt.
 * Uses GPT-4o-mini for speed (<2s target).
 */
export async function classifyIntent(
  recentText: string,
  callContext?: { prospectName?: string; company?: string; talkTimeRatio?: number }
): Promise<ClassificationResult> {
  const openai = getOpenAIClient()

  // Check for talk-time warning before hitting the API
  if (callContext?.talkTimeRatio && callContext.talkTimeRatio > 0.6) {
    return {
      intent: 'talk_time_warning',
      coaching_prompt: `You're at ${Math.round(callContext.talkTimeRatio * 100)}% talk time. Ask: "What's the biggest challenge your team is facing with this right now?"`,
      confidence: 0.95,
      ci_flag: false,
    }
  }

  // Check for silence (caller passes empty/very short text)
  if (recentText.trim().length < 10) {
    return {
      intent: 'silence',
      coaching_prompt: FALLBACK_PROMPTS.silence,
      confidence: 0.9,
      ci_flag: false,
    }
  }

  try {
    const userMessage = callContext
      ? `Context: Speaking with ${callContext.prospectName || 'prospect'} at ${callContext.company || 'unknown company'}. BDR talk-time ratio: ${Math.round((callContext.talkTimeRatio || 0.5) * 100)}%.

Recent transcript (last 30 seconds):
"${recentText}"`
      : `Recent transcript (last 30 seconds):
"${recentText}"`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: COACHING_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
      max_tokens: 200,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('Empty classifier response')

    const result = JSON.parse(raw) as ClassificationResult
    return {
      intent: result.intent || 'silence',
      coaching_prompt: result.coaching_prompt || FALLBACK_PROMPTS[result.intent] || '',
      confidence: result.confidence || 0.5,
      ci_flag: result.ci_flag || false,
    }
  } catch (error) {
    console.error('[coaching-classifier] Error:', error)
    // Fall back to keyword-based classification
    return classifyByKeywords(recentText)
  }
}

/**
 * Fast keyword-based fallback classifier.
 * Used when the AI classifier times out or errors.
 */
function classifyByKeywords(text: string): ClassificationResult {
  const lower = text.toLowerCase()

  if (lower.includes('servicenow') || lower.includes('service now') || lower.includes('snow')) {
    return { intent: 'servicenow', coaching_prompt: FALLBACK_PROMPTS.servicenow, confidence: 0.8, ci_flag: true }
  }

  const competitors = ['panopto', 'kaltura', 'brightcove', 'qumu', 'microsoft stream', 'ms stream']
  for (const comp of competitors) {
    if (lower.includes(comp)) {
      return { intent: 'competitor_mention', coaching_prompt: FALLBACK_PROMPTS.competitor_mention, confidence: 0.8, ci_flag: true }
    }
  }

  const objectionKeywords = ['not interested', 'no budget', 'already have', 'send me info', 'talk to my boss', 'not looking', 'too expensive', 'not a priority']
  for (const kw of objectionKeywords) {
    if (lower.includes(kw)) {
      return { intent: 'objection', coaching_prompt: FALLBACK_PROMPTS.objection, confidence: 0.7, ci_flag: false }
    }
  }

  if (lower.includes('price') || lower.includes('cost') || lower.includes('budget') || lower.includes('how much')) {
    return { intent: 'pricing', coaching_prompt: FALLBACK_PROMPTS.pricing, confidence: 0.7, ci_flag: false }
  }

  const interestKeywords = ['sounds interesting', 'tell me more', 'how does that work', 'we need something like', 'demo', 'let\'s set up']
  for (const kw of interestKeywords) {
    if (lower.includes(kw)) {
      return { intent: 'interest', coaching_prompt: FALLBACK_PROMPTS.interest, confidence: 0.7, ci_flag: false }
    }
  }

  return { intent: 'silence', coaching_prompt: '', confidence: 0.3, ci_flag: false }
}
