import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import UserSetup from '@/components/settings/user-setup'
import ActivityExport from '@/components/settings/activity-export'

export default function SettingsPage() {
  return (
    <div className="px-4 py-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md transition hover:bg-white/10 min-h-[44px]"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80">
          Configure
        </p>
        <h1 className="font-display uppercase text-4xl text-white leading-[0.85] mt-1">
          <span className="text-volt">Settings</span>
        </h1>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display uppercase text-lg text-white leading-none">
            Your Setup
          </h2>
          <p className="font-body text-sm text-white/60 mt-1.5">
            Pick your CRM and pipeline. Notes push where you tell them.
          </p>
        </div>
        <UserSetup />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display uppercase text-lg text-white leading-none">
            Export Activity
          </h2>
          <p className="font-body text-sm text-white/60 mt-1.5">
            Download your notes as a CSV for manual CRM import.
          </p>
        </div>
        <ActivityExport />
      </section>
    </div>
  )
}
