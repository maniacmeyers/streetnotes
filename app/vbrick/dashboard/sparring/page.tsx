/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState } from 'react'
import { Phone, Dumbbell } from 'lucide-react'
import {
  RealtimeSparringSession,
  type SparringScoreResult,
} from '@/components/vbrick/realtime-sparring-session'
import { SPARRING_SCENARIOS } from '@/lib/vbrick/sparring-scenarios'
import { neuTheme } from '@/lib/vbrick/theme'

type Mode = 'landing' | 'active'

const QUICK_SCENARIO = SPARRING_SCENARIOS['bending-spoons-k26']

export default function SparringPage() {
  const [mode, setMode] = useState<Mode>('landing')
  const [scriptVisible, setScriptVisible] = useState(true)
  const [hardMode, setHardMode] = useState(false)
  const [lastResult, setLastResult] = useState<SparringScoreResult | null>(null)

  if (mode === 'active') {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <RealtimeSparringSession
          scenarioId={QUICK_SCENARIO.id}
          hardMode={hardMode}
          scriptVisible={scriptVisible}
          onEnd={(result) => {
            if (result) setLastResult(result)
            setMode('landing')
          }}
          onCancel={() => setMode('landing')}
        />
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">
      {lastResult && (
        <div
          className="p-4 flex items-center justify-between"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.md,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center font-bold"
              style={{
                width: 56,
                height: 56,
                borderRadius: '9999px',
                background: neuTheme.colors.bg,
                boxShadow: neuTheme.shadows.insetSm,
                color:
                  lastResult.score >= 80
                    ? neuTheme.colors.status.success
                    : lastResult.score >= 70
                    ? neuTheme.colors.status.warning
                    : neuTheme.colors.status.danger,
                fontSize: 20,
              }}
            >
              {lastResult.score}
            </div>
            <div>
              <p
                className="font-general-sans font-semibold text-base"
                style={{ color: neuTheme.colors.text.heading }}
              >
                {lastResult.score >= 80
                  ? 'Great call.'
                  : lastResult.score >= 70
                  ? 'Solid.'
                  : 'Keep reps going.'}
              </p>
              <p className="text-xs font-satoshi" style={{ color: neuTheme.colors.text.muted }}>
                Framework {lastResult.frameworkScore}%
                {lastResult.wouldTransfer ? ' · Would transfer ✓' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMode('active')}
            className="px-4 py-2 font-satoshi text-sm font-medium border-none cursor-pointer"
            style={{
              background: neuTheme.colors.accent.primary,
              color: 'white',
              borderRadius: neuTheme.radii.sm,
              boxShadow: neuTheme.shadows.raisedSm,
            }}
          >
            Run it again
          </button>
        </div>
      )}

      <div
        className="p-8"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
          borderRadius: neuTheme.radii.xl,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: neuTheme.radii.sm,
              background: neuTheme.colors.accent.primary,
              boxShadow: neuTheme.shadows.raisedSm,
            }}
          >
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
              style={{ color: neuTheme.colors.accent.primary }}
            >
              This week's play
            </p>
            <h1
              className="font-general-sans font-bold text-2xl tracking-tight"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {QUICK_SCENARIO.title}
            </h1>
          </div>
        </div>

        <p className="font-satoshi text-sm mb-6" style={{ color: neuTheme.colors.text.muted }}>
          {QUICK_SCENARIO.subtitle} · ~{QUICK_SCENARIO.estimatedMinutes} minutes.
        </p>

        <button
          onClick={() => setMode('active')}
          className="flex items-center gap-2 px-6 py-3 font-satoshi font-semibold text-base border-none cursor-pointer mb-6"
          style={{
            background: neuTheme.colors.accent.primary,
            color: 'white',
            borderRadius: neuTheme.radii.md,
            boxShadow: neuTheme.shadows.raised,
          }}
        >
          <Phone className="w-4 h-4" />
          Start Practice Call
        </button>

        <div className="flex items-center gap-2">
          <TogglePill active={scriptVisible} onClick={() => setScriptVisible((v) => !v)} label="Script visible" />
          <TogglePill active={hardMode} onClick={() => setHardMode((v) => !v)} label="Hard mode" />
        </div>

        {scriptVisible && !hardMode && (
          <div className="mt-6 space-y-3">
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
              style={{ color: neuTheme.colors.text.muted }}
            >
              Your three-step script
            </p>
            <ol className="space-y-3">
              {QUICK_SCENARIO.cheatCard.map((step, i) => (
                <li
                  key={i}
                  className="p-3 flex items-start gap-3"
                  style={{
                    background: neuTheme.colors.bgLight,
                    boxShadow: neuTheme.shadows.insetSm,
                    borderRadius: neuTheme.radii.sm,
                  }}
                >
                  <span
                    className="flex items-center justify-center shrink-0 font-bold text-xs"
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '9999px',
                      background: neuTheme.colors.accent.primary,
                      color: 'white',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p
                      className="font-satoshi text-sm font-medium"
                      style={{ color: neuTheme.colors.text.heading }}
                    >
                      {step.label}
                    </p>
                    <p className="font-satoshi text-xs mt-0.5" style={{ color: neuTheme.colors.text.muted }}>
                      {step.hint}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {hardMode && (
          <div
            className="mt-6 p-3 font-satoshi text-xs"
            style={{
              background: neuTheme.colors.bgLight,
              boxShadow: neuTheme.shadows.insetSm,
              borderRadius: neuTheme.radii.sm,
              borderLeft: `3px solid ${neuTheme.colors.status.danger}`,
              color: neuTheme.colors.text.body,
            }}
          >
            <strong>Hard mode:</strong> cheat card hidden, prospect is skeptical and guarded. Be specific or they hang up.
          </div>
        )}
      </div>
    </div>
  )
}

function TogglePill({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 font-satoshi text-xs font-medium border-none cursor-pointer"
      style={{
        background: neuTheme.colors.bg,
        boxShadow: active ? neuTheme.shadows.insetSm : neuTheme.shadows.raisedSm,
        color: active ? neuTheme.colors.accent.primary : neuTheme.colors.text.muted,
        borderRadius: neuTheme.radii.full,
        transition: neuTheme.transitions.fast,
      }}
    >
      {label}
    </button>
  )
}
