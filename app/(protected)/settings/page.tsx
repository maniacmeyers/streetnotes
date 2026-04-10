import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import CrmConnections from '@/components/settings/crm-connections'

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
            CRM Connections
          </h2>
          <p className="font-body text-sm text-white/60 mt-1.5">
            Connect your CRM to push notes straight to your pipeline.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-volt border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <CrmConnections />
        </Suspense>
      </section>
    </div>
  )
}
