import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from '@/components/sign-out-button'
import VoiceNoteCapture from '@/components/voice-note-capture'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">StreetNotes</h1>
          <p className="text-base text-gray-500">Your voice-to-CRM assistant</p>
        </div>
        <Link
          href="/settings"
          className="text-sm text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          Settings
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-base text-gray-700">
          Welcome, <span className="font-medium">{user?.email}</span>
        </p>
      </div>

      <VoiceNoteCapture />

      <SignOutButton />
    </main>
  )
}
