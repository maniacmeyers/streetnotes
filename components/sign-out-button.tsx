'use client'

import { signout } from '@/app/(auth)/login/actions'

export default function SignOutButton() {
  return (
    <form action={signout}>
      <button
        type="submit"
        className="glass rounded-xl px-5 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-white/60 hover:text-red-400 hover:border-red-400/40 transition-all cursor-pointer min-h-[44px]"
      >
        Sign out
      </button>
    </form>
  )
}
