import React from 'react'

type Variant = 'primary' | 'volt' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  asChild?: false
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-black text-volt border-4 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1',
  volt:
    'bg-volt text-black border-4 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:shadow-none active:translate-x-1 active:translate-y-1',
  outline:
    'bg-transparent text-volt border-4 border-volt hover:bg-volt hover:text-black',
  ghost: 'bg-transparent text-volt border-none hover:text-white',
  danger:
    'bg-red-600 text-white border-4 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs min-h-[44px]',
  md: 'px-5 py-3 text-sm sm:text-base min-h-[44px]',
  lg: 'px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-xl min-h-[52px]',
}

/**
 * Brutalist button. All caps, display font, hard shadow, press-in animation.
 */
export function BrutalButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  type = 'button',
  ...rest
}: BrutalButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 font-display uppercase cursor-pointer transition-transform duration-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-neo-sm ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
