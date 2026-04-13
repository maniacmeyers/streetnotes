import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { buildHubspotRows, buildSalesforceRows, toCsv, HUBSPOT_HEADERS, SALESFORCE_HEADERS } from '@/lib/notes/csv-export'

const QuerySchema = z.object({
  flavor: z.enum(['salesforce', 'hubspot']),
  from: z.string().optional(),
  to: z.string().optional(),
  unexported: z.enum(['true', 'false']).optional(),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const parsed = QuerySchema.safeParse({
    flavor: request.nextUrl.searchParams.get('flavor'),
    from: request.nextUrl.searchParams.get('from') || undefined,
    to: request.nextUrl.searchParams.get('to') || undefined,
    unexported: request.nextUrl.searchParams.get('unexported') || undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const { flavor, from, to, unexported } = parsed.data

  // Rate limit: 10 exports per hour
  const { count: recentCount } = await supabase
    .from('crm_export_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', new Date(Date.now() - 3_600_000).toISOString())

  if ((recentCount ?? 0) >= 10) {
    return new Response('Rate limited. Max 10 exports per hour.', {
      status: 429,
      headers: { 'Retry-After': '3600' },
    })
  }

  // Query notes with hard row cap
  let query = supabase
    .from('notes')
    .select('id, created_at, structured_output')
    .order('created_at', { ascending: false })
    .limit(5000)

  if (unexported === 'true') query = query.is('exported_at', null)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const { data: notes, error: dbError } = await query

  if (dbError) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const rows = flavor === 'hubspot'
    ? buildHubspotRows(notes ?? [])
    : buildSalesforceRows(notes ?? [])

  const headers = flavor === 'hubspot' ? HUBSPOT_HEADERS : SALESFORCE_HEADERS
  const csv = toCsv(headers, rows)
  const body = new TextEncoder().encode(csv)

  // Stamp exported notes so they don't appear in "not yet exported" again
  const exportedIds = (notes ?? []).map(n => n.id)
  if (exportedIds.length > 0) {
    await supabase
      .from('notes')
      .update({ exported_at: new Date().toISOString() })
      .in('id', exportedIds)
  }

  // Log export
  await supabase.from('crm_export_log').insert({
    user_id: user.id,
    flavor,
    date_from: from ?? null,
    date_to: to ?? null,
    row_count: rows.length,
    byte_size: body.byteLength,
    client_info: (request.headers.get('user-agent') ?? '').slice(0, 255),
  })

  const dateStr = new Date().toISOString().slice(0, 10)
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="streetnotes-${flavor}-${dateStr}.csv"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
