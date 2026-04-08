import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <DashboardClient userEmail={user?.email ?? ''} />
}
