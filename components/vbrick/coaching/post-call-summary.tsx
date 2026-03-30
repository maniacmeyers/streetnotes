'use client'

import { motion } from 'motion/react'
import { TrendingUp, AlertTriangle, Target, X } from 'lucide-react'
import { NeuCard, NeuButton } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'
import type { CoachingSummary } from './coaching-panel'

interface PostCallSummaryProps {
  summary: CoachingSummary
  onClose: () => void
}

function scoreColor(score: number): string {
  if (score <= 3) return '#dc2626'
  if (score <= 6) return '#d97706'
  if (score <= 8) return '#6366f1'
  return '#16a34a'
}

export function PostCallSummary({ summary, onClose }: PostCallSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <NeuCard padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-general-sans font-bold text-lg" style={{ color: neuTheme.colors.text.heading }}>
            Post-Call Coaching
          </h2>
          <NeuButton variant="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </NeuButton>
        </div>

        {/* Quality Score */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="flex items-center justify-center font-general-sans font-bold text-2xl"
            style={{
              width: 64,
              height: 64,
              borderRadius: neuTheme.radii.lg,
              boxShadow: neuTheme.shadows.raised,
              color: scoreColor(summary.quality_score),
            }}
          >
            {summary.quality_score.toFixed(1)}
          </div>
          <div>
            <p className="font-general-sans font-semibold text-sm" style={{ color: neuTheme.colors.text.heading }}>
              Call Quality Score
            </p>
            <p className="text-xs font-satoshi" style={{ color: neuTheme.colors.text.muted }}>
              {summary.talk_time_assessment}
            </p>
          </div>
        </div>

        {/* The One Thing */}
        <div
          className="mb-6 px-4 py-3"
          style={{
            borderRadius: neuTheme.radii.md,
            boxShadow: neuTheme.shadows.inset,
            borderLeft: `3px solid ${neuTheme.colors.accent.primary}`,
          }}
        >
          <p className="text-[10px] uppercase tracking-widest font-general-sans font-semibold mb-1" style={{ color: neuTheme.colors.accent.primary }}>
            One Thing to Improve
          </p>
          <p className="text-sm font-satoshi" style={{ color: neuTheme.colors.text.heading }}>
            {summary.one_thing}
          </p>
        </div>

        {/* Strengths */}
        {summary.strengths.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: '#16a34a' }} />
              <p className="text-xs uppercase tracking-widest font-general-sans font-semibold" style={{ color: '#16a34a' }}>
                Strengths
              </p>
            </div>
            <ul className="space-y-1">
              {summary.strengths.map((s, i) => (
                <li key={i} className="text-sm font-satoshi" style={{ color: neuTheme.colors.text.body }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {summary.improvements.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" style={{ color: neuTheme.colors.accent.primary }} />
              <p className="text-xs uppercase tracking-widest font-general-sans font-semibold" style={{ color: neuTheme.colors.accent.primary }}>
                Improvements
              </p>
            </div>
            <ul className="space-y-1">
              {summary.improvements.map((s, i) => (
                <li key={i} className="text-sm font-satoshi" style={{ color: neuTheme.colors.text.body }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Objections */}
        {summary.objections_handled.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: '#d97706' }} />
              <p className="text-xs uppercase tracking-widest font-general-sans font-semibold" style={{ color: '#d97706' }}>
                Objections Handled
              </p>
            </div>
            <ul className="space-y-1">
              {summary.objections_handled.map((s, i) => (
                <li key={i} className="text-sm font-satoshi" style={{ color: neuTheme.colors.text.body }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Competitors */}
        {summary.competitors_mentioned.length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest font-general-sans font-semibold mb-2" style={{ color: neuTheme.colors.text.muted }}>
              Competitors Mentioned
            </p>
            <div className="flex flex-wrap gap-2">
              {summary.competitors_mentioned.map((c, i) => (
                <span
                  key={i}
                  className="text-xs font-satoshi px-2.5 py-1"
                  style={{
                    borderRadius: neuTheme.radii.full,
                    boxShadow: neuTheme.shadows.raisedSm,
                    color: neuTheme.colors.text.body,
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <NeuButton variant="accent" className="w-full mt-4" onClick={onClose}>
          Done
        </NeuButton>
      </NeuCard>
    </motion.div>
  )
}
