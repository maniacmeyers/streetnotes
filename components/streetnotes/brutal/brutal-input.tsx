import React from 'react'

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/**
 * Brutalist text input. 4px black border, zero radius, mono label.
 */
export const BrutalInput = React.forwardRef<HTMLInputElement, BrutalInputProps>(
  function BrutalInput({ label, error, className = '', id, ...rest }, ref) {
    const inputId = id || rest.name
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold text-white"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`bg-white border-4 border-black font-body text-black placeholder:text-black/40 px-4 min-h-[48px] focus:outline-none focus:shadow-neo-sm transition-shadow duration-100 ${className}`}
          {...rest}
        />
        {error && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-red-500 font-bold">
            {error}
          </p>
        )}
      </div>
    )
  },
)

interface BrutalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const BrutalTextarea = React.forwardRef<HTMLTextAreaElement, BrutalTextareaProps>(
  function BrutalTextarea({ label, error, className = '', id, ...rest }, ref) {
    const inputId = id || rest.name
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold text-white"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`bg-white border-4 border-black font-body text-black placeholder:text-black/40 px-4 py-3 min-h-[120px] focus:outline-none focus:shadow-neo-sm transition-shadow duration-100 resize-y ${className}`}
          {...rest}
        />
        {error && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-red-500 font-bold">
            {error}
          </p>
        )}
      </div>
    )
  },
)
