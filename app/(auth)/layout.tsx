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
      <div className="relative z-10">{children}</div>
    </div>
  )
}
