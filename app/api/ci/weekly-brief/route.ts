import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOpenAIClient } from '@/lib/openai/server'

export const runtime = 'nodejs'
export const maxDuration = 45

// GET: Fetch latest weekly brief
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const domain = email.split('@')[1]
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('ci_weekly_briefs')
    .select('*')
    .eq('email_domain', domain)
    .order('week_start', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ brief: null })
  }

  return NextResponse.json({ brief: data })
}

// POST: Generate a new weekly brief
export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  const domain = email.split('@')[1]
  const supabase = createAdminClient()

  // Get this week's CI mentions
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const { data: mentions } = await supabase
    .from('ci_mentions')
    .select('*')
    .like('rep_email', `%@${domain}`)
    .gte('created_at', weekAgo)
    .order('created_at', { ascending: false })

  if (!mentions || mentions.length === 0) {
    return NextResponse.json({ brief: null, message: 'No mentions this week' })
  }

  // Get session stats for the week
  const { data: sessions } = await supabase
    .from('vbrick_calling_sessions')
    .select('total_calls, connected_count, appointments_count, average_spin')
    .gte('started_at', weekAgo)

  // Build summary data
  const snMentions = mentions.filter((m) => m.sn_category)
  const competitorCounts: Record<string, number> = {}
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 }

  for (const m of mentions) {
    const name = m.competitor_name_normalized
    competitorCounts[name] = (competitorCounts[name] || 0) + 1
    if (m.sentiment in sentimentCounts) {
      sentimentCounts[m.sentiment as keyof typeof sentimentCounts]++
    }
  }

  const topCompetitors = Object.entries(competitorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const totalDials = sessions?.reduce((sum, s) => sum + (s.total_calls || 0), 0) || 0
  const totalConversations = sessions?.reduce((sum, s) => sum + (s.connected_count || 0), 0) || 0
  const totalMeetings = sessions?.reduce((sum, s) => sum + (s.appointments_count || 0), 0) || 0

  // Generate brief with GPT-4o
  const openai = getOpenAIClient()

  const prompt = `Generate a weekly intelligence brief for a sales team. Be direct and specific. No filler.

DATA:
- Total CI mentions this week: ${mentions.length}
- ServiceNow-specific signals: ${snMentions.length}
- Top competitors mentioned: ${topCompetitors.map(([name, count]) => `${name} (${count}x)`).join(', ')}
- Sentiment: ${sentimentCounts.positive} positive, ${sentimentCounts.negative} negative, ${sentimentCounts.neutral} neutral
- BDR Activity: ${totalDials} dials, ${totalConversations} conversations, ${totalMeetings} meetings booked

ServiceNow signals:
${snMentions.slice(0, 10).map((m) => `- [${m.sn_category}] "${m.context_quote}" (${m.account_name || 'Unknown account'})`).join('\n')}

Top quotes:
${mentions.slice(0, 5).map((m) => `- "${m.context_quote}" — ${m.competitor_name} (${m.sentiment})`).join('\n')}

Return JSON with these sections:
{
  "headline": "One-sentence summary of the week",
  "servicenow_watch": "2-3 sentences on ServiceNow signals and what they mean for the partnership strategy",
  "competitor_movement": "2-3 sentences on competitor trends",
  "rep_highlights": "1-2 sentences on BDR activity and standout performance",
  "suggested_actions": ["action 1", "action 2", "action 3"]
}`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You write concise, actionable sales intelligence briefs. No corporate jargon. Direct and specific.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
    max_tokens: 800,
  })

  const briefContent = JSON.parse(completion.choices[0]?.message?.content || '{}')

  // Store the brief
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: brief, error } = await supabase
    .from('ci_weekly_briefs')
    .upsert({
      email_domain: domain,
      week_start: weekStartStr,
      brief_content: {
        ...briefContent,
        stats: { totalMentions: mentions.length, snMentions: snMentions.length, totalDials, totalConversations, totalMeetings },
        topCompetitors,
      },
    }, { onConflict: 'email_domain,week_start' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ brief })
}
