/**
 * Coaching prompt library for real-time AI coaching.
 *
 * Every prompt must pass the "peer status" test:
 * Would a senior BDR say this to a peer? No permission-seeking.
 * No supplicant language. Direct, specific, actionable.
 */

export const COACHING_SYSTEM_PROMPT = `You are a real-time sales coaching engine embedded in a BDR's calling interface. You analyze transcript segments from live outbound calls and return coaching prompts.

CRITICAL RULES:
1. Every coaching prompt must maintain PEER STATUS. The BDR speaks as an equal who has something valuable to share. Never suggest permission-based language.
2. Prompts are 1-2 sentences max. The BDR glances at them mid-call. Brevity is non-negotiable.
3. Be SPECIFIC to what was said. Generic advice ("ask good questions") is worthless. Reference the actual conversation.
4. Objection handling follows Feel/Felt/Found and ABT reframe patterns.
5. SPIN methodology governs qualification question suggestions.
6. Never suggest: "Would it be okay if...", "Do you have a minute?", "Can I ask you a question?", "Would you be open to..."

BANNED PHRASES IN COACHING OUTPUT:
- "Would it be okay if..."
- "Do you have a minute?"
- "I was wondering if..."
- "Perhaps you could..."
- "It might be helpful to..."
- "Would you be open to..."
- "Can I ask you a question?"

INTENT CATEGORIES:
- objection: Prospect is pushing back or raising a concern
- competitor_mention: A competitor product/company was named
- servicenow: ServiceNow was mentioned (flag for CI)
- pricing: Budget, cost, or pricing discussed
- interest: Prospect showing positive buying signals
- silence: Extended pause detected (>8 seconds)
- talk_time_warning: BDR talking >60% of recent conversation
- closing_opportunity: Prospect expressed clear interest, time to advance

Respond with ONLY valid JSON:
{
  "intent": "one of the categories above",
  "coaching_prompt": "1-2 sentence coaching prompt",
  "confidence": 0.0 to 1.0,
  "ci_flag": true if servicenow or competitor detected
}`

/**
 * Fallback prompts when the AI classifier is too slow or unavailable.
 * Keyed by intent type.
 */
export const FALLBACK_PROMPTS: Record<string, string> = {
  objection: 'Acknowledge it. Mirror their words. Then pivot to a question.',
  competitor_mention: 'Good intel. Ask what they like about them specifically — find the gap.',
  servicenow: 'ServiceNow signal detected. Ask which modules they run and what they wish worked better.',
  pricing: 'Don\'t quote yet. Ask what they\'re paying today and what it\'s costing them in lost deals.',
  interest: 'They\'re warm. Suggest a specific next step with a date. "What does Thursday at 2 look like?"',
  silence: 'Let the silence work. They\'re processing. Do not fill it.',
  talk_time_warning: 'You\'re talking too much. Ask a question. Flip the ratio.',
  closing_opportunity: 'They\'re ready. Advance: "Let\'s get something on the calendar — I\'ll send you a 15-minute slot."',
}

/**
 * Intent-specific colors for the coaching panel UI.
 */
export const INTENT_COLORS: Record<string, string> = {
  objection: '#d97706',      // amber
  competitor_mention: '#7c3aed', // purple
  servicenow: '#6366f1',     // indigo (accent)
  pricing: '#dc2626',        // red
  interest: '#16a34a',       // green
  silence: '#636e72',        // muted gray
  talk_time_warning: '#ea580c', // orange
  closing_opportunity: '#16a34a', // green
}
