import React from 'react'

type Variant = 'volt' | 'black' | 'white' | 'red' | 'amber'

interface BrutalBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  volt: 'bg-black text-volt border-2 border-black',
  black: 'bg-volt text-black border-2 border-black',
  white: 'bg-white text-black border-2 border-black',
  red: 'bg-red-600 text-white border-2 border-black',
  amber: 'bg-amber-500 text-black border-2 border-black',
}

/**
 * Brutalist badge. Mono font, all caps, tight tracking.
 */
export function BrutalBadge({
  variant = 'volt',
  className = '',
  children,
  ...rest
}: BrutalBadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] uppercase tracking-[0.1em] font-bold px-2.5 py-1 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  )
}
