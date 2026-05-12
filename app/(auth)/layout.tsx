import FieldGlowLogo from '@/components/fieldglow/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fg-app overflow-x-hidden">
      <div className="fg-mobile-frame">
        <header className="fg-header sticky top-0 z-40">
          <div className="flex min-h-[52px] items-center justify-between">
            <a href="/" className="inline-flex min-h-[48px] items-center" aria-label="Field Glow home">
              <FieldGlowLogo size="md" />
            </a>
          </div>
        </header>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}
