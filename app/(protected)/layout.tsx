import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="max-w-md mx-auto min-h-[100dvh] flex flex-col" style={{ background: '#e0e5ec' }}>
      {children}
    </main>
  )
}
