'use client'

import { useMemo } from 'react'
import {
  Users,
  CheckSquare,
  AlertTriangle,
  Flame,
  Swords,
  Package,
  Building2,
} from 'lucide-react'
import type { DebriefStructuredOutput } from '@/lib/debrief/types'

interface DealMindMapProps {
  data: DebriefStructuredOutput
}

interface Branch {
  key: string
  label: string
  color: string
  accentBg: string
  Icon: typeof Users
  items: string[]
}

function useBranches(data: DebriefStructuredOutput): Branch[] {
  return useMemo(() => {
    const branches: Branch[] = []

    if (data.attendees.length > 0 && data.attendees[0].name !== 'Not mentioned') {
      branches.push({
        key: 'attendees',
        label: 'Attendees',
        color: '#3B82F6',
        accentBg: 'rgba(59, 130, 246, 0.08)',
        Icon: Users,
        items: data.attendees.map(
          (a) =>
            `${a.name}${a.title !== 'Not mentioned' ? ` — ${a.title}` : ''}${
              a.role !== 'Unknown' ? ` (${a.role})` : ''
            }`
        ),
      })
    }

    if (data.followUpTasks.length > 0) {
      branches.push({
        key: 'tasks',
        label: 'Tasks',
        color: '#10B981',
        accentBg: 'rgba(16, 185, 129, 0.08)',
        Icon: CheckSquare,
        items: data.followUpTasks.map(
          (t) =>
            `${t.task}${t.dueDate !== 'Not specified' ? ` — ${t.dueDate}` : ''}`
        ),
      })
    }

    if (data.painPoints.length > 0) {
      branches.push({
        key: 'pains',
        label: 'Pain Points',
        color: '#F59E0B',
        accentBg: 'rgba(245, 158, 11, 0.08)',
        Icon: Flame,
        items: data.painPoints,
      })
    }

    if (data.risks.length > 0) {
      branches.push({
        key: 'risks',
        label: 'Risks',
        color: '#EF4444',
        accentBg: 'rgba(239, 68, 68, 0.08)',
        Icon: AlertTriangle,
        items: data.risks,
      })
    }

    if (data.competitorsMentioned.length > 0) {
      branches.push({
        key: 'competitors',
        label: 'Competitors',
        color: '#8B5CF6',
        accentBg: 'rgba(139, 92, 246, 0.08)',
        Icon: Swords,
        items: data.competitorsMentioned,
      })
    }

    if (data.productsDiscussed.length > 0) {
      branches.push({
        key: 'products',
        label: 'Products',
        color: '#0EA5E9',
        accentBg: 'rgba(14, 165, 233, 0.08)',
        Icon: Package,
        items: data.productsDiscussed,
      })
    }

    return branches
  }, [data])
}

export default function DealMindMap({ data }: DealMindMapProps) {
  const branches = useBranches(data)
  const companyName =
    data.dealSnapshot.companyName !== 'Not mentioned'
      ? data.dealSnapshot.companyName
      : 'Deal'
  const stage =
    data.dealSnapshot.dealStage !== 'Not mentioned'
      ? data.dealSnapshot.dealStage
      : null

  if (branches.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em]">
          No details extracted
        </p>
        <p className="text-xs text-gray-300 mt-1.5">
          Try recording with more context
        </p>
      </div>
    )
  }

  return (
    <div className="py-2 px-1 sm:px-2">
      {/* Central node: company + stage */}
      <div className="flex justify-center">
        <div
          className="inline-flex flex-col items-center bg-gray-900 text-white rounded-xl px-5 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.12),0_2px_4px_rgba(0,0,0,0.08)] max-w-full"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Building2 size={14} className="text-[#7ed4f7] flex-shrink-0" />
            <span className="font-semibold text-sm truncate max-w-[240px]">
              {companyName}
            </span>
          </div>
          {stage && (
            <span className="text-[10px] font-semibold text-[#7ed4f7] uppercase tracking-[0.1em] mt-1 truncate max-w-[240px]">
              {stage}
            </span>
          )}
        </div>
      </div>

      {/* Trunk line down to branches */}
      <div className="flex justify-center" aria-hidden="true">
        <div className="w-px h-5 bg-gray-300" />
      </div>

      {/* Branch grid — 1 col on mobile, 2 cols on sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {branches.map((branch) => {
          const Icon = branch.Icon
          return (
            <div
              key={branch.key}
              className="rounded-xl p-3.5 border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden"
              style={{
                borderLeft: `3px solid ${branch.color}`,
              }}
            >
              {/* Subtle color wash in background */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{ background: branch.accentBg }}
              />

              {/* Header: icon + label + count */}
              <div className="relative flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: branch.color }}
                  >
                    <Icon size={13} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.12em] truncate"
                    style={{ color: branch.color }}
                  >
                    {branch.label}
                  </span>
                </div>
                <span
                  className="text-[9px] font-bold text-white rounded-full px-1.5 py-0.5 flex-shrink-0 min-w-[18px] text-center"
                  style={{ background: branch.color }}
                >
                  {branch.items.length}
                </span>
              </div>

              {/* Items list */}
              <ul className="relative space-y-1.5">
                {branch.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2"
                  >
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0 mt-[7px]"
                      style={{ background: branch.color }}
                      aria-hidden="true"
                    />
                    <span className="text-[12px] sm:text-[13px] text-gray-700 leading-snug break-words min-w-0 flex-1">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
