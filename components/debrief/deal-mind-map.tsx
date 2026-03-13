'use client'

import type { DebriefStructuredOutput } from '@/lib/debrief/types'

interface DealMindMapProps {
  data: DebriefStructuredOutput
}

interface Branch {
  label: string
  items: string[]
  color: string
}

function truncateItems(items: string[], max: number): string[] {
  if (items.length <= max) return items
  const truncated = items.slice(0, max)
  truncated.push(`+${items.length - max} more`)
  return truncated
}

function truncateText(text: string, max: number): string {
  if (text.length <= max) return text
  return text.substring(0, max - 2) + '...'
}

/* ─── Mobile layout: vertical tree ─── */
function MobileMindMap({
  companyName,
  score,
  scoreColor,
  branches,
}: {
  companyName: string
  score: number
  scoreColor: string
  branches: Branch[]
}) {
  const nodeWidth = 280
  const centerX = nodeWidth / 2
  const nodeHeight = 50
  const itemHeight = 22
  const branchHeaderHeight = 28
  const branchPaddingY = 16

  // Calculate total height
  let totalHeight = nodeHeight + 20 // central node + gap
  branches.forEach((branch) => {
    totalHeight +=
      branchPaddingY + branchHeaderHeight + branch.items.length * itemHeight + 10
  })
  totalHeight += 20 // bottom padding

  let currentY = 0

  return (
    <svg
      viewBox={`0 0 ${nodeWidth} ${totalHeight}`}
      className="w-full"
      style={{ fontFamily: 'monospace' }}
    >
      <rect width={nodeWidth} height={totalHeight} fill="#121212" />
      {/* Grid */}
      <defs>
        <pattern
          id="grid-m"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.3"
            opacity="0.05"
          />
        </pattern>
      </defs>
      <rect width={nodeWidth} height={totalHeight} fill="url(#grid-m)" />

      {/* Central node */}
      <rect
        x={centerX - 65}
        y={10}
        width={130}
        height={nodeHeight}
        fill="#00E676"
        stroke="#000000"
        strokeWidth="3"
      />
      <text
        x={centerX}
        y={30}
        textAnchor="middle"
        fill="#000000"
        fontSize="12"
        fontWeight="bold"
        style={{ textTransform: 'uppercase' }}
      >
        {truncateText(companyName, 14)}
      </text>
      <circle
        cx={centerX}
        cy={48}
        r="12"
        fill={scoreColor}
        stroke="#000000"
        strokeWidth="2"
      />
      <text
        x={centerX}
        y={52}
        textAnchor="middle"
        fill="#000000"
        fontSize="11"
        fontWeight="bold"
      >
        {score}
      </text>

      {(() => {
        currentY = nodeHeight + 20
        return null
      })()}

      {/* Branches */}
      {branches.map((branch, bi) => {
        const branchTop = currentY + branchPaddingY
        const labelY = branchTop
        const itemsStartY = labelY + branchHeaderHeight

        // Accumulate height for next branch
        const branchTotalHeight =
          branchPaddingY +
          branchHeaderHeight +
          branch.items.length * itemHeight +
          10
        currentY += branchTotalHeight

        return (
          <g key={bi}>
            {/* Vertical connector line */}
            <line
              x1={centerX}
              y1={branchTop - branchPaddingY}
              x2={centerX}
              y2={labelY + branchHeaderHeight / 2}
              stroke={branch.color}
              strokeWidth="2"
              opacity="0.4"
            />

            {/* Branch label */}
            <rect
              x={centerX - (branch.label.length * 8 + 16) / 2}
              y={labelY}
              width={branch.label.length * 8 + 16}
              height={branchHeaderHeight}
              fill={branch.color}
              stroke="#000000"
              strokeWidth="2"
            />
            <text
              x={centerX}
              y={labelY + 18}
              textAnchor="middle"
              fill="#000000"
              fontSize="10"
              fontWeight="bold"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {branch.label}
            </text>

            {/* Items */}
            {branch.items.map((item, ii) => {
              const itemY = itemsStartY + ii * itemHeight
              return (
                <g key={ii}>
                  <line
                    x1={centerX}
                    y1={labelY + branchHeaderHeight}
                    x2={30}
                    y2={itemY + 10}
                    stroke={branch.color}
                    strokeWidth="1"
                    opacity="0.2"
                  />
                  <circle cx={30} cy={itemY + 10} r="3" fill={branch.color} />
                  <text
                    x={40}
                    y={itemY + 14}
                    fill="#FFFFFF"
                    fontSize="10"
                    opacity="0.8"
                  >
                    {truncateText(item, 32)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Desktop layout: horizontal radial tree ─── */
function DesktopMindMap({
  companyName,
  score,
  scoreColor,
  branches,
}: {
  companyName: string
  score: number
  scoreColor: string
  branches: Branch[]
}) {
  const width = 800
  const height = 500
  const centerX = 160
  const centerY = height / 2

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ fontFamily: 'monospace' }}
    >
      <rect width={width} height={height} fill="#121212" />
      <defs>
        <pattern
          id="grid-d"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="0.3"
            opacity="0.05"
          />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#grid-d)" />

      {/* Branches */}
      {branches.map((branch, branchIndex) => {
        const branchStartX = centerX + 70
        const branchEndX = 340
        const ySpread = (height - 80) / Math.max(branches.length, 1)
        const branchY = 40 + branchIndex * ySpread + ySpread / 2

        return (
          <g key={branch.label}>
            <line
              x1={branchStartX}
              y1={centerY}
              x2={branchEndX}
              y2={branchY}
              stroke={branch.color}
              strokeWidth="3"
              opacity="0.6"
            />
            <rect
              x={branchEndX}
              y={branchY - 14}
              width={branch.label.length * 9.5 + 16}
              height={28}
              fill={branch.color}
              stroke="#000000"
              strokeWidth="3"
            />
            <text
              x={branchEndX + 8}
              y={branchY + 4}
              fill="#000000"
              fontSize="11"
              fontWeight="bold"
              textAnchor="start"
              style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              {branch.label}
            </text>

            {branch.items.map((item, itemIndex) => {
              const itemX =
                branchEndX + branch.label.length * 9.5 + 16 + 20
              const itemY = branchY - 10 + itemIndex * 22

              return (
                <g key={itemIndex}>
                  <line
                    x1={branchEndX + branch.label.length * 9.5 + 16}
                    y1={branchY}
                    x2={itemX}
                    y2={itemY + 6}
                    stroke={branch.color}
                    strokeWidth="1.5"
                    opacity="0.3"
                  />
                  <circle
                    cx={itemX}
                    cy={itemY + 6}
                    r="3"
                    fill={branch.color}
                  />
                  <text
                    x={itemX + 10}
                    y={itemY + 10}
                    fill="#FFFFFF"
                    fontSize="10"
                    opacity="0.8"
                  >
                    {truncateText(item, 40)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Central node */}
      <rect
        x={centerX - 65}
        y={centerY - 35}
        width={130}
        height={70}
        fill="#00E676"
        stroke="#000000"
        strokeWidth="4"
      />
      <text
        x={centerX}
        y={centerY - 8}
        textAnchor="middle"
        fill="#000000"
        fontSize="13"
        fontWeight="bold"
        style={{ textTransform: 'uppercase' }}
      >
        {truncateText(companyName, 14)}
      </text>
      <circle
        cx={centerX}
        cy={centerY + 18}
        r="14"
        fill={scoreColor}
        stroke="#000000"
        strokeWidth="3"
      />
      <text
        x={centerX}
        y={centerY + 23}
        textAnchor="middle"
        fill="#000000"
        fontSize="13"
        fontWeight="bold"
      >
        {score}
      </text>
    </svg>
  )
}

export default function DealMindMap({ data }: DealMindMapProps) {
  const companyName = data.dealSnapshot.companyName || 'Deal'
  const score = data.dealScore
  const scoreColor =
    score >= 7 ? '#00E676' : score >= 4 ? '#FFD600' : '#FF5252'

  const branches: Branch[] = []

  if (data.nextSteps.length > 0) {
    branches.push({
      label: 'Next Steps',
      items: truncateItems(
        data.nextSteps.map((s) => s.action),
        4
      ),
      color: '#00E676',
    })
  }
  if (data.objections.length > 0) {
    branches.push({
      label: 'Objections',
      items: truncateItems(
        data.objections.map(
          (o) => `${o.objection}${o.resolved ? ' (resolved)' : ''}`
        ),
        4
      ),
      color: '#FF5252',
    })
  }
  if (data.decisionMakers.length > 0) {
    branches.push({
      label: 'Stakeholders',
      items: truncateItems(
        data.decisionMakers.map((d) => `${d.name} — ${d.role}`),
        4
      ),
      color: '#448AFF',
    })
  }
  if (data.buyingSignals.length > 0) {
    branches.push({
      label: 'Buying Signals',
      items: truncateItems(data.buyingSignals, 4),
      color: '#00E676',
    })
  }
  if (data.risks.length > 0) {
    branches.push({
      label: 'Risks',
      items: truncateItems(data.risks, 4),
      color: '#FF5252',
    })
  }
  if (data.competitorsMentioned.length > 0) {
    branches.push({
      label: 'Competitors',
      items: truncateItems(data.competitorsMentioned, 4),
      color: '#9E9E9E',
    })
  }

  return (
    <div className="w-full bg-dark">
      {/* Mobile: vertical tree */}
      <div className="block sm:hidden">
        <MobileMindMap
          companyName={companyName}
          score={score}
          scoreColor={scoreColor}
          branches={branches}
        />
      </div>
      {/* Desktop: horizontal radial tree */}
      <div className="hidden sm:block">
        <DesktopMindMap
          companyName={companyName}
          score={score}
          scoreColor={scoreColor}
          branches={branches}
        />
      </div>
    </div>
  )
}
