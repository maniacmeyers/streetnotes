import { SupabaseClient } from '@supabase/supabase-js'
import { getValidTokens } from './token-refresh'

interface PipedriveStage {
  id: number
  name: string
  order_nr: number
  pipeline_id: number
}

interface PipedrivePipeline {
  id: number
  name: string
  stages: PipedriveStage[]
}

/**
 * Fetch deal pipelines and stages from the user's Pipedrive account.
 * Returns all pipelines with their stages.
 */
export async function fetchPipedriveStages(
  supabase: SupabaseClient,
  userId: string
): Promise<PipedrivePipeline[]> {
  const tokens = await getValidTokens(supabase, userId, 'pipedrive')
  if (!tokens) throw new Error('No valid Pipedrive connection')

  const res = await fetch(
    'https://api.pipedrive.com/v1/pipelines?api_token=' + tokens.accessToken
  )

  if (!res.ok) {
    throw new Error(`Pipedrive pipelines fetch failed: ${res.status}`)
  }

  const data = await res.json()

  return data.data.map(
    (pipeline: {
      id: number
      name: string
      stages: PipedriveStage[]
    }) => ({
      id: pipeline.id,
      name: pipeline.name,
      stages: pipeline.stages,
    })
  )
}