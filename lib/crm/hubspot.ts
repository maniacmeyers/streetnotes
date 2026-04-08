import { SupabaseClient } from '@supabase/supabase-js'
import { getValidTokens } from './token-refresh'

interface HubSpotPipelineStage {
  label: string
  stageId: string
  displayOrder: number
  probability: number
  isClosed: boolean
}

interface HubSpotPipeline {
  pipelineId: string
  label: string
  stages: HubSpotPipelineStage[]
}

/**
 * Fetch deal pipelines and stages from the user's HubSpot account.
 * Returns all pipelines with their stages.
 */
export async function fetchHubSpotStages(
  supabase: SupabaseClient,
  userId: string
): Promise<HubSpotPipeline[]> {
  const tokens = await getValidTokens(supabase, userId, 'hubspot')
  if (!tokens) throw new Error('No valid HubSpot connection')

  const res = await fetch(
    'https://api.hubapi.com/crm/v3/pipelines/deals',
    {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    }
  )

  if (!res.ok) {
    throw new Error(`HubSpot pipelines fetch failed: ${res.status}`)
  }

  const data = await res.json()

  return data.results.map(
    (pipeline: {
      id: string
      label: string
      stages: Array<{
        id: string
        label: string
        displayOrder: number
        metadata: { probability?: string; isClosed?: string }
      }>
    }) => ({
      pipelineId: pipeline.id,
      label: pipeline.label,
      stages: pipeline.stages
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((stage) => ({
          label: stage.label,
          stageId: stage.id,
          displayOrder: stage.displayOrder,
          probability: parseFloat(stage.metadata?.probability || '0'),
          isClosed: stage.metadata?.isClosed === 'true',
        })),
    })
  )
}
