import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { getContactPersonalizationPrompt } from '@/lib/vbrick/campaign-prompts'
import type { FrameworkType, ChannelType, CampaignChannel } from '@/lib/vbrick/campaign-types'

export const runtime = 'nodejs'
export const maxDuration = 60

// GET: Fetch personalized scripts for a campaign
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(request.url)
  const company = searchParams.get('company')

  const supabase = await createClient()

  let query = supabase
    .from('campaign_contact_scripts')
    .select('*')
    .eq('campaign_id', params.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (company) query = query.eq('company', company)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ scripts: data || [] })
}

// POST: Generate personalized scripts for a specific contact
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { contact_name, contact_title, company, module_stack, company_size, industry, channel_type, framework } = body as {
    contact_name: string
    contact_title?: string
    company: string
    module_stack?: string[]
    company_size?: string
    industry?: string
    channel_type: ChannelType
    framework: FrameworkType
  }

  if (!contact_name || !company || !channel_type || !framework) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch the base channel content
  const { data: channel } = await supabase
    .from('campaign_channels')
    .select('*')
    .eq('campaign_id', params.id)
    .eq('channel_type', channel_type)
    .eq('framework', framework)
    .single() as { data: CampaignChannel | null }

  if (!channel) {
    return NextResponse.json({ error: 'Channel content not found. Generate campaign messaging first.' }, { status: 404 })
  }

  try {
    const openai = getOpenAIClient()

    const { system, user } = getContactPersonalizationPrompt(
      framework,
      channel_type,
      JSON.stringify(channel.content, null, 2),
      contact_name,
      contact_title || '',
      company,
      module_stack || [],
      company_size,
      industry
    )

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    })

    const personalizedText = completion.choices[0]?.message?.content || ''

    // Save the personalized script
    const { data: script, error: insertError } = await supabase
      .from('campaign_contact_scripts')
      .insert({
        campaign_id: params.id,
        channel_id: channel.id,
        contact_name,
        contact_title: contact_title || null,
        company,
        module_stack: module_stack || [],
        company_size: company_size || null,
        industry: industry || null,
        personalized_content: {
          [channel_type]: personalizedText,
          framework,
          generated_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ script })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Personalization failed: ${msg}` }, { status: 502 })
  }
}
