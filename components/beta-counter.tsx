'use client'

import { useEffect, useState } from 'react'

interface Props {
  className?: string
}

export default function BetaCounter({ className = '' }: Props) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/waitlist/count')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.count === 'number') {
          setCount(data.count)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (count === null) return null

  return (
    <div
      className={`inline-flex items-center gap-2 glass rounded-full px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] ${className}`}
      aria-live="polite"
    >
      <span aria-hidden="true" className="text-base leading-none">🔥</span>
      <span className="font-bold text-volt tabular-nums">{count}</span>
      <span className="text-white/70">aesthetic pros on the waitlist</span>
    </div>
  )
}
