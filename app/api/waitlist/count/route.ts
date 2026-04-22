import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const BASELINE = 24

export const revalidate = 60

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ count: BASELINE })
    }

    return NextResponse.json({ count: (count ?? 0) + BASELINE })
  } catch {
    return NextResponse.json({ count: BASELINE })
  }
}
