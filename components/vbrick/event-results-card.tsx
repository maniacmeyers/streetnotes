'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check, AlertCircle, AlertTriangle } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { GlassCardElevated } from './glass-card'
import type { EventConversationOutput, EventTemperature } from '@/lib/debrief/types'

const NOT_MENTIONED = 'Not mentioned'

function isMissing(value: string | null | undefined): boolean {
  if (!value) return true
  const trimmed = value.trim()
  return trimmed.length === 0 || trimmed === NOT_MENTIONED
}

function temperatureColor(t: EventTemperature): { bg: string; fg: string } {
  if (t === 'hot') return { bg: '#FEE2E2', fg: '#dc2626' }
  if (t === 'warm') return { bg: '#FFFBEB', fg: '#d97706' }
  if (t === 'cold') return { bg: '#F3F4F6', fg: '#6B7280' }
  return { bg: '#F3F4F6', fg: '#9CA3AF' } // not-a-fit
}

interface CompletenessReport {
  status: 'complete' | 'minor-gaps' | 'thin'
  missing: string[]
}

function evaluateCompleteness(data: EventConversationOutput): CompletenessReport {
  const missing: string[] = []

  if (isMissing(data.contactSnapshot?.name)) missing.push('Name')
  if (isMissing(data.contactSnapshot?.company)) missing.push('Company')
  if (!data.servicenowModules || data.servicenowModules.length === 0) missing.push('ServiceNow stack')
  if (isMissing(data.currentSolution)) missing.push('Current solution')
  if (isMissing(data.theTruth)) missing.push('The truth')
  if (isMissing(data.followupCommitment)) missing.push('Followup commitment')
  if (isMissing(data.nextAction?.action)) missing.push('Next action')

  let status: CompletenessReport['status'] = 'complete'
  if (missing.length >= 3) status = 'thin'
  else if (missing.length >= 1) status = 'minor-gaps'

  return { status, missing }
}

function CompletenessChip({ report }: { report: CompletenessReport }) {
  if (report.status === 'complete') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-inter font-medium"
        style={{ background: '#ECFDF5', color: '#16a34a' }}
      >
        <Check className="w-3 h-3" />
        Complete debrief — all fields captured
      </div>
    )
  }
  if (report.status === 'minor-gaps') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-inter font-medium"
        style={{ background: '#FFFBEB', color: '#d97706' }}
      >
        <AlertCircle className="w-3 h-3" />
        Missing: {report.missing.join(', ')}
      </div>
    )
  }
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-inter font-medium"
      style={{ background: '#FEE2E2', color: '#dc2626' }}
    >
      <AlertTriangle className="w-3 h-3" />
      Thin debrief — {report.missing.length} fields missing
    </div>
  )
}

interface VbrickEventResultsCardProps {
  data: EventConversationOutput
  /** Optional ISO timestamp for the "K26 Event Debrief · 2:34pm" header. */
  timestamp?: string
}

