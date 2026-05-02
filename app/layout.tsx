import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Space_Mono, Ranchers } from 'next/font/google'
import './globals.css'
import PWARegister from '@/components/pwa-register'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700', '800'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
})

const ranchers = Ranchers({
  subsets: ['latin'],
  variable: '--font-display',
  weight: '400',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://streetnotes.ai'),
  title: {
    default: 'StreetNotes.ai | Voice-to-CRM for Sales Reps',
    template: '%s | StreetNotes.ai',
  },
  description:
    'Try StreetNotes free. Talk for 60 seconds after a sales visit and get CRM fields, tasks, and opportunity updates ready for Salesforce or Veeva.',
  keywords: [
    'voice to CRM',
    'sales reps',
    'medical aesthetics CRM',
    'field sales notes',
    'Veeva CRM',
    'sales call debrief',
    'competitive intelligence for sales teams',
  ],
  applicationName: 'StreetNotes',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'StreetNotes.ai | Voice-to-CRM for Sales Reps',
    description:
      'Try StreetNotes free. Talk after a sales visit and get CRM fields, tasks, and opportunity updates ready for Salesforce or Veeva.',
    url: 'https://streetnotes.ai',
    siteName: 'StreetNotes.ai',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'StreetNotes.ai logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StreetNotes.ai | Voice-to-CRM for Sales Reps',
    description:
      'Try the free 60-second visit recap and see the CRM fields and opportunity update it creates.',
    images: ['/icon-512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StreetNotes',
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
  themeColor: '#061222',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} ${spaceMono.variable} ${ranchers.variable} font-body min-h-screen bg-dark antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-volt focus:text-black focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:uppercase focus:font-bold focus:border-2 focus:border-black"
        >
          Skip to main content
        </a>
        {children}
        <PWARegister />
      </body>
    </html>
  )
}
