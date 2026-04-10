'use client'

import { signout } from '@/app/(auth)/login/actions'
import { BrutalButton } from '@/components/streetnotes/brutal'

export default function SignOutButton() {
  return (
    <form action={signout}>
      <BrutalButton type="submit" variant="outline" size="sm">
        Sign out
      </BrutalButton>
    </form>
  )
}
