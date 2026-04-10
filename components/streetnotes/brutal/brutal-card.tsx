import React from 'react'

type Variant = 'white' | 'black' | 'volt' | 'dark'

interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  hoverPress?: boolean
  padded?: boolean
}

const variantClasses: Record<Variant, string> = {
  white: 'bg-white text-black',
  black: 'bg-black text-white',
  volt: 'bg-volt text-black',
  dark: 'bg-[#1a1a1a] text-white',
}

/**
 * Brutalist card: hard 3–4px black border, hard offset shadow, zero radius.
 * Use `hoverPress` for interactive tiles that physically press on active.
 */
export function BrutalCard({
  variant = 'white',
  hoverPress = false,
  padded = true,
  className = '',
  children,
  ...rest
}: BrutalCardProps) {
  const press = hoverPress
    ? 'cursor-pointer transition-transform duration-100 active:translate-x-1 active:translate-y-1 active:shadow-none sm:hover:translate-x-1 sm:hover:translate-y-1 sm:hover:shadow-none'
    : ''
  return (
    <div
      className={`relative border-3 sm:border-4 border-black shadow-neo-sm sm:shadow-neo ${
        padded ? 'p-5 sm:p-6' : ''
      } ${variantClasses[variant]} ${press} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
