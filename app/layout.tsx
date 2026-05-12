import type { Metadata, Viewport } from 'next'
import { DM_Sans, Plus_Jakarta_Sans, Space_Mono } from 'next/font/google'
import './globals.css'
import PWARegister from '@/components/pwa-register'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://fieldglow.app'),
  title: {
    default: 'Field Glow | Voice-to-Salesforce Field Intelligence',
    template: '%s | Field Glow',
  },
  description:
    'Field Glow turns field brain dumps into Salesforce-ready updates, live competitor intel, and Story Vault material that gets smarter with every debrief.',
  keywords: [
    'voice to Salesforce',
    'aesthetic sales reps',
    'medical aesthetics CRM',
    'field sales notes',
    'Salesforce field sales',
    'sales call debrief',
    'live competitive intelligence for sales teams',
    'sales story vault',
  ],
  applicationName: 'Field Glow',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Field Glow | Voice-to-Salesforce Field Intelligence',
    description:
      'Brain dump after a field visit and get Salesforce-ready notes, live competitor intel, and story material your team can reuse.',
    url: 'https://fieldglow.app',
    siteName: 'Field Glow',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Field Glow app icon',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Field Glow | Voice-to-Salesforce Field Intelligence',
    description:
      'Brain dump after a field visit and get Salesforce-ready notes, live competitor intel, and reusable story material.',
    images: ['/icon-512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Field Glow',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#FAF6EE',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${dmSans.variable} ${spaceMono.variable} font-body min-h-screen bg-[#FAF6EE] text-[#1A1410] antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-[#A8855A] focus:px-4 focus:py-2 focus:font-heading focus:text-sm focus:font-bold focus:text-[#FAF6EE]"
        >
          Skip to main content
        </a>
        {children}
        <PWARegister />
      </body>
    </html>
  )
}
