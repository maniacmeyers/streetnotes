'use client'

import { useMemo } from 'react'
import type { DebriefStructuredOutput } from '@/lib/debrief/types'

interface DealMindMapProps {
  data: DebriefStructuredOutput
}

/* ─── Colors ─── */
const COLORS = {
  volt: '#00E676',
  red: '#FF5252',
  amber: '#FFB300',
  blue: '#448AFF',
  gray: '#9CA3AF',
  dark: '#1F2937',
  white: '#FFFFFF',
  muted: '#6B7280',
  bg: '#F9FAFB',
  border: '#E5E7EB',
}

function truncateText(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '\u2026' : text
}

interface Branch {
  label: string
  color: string
  items: string[]
}

function useBranches(data: DebriefStructuredOutput): Branch[] {
  return useMemo(() => {
    const branches: Branch[] = []

    // Attendees
    if (data.attendees.length > 0 && data.attendees[0].name !== 'Not mentioned') {
      branches.push({
        label: 'Attendees',
        color: COLORS.blue,
        items: data.attendees.map(
          (a) =>
            `${a.name}${a.title !== 'Not mentioned' ? ` — ${a.title}` : ''}${a.role !== 'Unknown' ? ` (${a.role})` : ''}`
        ),
      })
    }

    // Follow-up tasks
    if (data.followUpTasks.length > 0) {
      branches.push({
        label: 'Tasks',
        color: COLORS.volt,
        items: data.followUpTasks.map(
          (t) =>
            `${t.task}${t.dueDate !== 'Not specified' ? ` — ${t.dueDate}` : ''}`
        ),
      })
    }

    // Pain points
    if (data.painPoints.length > 0) {
      branches.push({
        label: 'Pain Points',
        color: COLORS.amber,
        items: data.painPoints,
      })
    }

    // Risks
    if (data.risks.length > 0) {
      branches.push({
        label: 'Risks',
        color: COLORS.red,
        items: data.risks,
      })
    }

    // Competitors
    if (data.competitorsMentioned.length > 0) {
      branches.push({
        label: 'Competitors',
        color: COLORS.gray,
        items: data.competitorsMentioned,
      })
    }

    // Products discussed
    if (data.productsDiscussed.length > 0) {
      branches.push({
        label: 'Products',
        color: COLORS.volt,
        items: data.productsDiscussed,
      })
    }

    return branches
  }, [data])
}

