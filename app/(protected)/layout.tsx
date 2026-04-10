import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/dashboard/bottom-nav'
import Logo from '@/components/brand/logo'

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
      <header className="sticky top-0 z-40 border-b border-volt/20 bg-dark/80 backdrop-blur-xl pt-safe">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between h-14">
          <Logo size="sm" href="/dashboard" priority />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            {user.email?.split('@')[0]}
          </span>
        </div>
      </header>
      <main className="max-w-md mx-auto pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
