import { DM_Sans, Fraunces } from 'next/font/google'
import '@/components/fieldglow/styles.css'
import FieldGlowLandingContent from '@/components/fieldglow/landing-page'

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

export default function HomePage() {
  return (
    <div className={`${dmSans.variable} ${fraunces.variable} fieldglow-root`}>
      <FieldGlowLandingContent />
    </div>
  )
}