/* ─── Mobile: Vertical trunk layout ─── */
function MobileMindMap({ data }: DealMindMapProps) {
  const branches = useBranches(data)
  const companyName =
    data.dealSnapshot.companyName !== 'Not mentioned'
      ? data.dealSnapshot.companyName
      : 'Deal'

  const centerX = 160
  const startY = 60
  const branchGap = 90
  const totalH = startY + branches.length * branchGap + 40
  const leafXOffset = 90
  const leafGap = 22

  return (
    <svg
      viewBox={`0 0 320 ${totalH}`}
      className="w-full"
      role="img"
      aria-label={`Deal mind map for ${companyName}`}
    >
      <defs>
        <filter id="m-shadow" x="-4%" y="-4%" width="108%" height="108%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Trunk line */}
      <line
        x1={centerX}
        y1={startY + 20}
        x2={centerX}
        y2={totalH - 20}
        stroke={COLORS.border}
        strokeWidth="2"
      />

      {/* Central node */}
      <rect
        x={centerX - 70}
        y={startY - 22}
        width="140"
        height="44"
        rx="8"
        fill={COLORS.dark}
        filter="url(#m-shadow)"
      />
      <text
        x={centerX}
        y={startY - 2}
        textAnchor="middle"
        fill={COLORS.white}
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {truncateText(companyName, 18)}
      </text>
      <text
        x={centerX}
        y={startY + 12}
        textAnchor="middle"
        fill={COLORS.volt}
        fontSize="8"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        {truncateText(data.dealSnapshot.dealStage, 24)}
      </text>

      {/* Branches */}
      {branches.map((branch, bIdx) => {
        const yBase = startY + 50 + bIdx * branchGap
        const side = bIdx % 2 === 0 ? 1 : -1
        const branchX = centerX + side * leafXOffset

        return (
          <g key={branch.label}>
            {/* Connector from trunk to branch label */}
            <line
              x1={centerX}
              y1={yBase}
              x2={branchX}
              y2={yBase}
              stroke={branch.color}
              strokeWidth="1.5"
              opacity="0.5"
            />

            {/* Branch label */}
            <rect
              x={side === 1 ? branchX - 4 : branchX - 66}
              y={yBase - 10}
              width="70"
              height="20"
              rx="4"
              fill={branch.color}
              opacity="0.12"
            />
            <text
              x={side === 1 ? branchX + 31 : branchX - 31}
              y={yBase + 4}
              textAnchor="middle"
              fill={branch.color}
              fontSize="8"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
              textDecoration="none"
            >
              {branch.label.toUpperCase()}
            </text>

            {/* Leaf items (max 3 visible) */}
            {branch.items.slice(0, 3).map((item, lIdx) => {
              const leafY = yBase + 16 + lIdx * leafGap
              const leafX = side === 1 ? branchX + 4 : branchX - 70

              return (
                <g key={lIdx}>
                  <circle
                    cx={side === 1 ? branchX - 2 : branchX + 2}
                    cy={leafY + 5}
                    r="2.5"
                    fill={branch.color}
                    opacity="0.6"
                  />
                  <text
                    x={leafX}
                    y={leafY + 8}
                    fill={COLORS.dark}
                    fontSize="8"
                    fontFamily="system-ui, sans-serif"
                  >
                    {truncateText(item, 28)}
                  </text>
                </g>
              )
            })}

            {/* Overflow indicator */}
            {branch.items.length > 3 && (
              <text
                x={side === 1 ? branchX + 4 : branchX - 70}
                y={yBase + 16 + 3 * leafGap + 4}
                fill={COLORS.muted}
                fontSize="7"
                fontStyle="italic"
                fontFamily="system-ui, sans-serif"
              >
                +{branch.items.length - 3} more
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Desktop: Horizontal radial layout ─── */
function DesktopMindMap({ data }: DealMindMapProps) {
  const branches = useBranches(data)
  const companyName =
    data.dealSnapshot.companyName !== 'Not mentioned'
      ? data.dealSnapshot.companyName
      : 'Deal'

  const width = 800
  const height = Math.max(400, branches.length * 80 + 80)
  const centerX = 160
  const centerY = height / 2
  const branchStartX = 260
  const leafIndent = 20

  // Distribute branches vertically
  const branchGap = branches.length > 1 ? (height - 100) / (branches.length - 1) : 0
  const branchStartY = branches.length > 1 ? 50 : centerY

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      role="img"
      aria-label={`Deal mind map for ${companyName}`}
    >
      <defs>
        <filter id="d-shadow" x="-4%" y="-4%" width="108%" height="108%">
          <feDropShadow dx="0" dy="1" stdDeviation="3" floodOpacity="0.08" />
        </filter>
        <filter id="d-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={COLORS.volt} floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Central node */}
      <rect
        x={centerX - 80}
        y={centerY - 30}
        width="160"
        height="60"
        rx="10"
        fill={COLORS.dark}
        filter="url(#d-glow)"
      />
      <text
        x={centerX}
        y={centerY - 4}
        textAnchor="middle"
        fill={COLORS.white}
        fontSize="14"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {truncateText(companyName, 20)}
      </text>
      <text
        x={centerX}
        y={centerY + 14}
        textAnchor="middle"
        fill={COLORS.volt}
        fontSize="10"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        {truncateText(data.dealSnapshot.dealStage, 28)}
      </text>

      {/* Branches */}
      {branches.map((branch, bIdx) => {
        const branchY = branchStartY + bIdx * branchGap

        // Curved connector from center to branch
        const cx1 = centerX + 80
        const cx2 = branchStartX - 40

        return (
          <g key={branch.label}>
            {/* Connector line */}
            <path
              d={`M ${centerX + 80} ${centerY} C ${cx1 + 40} ${centerY}, ${cx2} ${branchY}, ${branchStartX} ${branchY}`}
              fill="none"
              stroke={branch.color}
              strokeWidth="1.5"
              opacity="0.4"
            />

            {/* Branch label pill */}
            <rect
              x={branchStartX}
              y={branchY - 12}
              width="90"
              height="24"
              rx="6"
              fill={branch.color}
              opacity="0.12"
              stroke={branch.color}
              strokeWidth="1"
              strokeOpacity="0.2"
            />
            <text
              x={branchStartX + 45}
              y={branchY + 4}
              textAnchor="middle"
              fill={branch.color}
              fontSize="9"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              {branch.label.toUpperCase()}
            </text>

            {/* Leaf items */}
            {branch.items.slice(0, 4).map((item, lIdx) => {
              const leafX = branchStartX + 100 + leafIndent
              const leafY = branchY - 8 + lIdx * 18

              return (
                <g key={lIdx}>
                  {/* Tiny connector */}
                  <line
                    x1={branchStartX + 90}
                    y1={branchY}
                    x2={leafX - 8}
                    y2={leafY + 4}
                    stroke={branch.color}
                    strokeWidth="0.5"
                    opacity="0.3"
                  />
                  <circle
                    cx={leafX - 4}
                    cy={leafY + 4}
                    r="2.5"
                    fill={branch.color}
                    opacity="0.6"
                  />
                  <text
                    x={leafX + 4}
                    y={leafY + 8}
                    fill={COLORS.dark}
                    fontSize="9"
                    fontFamily="system-ui, sans-serif"
                  >
                    {truncateText(item, 40)}
                  </text>
                </g>
              )
            })}

            {branch.items.length > 4 && (
              <text
                x={branchStartX + 100 + leafIndent + 4}
                y={branchY - 8 + 4 * 18 + 8}
                fill={COLORS.muted}
                fontSize="8"
                fontStyle="italic"
                fontFamily="system-ui, sans-serif"
              >
                +{branch.items.length - 4} more
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Exported Component ─── */
export default function DealMindMap({ data }: DealMindMapProps) {
  return (
    <div className="bg-white">
      <div className="sm:hidden">
        <MobileMindMap data={data} />
      </div>
      <div className="hidden sm:block">
        <DesktopMindMap data={data} />
      </div>
    </div>
  )
}
