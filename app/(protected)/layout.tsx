import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/dashboard/bottom-nav'

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
    <div className="min-h-[100dvh]" style={{ background: '#e0e5ec' }}>
      <main className="max-w-md mx-auto pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
