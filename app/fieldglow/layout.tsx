import type { Metadata } from 'next'
import { DM_Sans, Fraunces } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-fg-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fg-display',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FieldGlow — Voice-to-Salesforce Field Intelligence',
  description:
    'Brain dump after a field visit. FieldGlow turns the note into Salesforce-ready updates, live competitive intel, and Story Vault material that learns from every debrief.',
  alternates: { canonical: '/fieldglow' },
  openGraph: {
    title: 'FieldGlow — Brain Dump Once. Field Intelligence Compounds.',
    description:
      'Voice-to-Salesforce for aesthetic sales teams, plus live competitive intel and a Story Vault that gets smarter with every note.',
    url: 'https://fieldglow.app/fieldglow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FieldGlow — Voice-to-Salesforce for Aesthetic Sales',
    description:
      'Brain dump after the visit. Salesforce, competitive intel, and Story Vault material come back ready to review.',
  },
}

export default function FieldGlowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${dmSans.variable} ${fraunces.variable} fieldglow-root`}>
      {children}
    </div>
  )
}
