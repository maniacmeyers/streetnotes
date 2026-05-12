import Image from 'next/image'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes: Record<'sm' | 'md' | 'lg', { mark: number; text: string; gap: string }> = {
  sm: { mark: 28, text: 'text-[0.95rem]', gap: 'gap-2' },
  md: { mark: 34, text: 'text-[1.1rem]', gap: 'gap-2.5' },
  lg: { mark: 44, text: 'text-[1.35rem]', gap: 'gap-3' },
}

export default function FieldGlowLogo({ size = 'md', className = '' }: LogoProps) {
  const config = sizes[size]

  return (
    <span
      className={`fg-masthead inline-flex items-center ${config.gap} ${config.text} ${className}`}
      style={{ color: '#1A1410' }}
      aria-label="Field Glow"
    >
      <span
        className="inline-flex shrink-0 items-center justify-center"
        style={{ width: config.mark, height: config.mark }}
        aria-hidden="true"
      >
        <Image
          src="/fieldglow/brand/field-glow-mark.png"
          alt=""
          width={config.mark}
          height={config.mark}
          priority={size !== 'sm'}
        />
      </span>
      <span>Field</span>
      <span>Glow</span>
    </span>
  )
}
