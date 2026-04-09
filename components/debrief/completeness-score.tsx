'use client'

import { motion } from 'motion/react'
import type { DebriefStructuredOutput } from '@/lib/debrief/types'

interface CompletenessScoreProps {
  data: DebriefStructuredOutput
}

interface ScoreItem {
  label: string
  earned: number
  max: number
  captured: boolean
}

function computeScore(d: DebriefStructuredOutput): {
  total: number
  items: ScoreItem[]
} {
  const items: ScoreItem[] = []
  const nm = 'Not mentioned'

  // Company (1pt)
  const hasCompany = d.dealSnapshot.companyName !== nm
  items.push({ label: 'Company', earned: hasCompany ? 1 : 0, max: 1, captured: hasCompany })

  // Contacts (max 2pt, 1 per named attendee)
  const namedAttendees = d.attendees.filter((a) => a.name !== nm).length
  const contactPts = Math.min(namedAttendees, 2)
  items.push({ label: 'Contacts', earned: contactPts, max: 2, captured: contactPts > 0 })

  // Deal stage (1pt)
  const hasStage = d.dealSnapshot.dealStage !== nm
  items.push({ label: 'Deal Stage', earned: hasStage ? 1 : 0, max: 1, captured: hasStage })

  // Next step (1pt)
  const hasNextStep = d.dealSnapshot.nextStep !== nm
  items.push({ label: 'Next Step', earned: hasNextStep ? 1 : 0, max: 1, captured: hasNextStep })

  // Follow-ups (max 1.5pt, 0.5 per task)
  const taskPts = Math.min(d.followUpTasks.length * 0.5, 1.5)
  items.push({ label: 'Follow-ups', earned: taskPts, max: 1.5, captured: d.followUpTasks.length > 0 })

  // Pain points (max 1pt, 0.5 per pain)
  const painPts = Math.min(d.painPoints.length * 0.5, 1)
  items.push({ label: 'Pain Points', earned: painPts, max: 1, captured: d.painPoints.length > 0 })

  // Value (0.5pt)
  const hasValue = d.dealSnapshot.estimatedValue !== nm
  items.push({ label: 'Deal Value', earned: hasValue ? 0.5 : 0, max: 0.5, captured: hasValue })

  // Close date (0.5pt)
  const hasClose = d.dealSnapshot.closeDate !== nm
  items.push({ label: 'Close Date', earned: hasClose ? 0.5 : 0, max: 0.5, captured: hasClose })

  // Competitors (0.5pt)
  const hasComp = d.competitorsMentioned.length > 0
  items.push({ label: 'Competitors', earned: hasComp ? 0.5 : 0, max: 0.5, captured: hasComp })

  // Opportunity notes (1pt)
  const hasNotes = (d.opportunityNotes?.length || 0) > 50
  items.push({ label: 'Opp Notes', earned: hasNotes ? 1 : 0, max: 1, captured: hasNotes })

  const total = Math.round(items.reduce((sum, i) => sum + i.earned, 0) * 10) / 10
  return { total, items }
}

function getScoreColor(score: number): string {
  if (score <= 3) return '#EF4444'
  if (score <= 6) return '#F59E0B'
  if (score <= 8) return '#22C55E'
  return '#00E676'
}

function getAssessment(score: number): string {
  if (score <= 3) return 'Bare minimum. Key details missing.'
  if (score <= 6) return 'Getting there. Fill in the gaps.'
  if (score <= 8) return 'Solid debrief. CRM is happy.'
  return 'Complete. Nothing left on the table.'
}

export default function CompletenessScore({ data }: CompletenessScoreProps) {
  const { total, items } = computeScore(data)
  const color = getScoreColor(total)
  const pct = (total / 10) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.4 }}
      className="bg-white rounded-2xl shadow-[0_2px_6px_rgba(0,0,0,0.06),0_6px_20px_rgba(0,0,0,0.06)] border border-gray-200/80 overflow-hidden"
    >
      {/* Header */}
      <div
        className="px-6 py-3.5 bg-gray-800 flex items-center justify-between"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <h3 className="text-[13px] font-semibold text-white tracking-tight">
          Debrief Score
        </h3>
        <span className="text-[11px] font-semibold text-gray-400 bg-gray-700 px-2.5 py-1 rounded-full">
          {total}/10
        </span>
      </div>

      <div className="px-6 py-5">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[12px] font-medium mt-2" style={{ color }}>
            {getAssessment(total)}
          </p>
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={`text-[13px] ${item.captured ? 'text-emerald-500' : 'text-gray-300'}`}>
                {item.captured ? '\u2713' : '\u2717'}
              </span>
              <span className={`text-[12px] ${item.captured ? 'text-gray-700' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
