import { createClient } from '@/lib/supabase/server'
import StoriesClient from '@/components/dashboard/stories-client'

export default async function StoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <StoriesClient userEmail={user?.email ?? ''} />
}
