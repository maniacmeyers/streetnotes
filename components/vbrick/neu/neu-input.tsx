'use client'

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { neuTheme } from '@/lib/vbrick/theme'

interface NeuInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const NeuInput = forwardRef<HTMLInputElement, NeuInputProps>(
  ({ label, className = '', style, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-satoshi font-medium uppercase tracking-widest mb-2"
            style={{ color: neuTheme.colors.text.muted }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className="w-full font-satoshi text-sm outline-none"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.inset,
            borderRadius: neuTheme.radii.md,
            border: 'none',
            padding: '14px 20px',
            color: neuTheme.colors.text.body,
            transition: neuTheme.transitions.default,
            ...style,
          }}
          {...props}
        />
      </div>
    )
  }
)

NeuInput.displayName = 'NeuInput'

interface NeuTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export const NeuTextarea = forwardRef<HTMLTextAreaElement, NeuTextareaProps>(
  ({ label, className = '', style, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className={className}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-satoshi font-medium uppercase tracking-widest mb-2"
            style={{ color: neuTheme.colors.text.muted }}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className="w-full font-satoshi text-sm outline-none resize-none"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.inset,
            borderRadius: neuTheme.radii.md,
            border: 'none',
            padding: '14px 20px',
            color: neuTheme.colors.text.body,
            transition: neuTheme.transitions.default,
            ...style,
          }}
          {...props}
        />
      </div>
    )
  }
)

NeuTextarea.displayName = 'NeuTextarea'
