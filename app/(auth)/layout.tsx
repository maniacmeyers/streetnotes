import Logo from '@/components/brand/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[100dvh] bg-dark text-white overflow-x-hidden">
      {/* Background watermark, landing-page style */}
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 font-display text-[300px] text-white pointer-events-none select-none hidden lg:block"
        style={{ opacity: 0.03 }}
        aria-hidden="true"
      >
        REC
      </div>
      <header className="sticky top-0 z-40 border-b border-volt/20 bg-dark/80 backdrop-blur-xl pt-safe">
        <div className="max-w-md mx-auto px-4 flex items-center justify-between h-14">
          <Logo size="sm" href="/" priority />
        </div>
      </header>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