export function VbrickEventResultsCard({ data, timestamp }: VbrickEventResultsCardProps) {
  const [aeOpen, setAeOpen] = useState(false)
  const completeness = evaluateCompleteness(data)
  const tempPalette = temperatureColor(data.temperature)

  const headerTime = timestamp
    ? new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return (
    <GlassCardElevated>
      {/* Header — mode label + completeness chip */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.18em] font-inter font-bold"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            K26 Event Debrief
          </p>
          <p className="text-[11px] font-inter" style={{ color: neuTheme.colors.text.muted }}>
            {headerTime}
          </p>
        </div>
        <CompletenessChip report={completeness} />
      </div>

      {/* Contact + Engagement chips */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] uppercase tracking-[0.1em] font-inter mb-0.5"
            style={{ color: neuTheme.colors.text.muted }}
          >
            Contact
          </p>
          <p className="font-inter font-bold" style={{ color: neuTheme.colors.text.heading }}>
            {data.contactSnapshot?.name || 'Unknown'}
          </p>
          <p className="text-xs" style={{ color: neuTheme.colors.text.muted }}>
            {[data.contactSnapshot?.title, data.contactSnapshot?.company].filter(Boolean).join(' · ') || ''}
          </p>
          {data.contactSnapshot?.email && data.contactSnapshot.email !== NOT_MENTIONED && (
            <p className="text-xs mt-0.5" style={{ color: neuTheme.colors.text.muted }}>
              {data.contactSnapshot.email}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-inter font-bold uppercase tracking-wider"
            style={{ background: neuTheme.colors.bg, boxShadow: neuTheme.shadows.raisedSm, color: neuTheme.colors.accent.primary }}
          >
            {data.engagementType?.replace(/-/g, ' ')}
          </span>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-inter font-bold uppercase tracking-wider"
            style={{ background: tempPalette.bg, color: tempPalette.fg }}
          >
            {data.temperature?.replace(/-/g, ' ')}
          </span>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-inter font-bold uppercase tracking-wider"
            style={{
              background: data.badgeCollected ? '#ECFDF5' : neuTheme.colors.bg,
              color: data.badgeCollected ? '#16a34a' : neuTheme.colors.text.muted,
              boxShadow: data.badgeCollected ? undefined : neuTheme.shadows.insetSm,
            }}
          >
            badge {data.badgeCollected ? '✓' : '—'}
          </span>
        </div>
      </div>

      {/* ServiceNow stack */}
      {data.servicenowModules && data.servicenowModules.length > 0 && (
        <>
          <Divider />
          <Section label="ServiceNow stack">
            <div className="flex flex-wrap gap-1.5">
              {data.servicenowModules.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-inter font-medium"
                  style={{
                    background: `${neuTheme.colors.accent.primary}15`,
                    color: neuTheme.colors.accent.primary,
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </Section>
        </>
      )}

      {/* The Truth */}
      {!isMissing(data.theTruth) && (
        <>
          <Divider />
          <Section label="The Truth">
            <p className="text-sm font-inter" style={{ color: neuTheme.colors.text.heading }}>
              {data.theTruth}
            </p>
          </Section>
        </>
      )}

      {/* Demo + current solution */}
      <Divider />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section label="Demo watched">
          <p className="text-sm font-inter capitalize" style={{ color: neuTheme.colors.text.heading }}>
            {data.demoWatched || 'none'}
          </p>
        </Section>
        <Section label="Current solution">
          <p
            className="text-sm font-inter"
            style={{
              color: isMissing(data.currentSolution)
                ? neuTheme.colors.text.muted
                : neuTheme.colors.text.heading,
            }}
          >
            {isMissing(data.currentSolution) ? '—' : data.currentSolution}
          </p>
        </Section>
      </div>

      {/* Objections */}
      {Array.isArray(data.objections) && data.objections.length > 0 && (
        <>
          <Divider />
          <Section label="Objections">
            <ul className="space-y-1">
              {data.objections.map((o, i) => (
                <li
                  key={i}
                  className="text-xs font-inter"
                  style={{ color: neuTheme.colors.text.heading }}
                >
                  • {o}
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}

      {/* CI Mentions */}
      {Array.isArray(data.ciMentions) && data.ciMentions.length > 0 && (
        <>
          <Divider />
          <Section label="Competitive intel">
            <ul className="space-y-2">
              {data.ciMentions.map((m, i) => (
                <li key={i} className="text-xs font-inter" style={{ color: neuTheme.colors.text.heading }}>
                  <span className="font-bold">{m.competitorName}</span>
                  <span style={{ color: neuTheme.colors.text.muted }}>
                    {' '}— {m.sentiment} · {m.mentionCategory}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </>
      )}

      {/* Followup + Next action */}
      {(!isMissing(data.followupCommitment) || data.nextAction?.action) && (
        <>
          <Divider />
          {!isMissing(data.followupCommitment) && (
            <Section label="Followup commitment">
              <p className="text-sm font-inter" style={{ color: neuTheme.colors.text.heading }}>
                {data.followupCommitment}
              </p>
            </Section>
          )}
          {data.nextAction?.action && (
            <div className="mt-3">
              <p
                className="text-[10px] uppercase tracking-[0.1em] font-inter mb-1"
                style={{ color: neuTheme.colors.text.muted }}
              >
                Next Action
              </p>
              <p className="text-sm font-inter font-medium" style={{ color: neuTheme.colors.accent.primary }}>
                {data.nextAction.action}
                {data.nextAction.when && (
                  <span style={{ color: neuTheme.colors.text.muted }}>
                    {' '}— {data.nextAction.when}
                  </span>
                )}
              </p>
            </div>
          )}
        </>
      )}

      {/* AE Briefing — collapsible */}
      {data.aeBriefing && (
        <>
          <Divider />
          <button
            onClick={() => setAeOpen((v) => !v)}
            className="w-full flex items-center justify-between text-left bg-transparent border-none p-0 cursor-pointer"
            style={{ touchAction: 'manipulation' }}
          >
            <span
              className="text-[10px] uppercase tracking-[0.1em] font-inter"
              style={{ color: neuTheme.colors.text.muted }}
            >
              AE Briefing
            </span>
            {aeOpen ? (
              <ChevronUp className="w-4 h-4" style={{ color: neuTheme.colors.text.muted }} />
            ) : (
              <ChevronDown className="w-4 h-4" style={{ color: neuTheme.colors.text.muted }} />
            )}
          </button>
          {aeOpen && (
            <p
              className="text-xs font-inter leading-relaxed mt-2"
              style={{ color: neuTheme.colors.text.body }}
            >
              {data.aeBriefing}
            </p>
          )}
        </>
      )}
    </GlassCardElevated>
  )
}

function Divider() {
  return (
    <div
      className="h-px my-4"
      style={{
        background: `linear-gradient(90deg, transparent, ${neuTheme.colors.shadow}40, transparent)`,
      }}
    />
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-[0.1em] font-inter mb-1"
        style={{ color: neuTheme.colors.text.muted }}
      >
        {label}
      </p>
      {children}
    </div>
  )
}
