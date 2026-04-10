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
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-volt min-w-[44px] min-h-[44px]"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </Link>
      </div>

      <div>
        <h1
          className="font-display uppercase text-4xl sm:text-5xl text-white leading-[0.85]"
          style={{ textShadow: '3px 3px 0px #000000' }}
        >
          Settings
        </h1>
      </div>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-display uppercase text-xl text-white leading-none">
            CRM Connections
          </h2>
          <p className="font-body text-sm italic text-gray-300 mt-1">
            Connect your CRM to push notes straight to your pipeline.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-4 border-volt border-t-transparent animate-spin" />
            </div>
          }
        >
          <CrmConnections />
        </Suspense>
      </section>
    </div>
  )
}
