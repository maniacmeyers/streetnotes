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
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest font-bold text-white/50 hover:text-volt min-w-[44px] min-h-[44px] cursor-pointer transition-colors"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </Link>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80">
          Configure
        </p>
        <h1 className="font-bold text-3xl text-white leading-tight mt-1">
          Settings
        </h1>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-bold text-lg text-white leading-none">
            CRM Connections
          </h2>
          <p className="font-body text-sm text-white/50 mt-1.5">
            Connect your CRM to push notes straight to your pipeline.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="glass rounded-2xl flex items-center justify-center py-12">
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
