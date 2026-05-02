/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useMemo } from 'react'
import { Phone, Dumbbell, Check, X, Target, Sparkles } from 'lucide-react'
import {
  RealtimeSparringSession,
  type SparringScoreResult,
} from '@/components/vbrick/realtime-sparring-session'
import { SPARRING_SCENARIOS, type BDRAccent } from '@/lib/vbrick/sparring-scenarios'
import { ALL_PERSONAS, type PersonaId } from '@/lib/vbrick/sparring-personas'
import { neuTheme } from '@/lib/vbrick/theme'

type Mode = 'landing' | 'active'

const ACCENT_OPTIONS: Array<{ id: BDRAccent; label: string; sub: string }> = [
  { id: 'general', label: 'General', sub: 'Standard coaching' },
  { id: 'irish', label: 'Irish', sub: 'Fast, musical intonation' },
  { id: 'newZealand', label: 'New Zealand', sub: 'Flat vowels' },
]

export default function SparringPage() {
  const scenarios = useMemo(() => Object.values(SPARRING_SCENARIOS), [])
  const personas = useMemo(() => ALL_PERSONAS, [])

  const [mode, setMode] = useState<Mode>('landing')
  const [scenarioId, setScenarioId] = useState<string>(scenarios[0].id)
  const scenario = SPARRING_SCENARIOS[scenarioId] ?? scenarios[0]

  const [personaId, setPersonaId] = useState<PersonaId>(scenario.defaultPersonaId)
  const selectedPersona = personas.find((p) => p.id === personaId) ?? personas[0]

  const [bdrAccent, setBdrAccent] = useState<BDRAccent>(scenario.defaultAccent)
  const [scriptVisible, setScriptVisible] = useState(true)
  const [hardMode, setHardMode] = useState(false)
  const [lastResult, setLastResult] = useState<SparringScoreResult | null>(null)

  if (mode === 'active') {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <RealtimeSparringSession
          scenarioId={scenario.id}
          personaId={personaId}
          bdrAccent={bdrAccent}
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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {lastResult && <ScoreDetail result={lastResult} onRunAgain={() => setMode('active')} onDismiss={() => setLastResult(null)} />}

      <div
        className="p-8 space-y-6"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
          borderRadius: neuTheme.radii.xl,
        }}
      >
        <div className="flex items-center gap-3">
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
              Set up your practice call
            </p>
            <h1
              className="font-general-sans font-bold text-2xl tracking-tight"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {scenario.title}
            </h1>
          </div>
        </div>

        <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>
          {scenario.subtitle} · ~{scenario.estimatedMinutes} minutes.
        </p>

        {/* Scenario picker */}
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium" style={{ color: neuTheme.colors.text.muted }}>
            Scenario
          </p>
          <NeuSelect
            value={scenarioId}
            onChange={(next) => {
              setScenarioId(next)
              const s = SPARRING_SCENARIOS[next]
              if (s) {
                setPersonaId(s.defaultPersonaId)
                setBdrAccent(s.defaultAccent)
              }
            }}
            options={scenarios.map((s) => ({ value: s.id, label: s.title }))}
          />
        </div>

        {/* Stakeholder picker */}
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium" style={{ color: neuTheme.colors.text.muted }}>
            Stakeholder you&apos;re calling
          </p>
          <NeuSelect
            value={personaId}
            onChange={(next) => setPersonaId(next as PersonaId)}
            options={personas.map((p) => ({
              value: p.id,
              label: `${p.name} — ${p.title}${p.company ? ` (${p.company})` : ''}`,
            }))}
          />
          <p className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.muted }}>
            {selectedPersona.personality}
          </p>
        </div>

        {/* Accent picker */}
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium" style={{ color: neuTheme.colors.text.muted }}>
            Your accent profile
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ACCENT_OPTIONS.map((opt) => {
              const active = bdrAccent === opt.id
              return (
                <button
                  key={opt.id}
                  onClick={() => setBdrAccent(opt.id)}
                  className="text-left p-3 font-satoshi border-none cursor-pointer"
                  style={{
                    background: neuTheme.colors.bg,
                    boxShadow: active ? neuTheme.shadows.insetSm : neuTheme.shadows.raisedSm,
                    borderRadius: neuTheme.radii.sm,
                    color: active ? neuTheme.colors.accent.primary : neuTheme.colors.text.body,
                    transition: neuTheme.transitions.fast,
                  }}
                >
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: neuTheme.colors.text.muted }}>
                    {opt.sub}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Mode toggles */}
        <div className="flex items-center gap-2">
          <TogglePill active={scriptVisible} onClick={() => setScriptVisible((v) => !v)} label="Script visible" />
          <TogglePill active={hardMode} onClick={() => setHardMode((v) => !v)} label="Hard mode" />
        </div>

        {/* Start */}
        <button
          onClick={() => setMode('active')}
          className="flex items-center gap-2 px-6 py-3 font-satoshi font-semibold text-base border-none cursor-pointer"
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

        {scriptVisible && !hardMode && (
          <div className="space-y-3">
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
              style={{ color: neuTheme.colors.text.muted }}
            >
              VBRICK framework cheat card
            </p>
            <ol className="space-y-3">
              {scenario.cheatCard.map((step, i) => (
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
                    <p className="font-satoshi text-sm font-medium" style={{ color: neuTheme.colors.text.heading }}>
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
            className="p-3 font-satoshi text-xs"
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

function NeuSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 font-satoshi text-sm border-none outline-none cursor-pointer"
      style={{
        background: neuTheme.colors.bg,
        boxShadow: neuTheme.shadows.insetSm,
        borderRadius: neuTheme.radii.sm,
        color: neuTheme.colors.text.body,
        appearance: 'auto',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
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

function scoreColor(score: number): string {
  if (score >= 80) return neuTheme.colors.status.success
  if (score >= 70) return neuTheme.colors.status.warning
  return neuTheme.colors.status.danger
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function ScoreDetail({
  result,
  onRunAgain,
  onDismiss,
}: {
  result: SparringScoreResult
  onRunAgain: () => void
  onDismiss: () => void
}) {
  const color = scoreColor(result.score)
  const headline =
    result.score >= 90
      ? 'Excellent.'
      : result.score >= 80
      ? 'Great call.'
      : result.score >= 70
      ? 'Solid — room to sharpen.'
      : 'Keep reps going.'

  return (
    <div className="space-y-6">
      {/* Top: big score + headline + actions */}
      <div
        className="p-6 flex flex-wrap items-center justify-between gap-6"
        style={{
          background: neuTheme.colors.bg,
          boxShadow: neuTheme.shadows.raised,
          borderRadius: neuTheme.radii.xl,
        }}
      >
        <div className="flex items-center gap-5">
          <div
            className="flex items-center justify-center font-general-sans font-bold"
            style={{
              width: 96,
              height: 96,
              borderRadius: '9999px',
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.insetSm,
              color,
              fontSize: 36,
            }}
          >
            {result.score}
          </div>
          <div>
            <p
              className="font-general-sans font-bold text-2xl tracking-tight"
              style={{ color: neuTheme.colors.text.heading }}
            >
              {headline}
            </p>
            <p className="text-sm font-satoshi mt-1" style={{ color: neuTheme.colors.text.muted }}>
              Framework {result.frameworkScore}%
              {typeof result.accentScore === 'number' ? ` · Accent ${result.accentScore}%` : ''}
            </p>
            <p
              className="text-sm font-satoshi font-medium mt-2"
              style={{ color: result.wouldTransfer ? neuTheme.colors.status.success : neuTheme.colors.status.warning }}
            >
              {result.wouldTransfer
                ? `✓ Would have transferred you${typeof result.transferConfidence === 'number' ? ` (${result.transferConfidence}% confidence)` : ''}`
                : `✗ Probably wouldn't have transferred you${typeof result.transferConfidence === 'number' ? ` (${result.transferConfidence}% confidence)` : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRunAgain}
            className="px-5 py-2.5 font-satoshi font-semibold text-sm border-none cursor-pointer"
            style={{
              background: neuTheme.colors.accent.primary,
              color: 'white',
              borderRadius: neuTheme.radii.md,
              boxShadow: neuTheme.shadows.raisedSm,
            }}
          >
            Run it again
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-2.5 font-satoshi text-sm border-none cursor-pointer"
            style={{
              background: neuTheme.colors.bg,
              color: neuTheme.colors.text.muted,
              borderRadius: neuTheme.radii.md,
              boxShadow: neuTheme.shadows.raisedSm,
            }}
          >
            Dismiss
          </button>
        </div>
      </div>

      {/* Dimensions breakdown */}
      {result.dimensions && result.dimensions.length > 0 && (
        <div
          className="p-6 space-y-4"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.md,
          }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            Score breakdown
          </p>
          <div className="space-y-4">
            {result.dimensions.map((dim, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="font-satoshi text-sm font-medium"
                    style={{ color: neuTheme.colors.text.heading }}
                  >
                    {dim.name}
                  </span>
                  <span
                    className="font-satoshi text-sm font-semibold"
                    style={{ color: scoreColor(dim.score) }}
                  >
                    {dim.score}%
                  </span>
                </div>
                <div
                  className="relative h-2 overflow-hidden"
                  style={{
                    background: neuTheme.colors.bgLight,
                    boxShadow: neuTheme.shadows.insetSm,
                    borderRadius: '9999px',
                  }}
                >
                  <div
                    className="absolute top-0 left-0 h-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, dim.score))}%`,
                      background: scoreColor(dim.score),
                      borderRadius: '9999px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
                {dim.feedback && (
                  <p
                    className="text-xs font-satoshi mt-1.5"
                    style={{ color: neuTheme.colors.text.muted }}
                  >
                    {dim.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Framework adherence checklist */}
      {result.frameworkAnalysis && Object.keys(result.frameworkAnalysis).length > 0 && (
        <div
          className="p-6 space-y-3"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.md,
          }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            Framework adherence
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(result.frameworkAnalysis).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center gap-2.5 p-2.5"
                style={{
                  background: neuTheme.colors.bgLight,
                  boxShadow: neuTheme.shadows.insetSm,
                  borderRadius: neuTheme.radii.sm,
                }}
              >
                {value ? (
                  <Check className="w-4 h-4 shrink-0" style={{ color: neuTheme.colors.status.success }} />
                ) : (
                  <X className="w-4 h-4 shrink-0" style={{ color: neuTheme.colors.status.danger }} />
                )}
                <span className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.body }}>
                  {humanizeKey(key)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths + Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {result.strengths && result.strengths.length > 0 && (
          <div
            className="p-6 space-y-3"
            style={{
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.raisedSm,
              borderRadius: neuTheme.radii.md,
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
              style={{ color: neuTheme.colors.status.success }}
            >
              What you did well
            </p>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: neuTheme.colors.status.success }} />
                  <span className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.improvements && result.improvements.length > 0 && (
          <div
            className="p-6 space-y-3"
            style={{
              background: neuTheme.colors.bg,
              boxShadow: neuTheme.shadows.raisedSm,
              borderRadius: neuTheme.radii.md,
            }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
              style={{ color: neuTheme.colors.accent.primary }}
            >
              Focus areas
            </p>
            <ul className="space-y-2">
              {result.improvements.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Target className="w-4 h-4 shrink-0 mt-0.5" style={{ color: neuTheme.colors.accent.primary }} />
                  <span className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Script improvements (before/after) */}
      {result.scriptImprovements && result.scriptImprovements.length > 0 && (
        <div
          className="p-6 space-y-4"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.md,
          }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: neuTheme.colors.accent.primary }} />
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium"
              style={{ color: neuTheme.colors.accent.primary }}
            >
              Script refinements
            </p>
          </div>
          <div className="space-y-3">
            {result.scriptImprovements.map((item, i) => (
              <div
                key={i}
                className="p-4 space-y-2"
                style={{
                  background: neuTheme.colors.bgLight,
                  boxShadow: neuTheme.shadows.insetSm,
                  borderRadius: neuTheme.radii.sm,
                }}
              >
                <p
                  className="font-satoshi text-xs italic line-through"
                  style={{ color: neuTheme.colors.text.muted }}
                >
                  &ldquo;{item.original}&rdquo;
                </p>
                <p
                  className="font-satoshi text-sm font-medium"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  &ldquo;{item.improved}&rdquo;
                </p>
                <p className="text-xs font-satoshi" style={{ color: neuTheme.colors.text.muted }}>
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accent coaching */}
      {result.accentFeedback && (
        <div
          className="p-5"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
            borderRadius: neuTheme.radii.md,
            borderLeft: `3px solid ${neuTheme.colors.status.warning}`,
          }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-satoshi font-medium mb-2"
            style={{ color: neuTheme.colors.status.warning }}
          >
            Accent coaching
          </p>
          <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.body }}>
            {result.accentFeedback}
          </p>
        </div>
      )}
    </div>
  )
}
