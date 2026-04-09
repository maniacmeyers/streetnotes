import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Space_Mono, Ranchers, Inter, Fira_Code } from 'next/font/google'
import localFont from 'next/font/local'
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

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  weight: ['400', '500', '600', '700'],
})

const generalSans = localFont({
  src: [
    { path: '../public/fonts/GeneralSans-Semibold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/GeneralSans-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-general-sans',
  display: 'swap',
})

const satoshi = localFont({
  src: [
    { path: '../public/fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
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
        className={`${plusJakarta.variable} ${spaceMono.variable} ${ranchers.variable} ${inter.variable} ${firaCode.variable} ${generalSans.variable} ${satoshi.variable} font-body min-h-screen bg-dark antialiased`}
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
