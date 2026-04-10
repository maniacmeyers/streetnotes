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
    <div className="min-h-[100dvh] bg-[#061222] text-white relative overflow-x-hidden">
      {/* Ambient volt glow wash — same energy as /debrief */}
      <div
        aria-hidden="true"
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none opacity-50 z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(0,230,118,0.12) 0%, rgba(0,230,118,0.03) 40%, transparent 70%)',
        }}
      />
      <header className="sticky top-0 z-40 border-b border-volt/20 bg-[#061222]/80 backdrop-blur-xl pt-safe">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between h-14">
          <Logo size="sm" href="/dashboard" priority />
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            {user.email?.split('@')[0]}
          </span>
        </div>
      </header>
      <main className="max-w-md mx-auto pb-24 relative z-10">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
