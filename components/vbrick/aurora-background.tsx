'use client'

const NOISE_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E`

export default function AuroraBackground({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: '#061222' }}
    >
      <style>{`
        @keyframes aurora-drift {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-5%, 3%) rotate(2deg); }
        }
      `}</style>

      {/* Aurora mesh gradient layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: [
            'radial-gradient(ellipse at 20% 50%, rgba(126,212,247,0.04) 0%, transparent 50%)',
            'radial-gradient(ellipse at 80% 20%, rgba(27,62,111,0.06) 0%, transparent 40%)',
            'radial-gradient(ellipse at 50% 80%, rgba(126,212,247,0.02) 0%, transparent 50%)',
          ].join(', '),
          animation: 'aurora-drift 20s ease-in-out infinite alternate',
        }}
      />

      {/* Noise grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 100,
          opacity: 0.015,
          mixBlendMode: 'overlay' as const,
          backgroundImage: `url("${NOISE_SVG}")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
