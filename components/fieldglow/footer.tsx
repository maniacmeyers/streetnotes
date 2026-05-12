import Link from 'next/link'
import FieldGlowLogo from './logo'

export default function FieldGlowFooter() {
  return (
    <footer
      className="relative px-6 py-20 sm:px-10"
      style={{
        borderTop: '1px solid var(--fg-line)',
        background: 'var(--fg-paper)',
      }}
    >
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-12 sm:grid-cols-12 sm:gap-10">
          <div className="sm:col-span-5">
            <FieldGlowLogo size="md" />
            <p
              className="mt-5 max-w-[42ch] text-[1rem] leading-[1.6]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              Voice-to-Salesforce field intelligence for medical aesthetic
              sales. Brain dump after the visit, capture the market signal, and
              get smarter every call.
            </p>
          </div>

          <div className="sm:col-span-3">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: 'var(--fg-mute)' }}
            >
              Sections
            </p>
            <ul
              className="mt-5 space-y-3 text-[0.95rem]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              <li><a href="#what" className="fg-link">What it does</a></li>
              <li><a href="#how" className="fg-link">How it works</a></li>
              <li><a href="#why" className="fg-link">Why it gets smarter</a></li>
              <li><a href="#leaders" className="fg-link">For leaders</a></li>
            </ul>
          </div>

          <div className="sm:col-span-4">
            <p
              className="text-[0.7rem] uppercase tracking-[0.26em]"
              style={{ color: 'var(--fg-mute)' }}
            >
              Company
            </p>
            <ul
              className="mt-5 space-y-3 text-[0.95rem]"
              style={{ color: 'var(--fg-ink-2)' }}
            >
              <li>
                <Link href="/login" className="fg-link">Log in</Link>
              </li>
              <li>
                <Link href="/privacy" className="fg-link">Privacy</Link>
              </li>
              <li>
                <Link href="/terms" className="fg-link">Terms</Link>
              </li>
              <li>
                <Link href="/contact" className="fg-link">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="fg-rule mt-16" />

        <div className="mt-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p
            className="text-[0.72rem] uppercase tracking-[0.22em]"
            style={{ color: 'var(--fg-mute)' }}
          >
            © {new Date().getFullYear()} FieldGlow — A ForgeTime venture.
          </p>
          <p
            className="text-[0.78rem]"
            style={{ color: 'var(--fg-ink-2)' }}
          >
            Built for the medical aesthetic sales floor.
          </p>
        </div>
      </div>
    </footer>
  )
}
