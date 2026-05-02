import Image from 'next/image'
import Link from 'next/link'

type LogoSize = 'xs' | 'sm' | 'md' | 'lg'

interface LogoProps {
  size?: LogoSize
  href?: string | null
  priority?: boolean
  className?: string
}

const SIZE_MAP: Record<LogoSize, { h: number; w: number; cls: string }> = {
  xs: { h: 24, w: 100, cls: 'h-6 w-auto' },
  sm: { h: 32, w: 133, cls: 'h-8 w-auto' },
  md: { h: 40, w: 166, cls: 'h-10 w-auto' },
  lg: { h: 56, w: 233, cls: 'h-9 max-w-[148px] min-[380px]:h-10 min-[380px]:max-w-[166px] sm:h-14 sm:max-w-none w-auto' },
}

export default function Logo({
  size = 'md',
  href = '/',
  priority = false,
  className = '',
}: LogoProps) {
  const { h, w, cls } = SIZE_MAP[size]

  const img = (
    <Image
      src="/streetnotes_logo.png"
      alt="StreetNotes.ai"
      width={w}
      height={h}
      priority={priority}
      className={`${cls} ${className}`}
      sizes={`${w}px`}
    />
  )

  if (!href) return img

  return (
    <Link
      href={href}
      className="inline-flex items-center min-h-[44px]"
      aria-label="StreetNotes.ai home"
    >
      {img}
    </Link>
  )
}
