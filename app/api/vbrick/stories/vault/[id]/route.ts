import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// PATCH: Toggle team sharing for a vault entry
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (typeof body.shared_to_team === 'boolean') {
    updateData.shared_to_team = body.shared_to_team
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('story_vault_entries')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}
