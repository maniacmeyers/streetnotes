import { Suspense } from 'react'
import Link from 'next/link'
import CrmConnections from '@/components/settings/crm-connections'

export default function SettingsPage() {
  return (
    <div className="px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-gray-500 hover:text-gray-700 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          &larr;
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">CRM Connections</h2>
        <p className="text-sm text-gray-500">
          Connect your CRM to push structured notes directly into your pipeline.
        </p>
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        }>
          <CrmConnections />
        </Suspense>
      </section>
    </div>
  )
}
