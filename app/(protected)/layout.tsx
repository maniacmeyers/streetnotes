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
    <div className="min-h-[100dvh] bg-dark text-white">
      <main className="max-w-md mx-auto pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
