'use client'

import { neuTheme } from '@/lib/vbrick/theme'

/**
 * Pre-record reminder shown above the mic button when the BDR is in K26
 * event-conversation mode. Lists the eight things that make a complete
 * booth debrief so the AI has good material to extract.
 *
 * Visible only on the recorder idle screen during the K26 window.
 */
export function EventCheatSheet() {
  const items = [
    { label: 'Who', detail: 'name, title, company' },
    { label: 'Demo', detail: 'did they watch it? full or partial?' },
    { label: 'ServiceNow stack', detail: 'which products do they use?' },
    { label: 'Current video', detail: 'what are they on today? pain points?' },
    { label: 'Temperature', detail: 'gut feel: hot, warm, cold, not-a-fit' },
    { label: 'Objections', detail: 'anything they pushed back on' },
    { label: 'Commitment', detail: 'what did they agree to do next?' },
    { label: 'Badge', detail: 'did you scan their badge or get a card?' },
  ]

  return (
    <div
      className="rounded-xl px-4 py-3 mb-4"
      style={{
        background: `linear-gradient(135deg, ${neuTheme.colors.accent.primary}10, ${neuTheme.colors.accent.primary}05)`,
        boxShadow: neuTheme.shadows.insetSm,
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.18em] font-inter font-bold mb-2"
        style={{ color: neuTheme.colors.accent.primary }}
      >
        K26 booth debrief — try to cover:
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.label}
            className="text-[11px] font-inter leading-snug"
            style={{ color: neuTheme.colors.text.body }}
          >
            <span className="font-bold" style={{ color: neuTheme.colors.text.heading }}>
              {item.label}
            </span>
            <span style={{ color: neuTheme.colors.text.muted }}> — {item.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
