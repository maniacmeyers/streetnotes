import { createClient } from '@/lib/supabase/server'
import IntelClient from '@/components/dashboard/intel-client'

export default async function IntelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <IntelClient userEmail={user?.email ?? ''} />
}
