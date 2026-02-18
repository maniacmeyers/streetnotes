'use client'

import { signout } from '@/app/(auth)/login/actions'

export default function SignOutButton() {
  return (
    <form action={signout}>
      <button
        type="submit"
        className="min-h-[44px] px-4 rounded-md border border-gray-300 bg-white text-base font-medium text-gray-700 hover:bg-gray-50"
      >
        Sign out
      </button>
    </form>
  )
}
