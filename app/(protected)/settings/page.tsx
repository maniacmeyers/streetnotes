import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import UserSetup from '@/components/settings/user-setup'
import ActivityExport from '@/components/settings/activity-export'
import SignOutButton from '@/components/sign-out-button'

export default function SettingsPage() {
  return (
    <div className="fg-page flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="fg-secondary-action px-4"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div>
        <h1 className="fg-title">
          Settings
        </h1>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-[21px] font-extrabold tracking-[-0.02em] text-[#1A1410]">
            Your Setup
          </h2>
          <p className="mt-1.5 text-[15px] leading-6 text-[#3D332A]">
            Pick your pipeline. Notes push where you tell them.
          </p>
        </div>
        <UserSetup />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-[21px] font-extrabold tracking-[-0.02em] text-[#1A1410]">
            Export Activity
          </h2>
          <p className="mt-1.5 text-[15px] leading-6 text-[#3D332A]">
            Download your notes as a Salesforce CSV for manual import.
          </p>
        </div>
        <ActivityExport />
      </section>

      <section className="mb-6 mt-2 flex justify-start">
        <SignOutButton />
      </section>
    </div>
  )
}
