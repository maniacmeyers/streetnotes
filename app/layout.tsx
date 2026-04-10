import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Space_Mono, Ranchers } from 'next/font/google'
import './globals.css'

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
  title: 'StreetNotes.ai — Voice-to-CRM for Sales Reps',
  description:
    'Stop losing deals because you forgot what happened in the parking lot. Hit record, talk, and your CRM updates itself.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#121212',
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
      </body>
    </html>
  )
}
