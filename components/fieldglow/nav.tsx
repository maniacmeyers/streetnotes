import Link from 'next/link'
import FieldGlowLogo from './logo'

export default function FieldGlowNav() {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm"
      style={{
        background: 'rgba(242, 235, 223, 0.82)',
        borderBottom: '1px solid var(--fg-line)',
      }}
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="cursor-pointer" aria-label="FieldGlow home">
          <FieldGlowLogo size="sm" />
        </Link>

        <nav
          className="hidden items-center gap-9 md:flex"
          aria-label="Primary"
        >
          <a href="#what" className="fg-link cursor-pointer">
            What it does
          </a>
          <a href="#how" className="fg-link cursor-pointer">
            How it works
          </a>
          <a href="#why" className="fg-link cursor-pointer">
            Why it&apos;s smarter
          </a>
          <a href="#leaders" className="fg-link cursor-pointer">
            For leaders
          </a>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="fg-link hidden cursor-pointer sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/fieldglow/debrief"
            className="fg-link hidden cursor-pointer sm:inline-flex"
          >
            Try free
          </Link>
          <a
            href="#apply"
            className="fg-btn-gilt cursor-pointer text-[0.72rem] sm:text-[0.78rem]"
            style={{ padding: '0.7rem 1.1rem' }}
          >
            Apply
          </a>
        </div>
      </div>
    </header>
  )
}
