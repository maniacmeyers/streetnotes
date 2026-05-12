import type { Metadata } from 'next'
import Link from 'next/link'
import '@/components/fieldglow/styles.css'
import FieldGlowLogo from '@/components/fieldglow/logo'

export const metadata: Metadata = {
  title: 'FieldGlow — Free Brain Dump for Aesthetic Sales Reps',
  description:
    'Brain dump after a field visit. Get structured Salesforce notes, follow-up tasks, competitor intel, and a downloadable PDF — built for medical aesthetic sales.',
  alternates: { canonical: '/fieldglow/debrief' },
}

export default function FieldGlowDebriefLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header
        className="sticky top-0 z-50 backdrop-blur-sm"
        style={{
          background: 'rgba(242, 235, 223, 0.85)',
          borderBottom: '1px solid var(--fg-line)',
        }}
      >
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-4 sm:px-10 sm:py-5">
          <Link
            href="/fieldglow"
            className="cursor-pointer"
            aria-label="Back to FieldGlow"
          >
            <FieldGlowLogo size="sm" />
          </Link>
          <span
            className="border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.26em]"
            style={{
              borderColor: 'var(--fg-gilt)',
              color: 'var(--fg-gilt-deep)',
            }}
          >
            Free Tool
          </span>
        </div>
      </header>
      {children}
    </>
  )
}
