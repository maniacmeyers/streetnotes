import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/dashboard/bottom-nav'
import FieldGlowLogo from '@/components/fieldglow/logo'

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
    <div className="fg-app relative overflow-x-hidden">
      <div className="fg-mobile-frame relative">
        <header className="fg-header sticky top-0 z-40">
          <div className="flex min-h-[52px] items-center justify-between">
            <a href="/dashboard" className="inline-flex min-h-[48px] items-center" aria-label="Field Glow home">
              <FieldGlowLogo size="md" />
            </a>
            <span className="fg-eyebrow max-w-[150px] truncate">
              {user.email?.split('@')[0]}
            </span>
          </div>
        </header>

        <main id="main-content" className="relative z-10">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
