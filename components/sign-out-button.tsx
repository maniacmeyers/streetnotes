'use client'

import { signout } from '@/app/(auth)/login/actions'

export default function SignOutButton() {
  return (
    <form action={signout}>
      <button
        type="submit"
        className="fg-secondary-action px-5 text-[#8B6B40]"
      >
        Sign out
      </button>
    </form>
  )
}
