import type { SupabaseClient } from '@supabase/supabase-js'

export function getWeekStart(date: Date): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function calculateConversionRate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return Math.round((numerator / denominator) * 10000) / 100
}

export async function calculateStreakDays(email: string, supabase: SupabaseClient): Promise<number> {
  // Get distinct dates with debriefs, ordered descending
  const { data } = await supabase
    .from('debrief_sessions')
    .select('created_at')
    .eq('email', email.toLowerCase())
    .not('structured_output', 'is', null)
    .order('created_at', { ascending: false })
    .limit(90)

  if (!data || data.length === 0) return 0

  const uniqueDates = [...new Set(
    data.map(d => new Date(d.created_at).toISOString().split('T')[0])
  )].sort().reverse()

  if (uniqueDates.length === 0) return 0

  // Check if today or yesterday is in the list (streak must be active)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i - 1])
    const prev = new Date(uniqueDates[i])
    const diffDays = Math.round((current.getTime() - prev.getTime()) / 86400000)
    if (diffDays === 1) {
      streak++
    } else {
      break
    }
  }

  return streak
}

interface WeekStats {
  totalCalls: number
  connectedCalls: number
  appointmentsBooked: number
  callToConversationRate: number
  conversationToAppointmentRate: number
  averageSpin: number
  bestSpin: number
  bestSpinContact: string
}

export async function getWeeklyStats(
  email: string,
  supabase: SupabaseClient,
  weekStart?: string
): Promise<WeekStats> {
  const start = weekStart || getWeekStart(new Date())
  const endDate = new Date(start)
  endDate.setDate(endDate.getDate() + 7)
  const end = endDate.toISOString().split('T')[0]

  const { data: sessions } = await supabase
    .from('debrief_sessions')
    .select('structured_output, created_at')
    .eq('email', email.toLowerCase())
    .not('structured_output', 'is', null)
    .gte('created_at', start)
    .lt('created_at', end)

  if (!sessions || sessions.length === 0) {
    return {
      totalCalls: 0,
      connectedCalls: 0,
      appointmentsBooked: 0,
      callToConversationRate: 0,
      conversationToAppointmentRate: 0,
      averageSpin: 0,
      bestSpin: 0,
      bestSpinContact: '',
    }
  }

  let totalCalls = 0
  let connectedCalls = 0
  let appointmentsBooked = 0
  let spinSum = 0
  let spinCount = 0
  let bestSpin = 0
  let bestSpinContact = ''

  for (const session of sessions) {
    const output = session.structured_output as Record<string, unknown>
    if (!output || output.mode !== 'bdr-cold-call') continue

    totalCalls++

    const disposition = output.callDisposition as string
    if (disposition === 'connected') {
      connectedCalls++
    }

    const status = output.prospectStatus as string
    if (status === 'active-opportunity') {
      appointmentsBooked++
    }

    const spin = output.spin as { composite?: number } | undefined
    if (spin?.composite) {
      spinSum += spin.composite
      spinCount++
      if (spin.composite > bestSpin) {
        bestSpin = spin.composite
        const contact = output.contactSnapshot as { name?: string; company?: string } | undefined
        bestSpinContact = contact?.name
          ? `${contact.name}${contact.company ? ` (${contact.company})` : ''}`
          : ''
      }
    }
  }

  return {
    totalCalls,
    connectedCalls,
    appointmentsBooked,
    callToConversationRate: calculateConversionRate(connectedCalls, totalCalls),
    conversationToAppointmentRate: calculateConversionRate(appointmentsBooked, connectedCalls),
    averageSpin: spinCount > 0 ? Math.round((spinSum / spinCount) * 10) / 10 : 0,
    bestSpin: Math.round(bestSpin * 10) / 10,
    bestSpinContact,
  }
}

export async function getLastWeekStats(
  email: string,
  supabase: SupabaseClient
): Promise<WeekStats> {
  const lastWeekStart = new Date()
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  return getWeeklyStats(email, supabase, getWeekStart(lastWeekStart))
}

export async function getPersonalBests(
  email: string,
  supabase: SupabaseClient
): Promise<{ bestSpin: number; bestConvRate: number; bestApptRate: number }> {
  const { data } = await supabase
    .from('vbrick_bdr_stats')
    .select('best_spin, call_to_conversation_rate, conversation_to_appointment_rate')
    .eq('bdr_email', email.toLowerCase())
    .order('week_start_date', { ascending: false })
    .limit(52)

  if (!data || data.length === 0) {
    return { bestSpin: 0, bestConvRate: 0, bestApptRate: 0 }
  }

  return {
    bestSpin: Math.max(...data.map(d => Number(d.best_spin) || 0)),
    bestConvRate: Math.max(...data.map(d => Number(d.call_to_conversation_rate) || 0)),
    bestApptRate: Math.max(...data.map(d => Number(d.conversation_to_appointment_rate) || 0)),
  }
}

export async function getTodayCallCount(
  email: string,
  supabase: SupabaseClient
): Promise<number> {
  const today = new Date().toISOString().split('T')[0]

  const { count } = await supabase
    .from('debrief_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .not('structured_output', 'is', null)
    .gte('created_at', today)

  return count || 0
}

export async function updateWeeklyStats(
  email: string,
  supabase: SupabaseClient
): Promise<void> {
  const weekStart = getWeekStart(new Date())
  const stats = await getWeeklyStats(email, supabase, weekStart)
  const streak = await calculateStreakDays(email, supabase)

  await supabase
    .from('vbrick_bdr_stats')
    .upsert(
      {
        bdr_email: email.toLowerCase(),
        week_start_date: weekStart,
        total_calls: stats.totalCalls,
        connected_calls: stats.connectedCalls,
        appointments_booked: stats.appointmentsBooked,
        call_to_conversation_rate: stats.callToConversationRate,
        conversation_to_appointment_rate: stats.conversationToAppointmentRate,
        average_spin: stats.averageSpin,
        best_spin: stats.bestSpin,
        best_spin_contact: stats.bestSpinContact,
        streak_days: streak,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'bdr_email,week_start_date' }
    )
}
