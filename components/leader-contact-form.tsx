'use client'

import { useState, FormEvent } from 'react'

export default function LeaderContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    note: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.email || !form.name || !form.company) return

    setStatus('loading')
    try {
      const res = await fetch('/api/leader-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', company: '', role: '', note: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div role="status" aria-live="polite" className="glass-volt rounded-2xl p-8 text-center">
        <p className="font-bold text-3xl text-white mb-2">Got it.</p>
        <p className="font-body text-white/70">
          Michael will reach out directly within two business days.
        </p>
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-3 sm:py-4 text-base text-white placeholder:text-white/40 bg-transparent outline-none min-h-[44px] rounded-xl border border-white/10 focus:border-volt/60 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 sm:p-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="leader-name" className="sr-only">Your name</label>
          <input
            id="leader-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Your name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="leader-email" className="sr-only">Work email</label>
          <input
            id="leader-email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="Work email"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="leader-company" className="sr-only">Company / brand</label>
          <input
            id="leader-company"
            type="text"
            required
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder="Company or brand"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="leader-role" className="sr-only">Role</label>
          <input
            id="leader-role"
            type="text"
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            placeholder="Role (e.g., VP Sales)"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="leader-note" className="sr-only">What would you like to discuss?</label>
        <textarea
          id="leader-note"
          value={form.note}
          onChange={(e) => update('note', e.target.value)}
          placeholder="Team size, rough timeline, anything specific you want to cover…"
          rows={3}
          className={`${inputClass} resize-none min-h-[92px]`}
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full sm:w-auto bg-volt text-black font-bold text-base sm:text-lg px-8 py-4 rounded-xl uppercase hover:bg-volt/90 active:bg-volt/80 transition-all duration-200 cursor-pointer disabled:opacity-50 min-h-[44px] shadow-glow-volt"
      >
        {status === 'loading' ? 'Sending…' : 'Request a call'}
      </button>
      {status === 'error' && (
        <p role="alert" className="font-mono text-xs uppercase tracking-[0.15em] text-red-400">
          Something went wrong. Try again or email michael at streetnotes dot ai.
        </p>
      )}
    </form>
  )
}
