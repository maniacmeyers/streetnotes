import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const [todayResult, previousResult] = await Promise.all([
      supabase
        .from('vbrick_daily_intentions')
        .select('*')
        .eq('bdr_email', email.toLowerCase())
        .eq('date', today)
        .maybeSingle(),
      supabase
        .from('vbrick_daily_intentions')
        .select('*')
        .eq('bdr_email', email.toLowerCase())
        .lt('date', today)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    return NextResponse.json({
      today: todayResult.data,
      previous: previousResult.data,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch intentions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { email, know_answer, feel_answer, do_answer } = await request.json()

    if (!email || !know_answer || !feel_answer || !do_answer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('vbrick_daily_intentions')
      .upsert(
        {
          bdr_email: email.toLowerCase(),
          date: today,
          know_answer,
          feel_answer,
          do_answer,
        },
        { onConflict: 'bdr_email,date' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save intention' }, { status: 500 })
  }
}
