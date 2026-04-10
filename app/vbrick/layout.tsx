import type { Metadata } from 'next'
import { Inter, Fira_Code } from 'next/font/google'
import localFont from 'next/font/local'

export const metadata: Metadata = {
  title: 'Vbrick Command Center — Call Intelligence',
  description: 'AI-powered call intelligence for the Vbrick sales team.',
}

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
    { path: '../../public/fonts/GeneralSans-Semibold.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/GeneralSans-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-general-sans',
  display: 'swap',
})

const satoshi = localFont({
  src: [
    { path: '../../public/fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-satoshi',
  display: 'swap',
})

export default function VbrickLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${inter.variable} ${firaCode.variable} ${generalSans.variable} ${satoshi.variable} min-h-screen`}
      style={{ background: '#e0e5ec' }}
    >
      {children}
    </div>
  )
}
