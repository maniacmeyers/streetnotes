/* eslint-disable react/no-unescaped-entities */
'use client'

import { Trophy, X, Check, ArrowRight } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'

export type InflectionPointView = {
  moment: string
  sequence?: string
  prospectLine?: string
  repSaid: string
  whyItLost: string
  shouldHaveSaid: string
}

interface InflectionCoachingProps {
  appointmentSecured: boolean
  inflectionPoints: InflectionPointView[]
  whatSealedIt: string[]
}

/**
 * "What should have been said" coaching shown after a sparring call.
 * - Call lost: per-moment rewrites (what you said vs. the line that wins the appointment).
 * - Call won: the moves that sealed the meeting.
 * Shared by the live voice recap and the (dormant) text session UI.
 */
export function InflectionCoaching({
  appointmentSecured,
  inflectionPoints,
  whatSealedIt,
}: InflectionCoachingProps) {
  if (appointmentSecured) {
    if (!whatSealedIt || whatSealedIt.length === 0) return null
    return (
      <div
        className="p-6 space-y-4"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raisedSm,
          borderRadius: neuTheme.radii.md,
          borderLeft: `3px solid ${neuTheme.colors.status.success}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color: neuTheme.colors.status.success }} />
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
            style={{ color: neuTheme.colors.status.success }}
          >
            Appointment booked — what sealed it
          </p>
        </div>
        <ul className="space-y-2">
          {whatSealedIt.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: neuTheme.colors.status.success }} />
              <span className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>
                {s}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (!inflectionPoints || inflectionPoints.length === 0) return null

  return (
    <div
      className="p-6 space-y-4"
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.raised,
        borderRadius: neuTheme.radii.md,
        borderLeft: `3px solid ${neuTheme.colors.status.danger}`,
      }}
    >
      <div>
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
          style={{ color: neuTheme.colors.status.danger }}
        >
          No appointment booked — here's where it turned
        </p>
        <p className="font-satoshi text-sm mt-1" style={{ color: neuTheme.colors.text.muted }}>
          The exact moments the meeting slipped, and the line that would have won it.
        </p>
      </div>

      <div className="space-y-3">
        {inflectionPoints.map((p, i) => (
          <div
            key={i}
            className="p-4 space-y-3"
            style={{
              background: neuTheme.colors.bgLight,
              boxShadow: neuTheme.shadows.insetSm,
              borderRadius: neuTheme.radii.sm,
            }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p
                className="font-satoshi text-sm font-semibold"
                style={{ color: neuTheme.colors.text.heading }}
              >
                Moment {i + 1} — {p.moment}
              </p>
              {p.sequence && (
                <span className="font-satoshi text-[11px]" style={{ color: neuTheme.colors.text.muted }}>
                  {p.sequence}
                </span>
              )}
            </div>

            {p.prospectLine && (
              <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>
                <span style={{ color: neuTheme.colors.text.muted }}>Prospect: </span>
                &ldquo;{p.prospectLine}&rdquo;
              </p>
            )}

            <div className="flex items-start gap-2">
              <X className="w-4 h-4 shrink-0 mt-0.5" style={{ color: neuTheme.colors.status.danger }} />
              <div>
                <p
                  className="font-satoshi text-sm italic"
                  style={{ color: neuTheme.colors.text.muted }}
                >
                  You said: &ldquo;{p.repSaid}&rdquo;
                </p>
                <p className="font-satoshi text-xs mt-0.5" style={{ color: neuTheme.colors.text.muted }}>
                  {p.whyItLost}
                </p>
              </div>
            </div>

            <div
              className="flex items-start gap-2 p-3"
              style={{
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.raisedSm,
                borderRadius: neuTheme.radii.sm,
              }}
            >
              <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: neuTheme.colors.status.success }} />
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.18em] font-satoshi font-medium mb-1"
                  style={{ color: neuTheme.colors.status.success }}
                >
                  Should have said
                </p>
                <p
                  className="font-satoshi text-sm font-medium"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  &ldquo;{p.shouldHaveSaid}&rdquo;
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
