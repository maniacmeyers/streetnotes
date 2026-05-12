'use client'

import { createClient } from '@/lib/supabase/client'

export default function GoogleSignInButton() {
  const handleSignIn = async () => {
    const supabase = createClient()
    const redirectUrl = new URL('/auth/callback', window.location.origin)
    redirectUrl.searchParams.set('next', '/dashboard')

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString(),
      },
    })
  }

  return (
    <button
      onClick={handleSignIn}
      type="button"
      className="fg-secondary-action w-full px-4"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4A28A]/30 text-sm font-extrabold text-[#8B6B40]">
        G
      </span>
      Continue with Google
    </button>
  )
}
