/* Editorial ornament — replaces the gradient mic blob.
   A thin gilt circle with a hairline-stroke microphone, drawn like a
   beauty-magazine mast ornament. */

type Props = {
  size?: number
  className?: string
}

export default function GlowMic({ size = 88, className = '' }: Props) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer hairline circle */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="absolute inset-0"
        fill="none"
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          stroke="var(--fg-gilt)"
          strokeWidth="0.6"
          opacity="0.7"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="var(--fg-gilt)"
          strokeWidth="0.4"
          opacity="0.35"
          strokeDasharray="2 3"
        />
      </svg>

      {/* Microphone glyph — editorial line drawing */}
      <svg
        viewBox="0 0 32 32"
        width={size * 0.4}
        height={size * 0.4}
        fill="none"
        stroke="var(--fg-ink)"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative"
      >
        <rect x="12" y="4" width="8" height="16" rx="4" />
        <path d="M8 14a8 8 0 0 0 16 0" />
        <line x1="16" y1="22" x2="16" y2="28" />
        <line x1="12" y1="28" x2="20" y2="28" />
      </svg>
    </span>
  )
}
