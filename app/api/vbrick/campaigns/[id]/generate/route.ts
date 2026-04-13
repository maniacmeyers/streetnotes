import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOpenAIClient } from '@/lib/openai/server'
import { getCampaignGenerationPrompt, getCampaignAnalysisPrompt } from '@/lib/vbrick/campaign-prompts'
import { CHANNEL_ORDER } from '@/lib/vbrick/campaign-types'
import type { FrameworkType, ChannelType } from '@/lib/vbrick/campaign-types'

export const runtime = 'nodejs'
export const maxDuration = 120

// POST: Generate all channel messaging for a campaign using AI
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createAdminClient()

  // 1. Fetch campaign + files
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  const { data: files } = await supabase
    .from('campaign_files')
    .select('extracted_text, file_name')
    .eq('campaign_id', params.id)

  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded. Upload campaign materials first.' }, { status: 400 })
  }

  // 2. Mark campaign as generating
  await supabase
    .from('campaigns')
    .update({ status: 'generating', updated_at: new Date().toISOString() })
    .eq('id', params.id)

  try {
    const openai = getOpenAIClient()

    // 3. Combine all file text into one context block
    const combinedText = files
      .map(f => `--- ${f.file_name} ---\n${f.extracted_text || '[no text]'}`)
      .join('\n\n')
      .substring(0, 30000) // Cap at ~30k chars to stay within context limits

    // 4. Analyze campaign materials first
    const { system: analysisSystem, user: analysisUser } = getCampaignAnalysisPrompt(combinedText)
    const analysisCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: analysisSystem },
        { role: 'user', content: analysisUser },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
      max_tokens: 2000,
    })

    let metadata = {}
    try {
      metadata = JSON.parse(analysisCompletion.choices[0]?.message?.content || '{}')
    } catch {
      metadata = { analysis_error: 'Could not parse campaign analysis' }
    }

    // Update campaign metadata
    await supabase
      .from('campaigns')
      .update({ metadata: { ...metadata, total_files: files.length, generated_at: new Date().toISOString() } })
      .eq('id', params.id)

    // 5. Generate messaging for each framework x channel combination
    const frameworks: FrameworkType[] = (campaign.frameworks as FrameworkType[]) || ['maniac_method']
    const channels: ChannelType[] = CHANNEL_ORDER
    const results: Array<{ channel: string; framework: string; status: string }> = []

    for (const framework of frameworks) {
      for (const channel of channels) {
        try {
          const { system, user } = getCampaignGenerationPrompt(
            framework,
            channel,
            combinedText,
            campaign.name,
            campaign.event_name || undefined,
            campaign.target_audience || undefined
          )

          const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
            temperature: 0.4,
            response_format: { type: 'json_object' },
            max_tokens: 3000,
          })

          const raw = completion.choices[0]?.message?.content
          let content = {}
          try {
            content = JSON.parse(raw || '{}')
          } catch {
            content = { raw_output: raw, parse_error: true }
          }

          // Upsert channel content (unique on campaign_id + channel_type + framework)
          const { error: upsertError } = await supabase
            .from('campaign_channels')
            .upsert(
              {
                campaign_id: params.id,
                channel_type: channel,
                framework,
                content,
                status: 'draft',
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'campaign_id,channel_type,framework' }
            )

          results.push({
            channel,
            framework,
            status: upsertError ? `error: ${upsertError.message}` : 'ok',
          })
        } catch (err) {
          results.push({
            channel,
            framework,
            status: `error: ${err instanceof Error ? err.message : 'unknown'}`,
          })
        }
      }
    }

    // 6. Mark campaign as pending approval
    await supabase
      .from('campaigns')
      .update({ status: 'pending_approval', updated_at: new Date().toISOString() })
      .eq('id', params.id)

    return NextResponse.json({
      generated: results.length,
      results,
      metadata,
    })
  } catch (error) {
    // Reset status on failure
    await supabase
      .from('campaigns')
      .update({ status: 'draft', updated_at: new Date().toISOString() })
      .eq('id', params.id)

    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: `Generation failed: ${msg}` }, { status: 502 })
  }
}
