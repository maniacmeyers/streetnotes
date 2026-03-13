'use client'

import type { DebriefStructuredOutput } from '@/lib/debrief/types'

interface DealMindMapProps {
  data: DebriefStructuredOutput
}

// Branch configuration
interface Branch {
  label: string
  items: string[]
  color: string
  angle: number
}

function truncateItems(items: string[], max: number): string[] {
  if (items.length <= max) return items
  const truncated = items.slice(0, max)
  truncated.push(`+${items.length - max} more`)
  return truncated
}

export default function DealMindMap({ data }: DealMindMapProps) {
  const companyName = data.dealSnapshot.companyName || 'Deal'
  const score = data.dealScore

  // Build branches from data
  const branches: Branch[] = []

  if (data.nextSteps.length > 0) {
    branches.push({
      label: 'Next Steps',
      items: truncateItems(
        data.nextSteps.map((s) => s.action),
        4
      ),
      color: '#00E676',
      angle: -40,
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
      angle: -10,
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
      angle: 20,
    })
  }

  if (data.buyingSignals.length > 0) {
    branches.push({
      label: 'Buying Signals',
      items: truncateItems(data.buyingSignals, 4),
      color: '#00E676',
      angle: 50,
    })
  }

  if (data.risks.length > 0) {
    branches.push({
      label: 'Risks',
      items: truncateItems(data.risks, 4),
      color: '#FF5252',
      angle: 80,
    })
  }

  if (data.competitorsMentioned.length > 0) {
    branches.push({
      label: 'Competitors',
      items: truncateItems(data.competitorsMentioned, 4),
      color: '#9E9E9E',
      angle: 110,
    })
  }

  // SVG dimensions
  const width = 800
  const height = 500
  const centerX = 160
  const centerY = height / 2

  // Score color
  const scoreColor = score >= 7 ? '#00E676' : score >= 4 ? '#FFD600' : '#FF5252'

  return (
    <div className="w-full overflow-x-auto -mx-4 px-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[600px]"
        style={{ fontFamily: 'monospace' }}
      >
        {/* Background */}
        <rect width={width} height={height} fill="#121212" rx="0" />

        {/* Grid pattern */}
        <defs>
          <pattern
            id="grid"
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
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Branches */}
        {branches.map((branch, branchIndex) => {
          const branchStartX = centerX + 70
          const branchEndX = 340
          const ySpread = (height - 80) / Math.max(branches.length, 1)
          const branchY = 40 + branchIndex * ySpread + ySpread / 2

          return (
            <g key={branch.label}>
              {/* Connection line from center to branch label */}
              <line
                x1={branchStartX}
                y1={centerY}
                x2={branchEndX}
                y2={branchY}
                stroke={branch.color}
                strokeWidth="3"
                opacity="0.6"
              />

              {/* Branch label */}
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

              {/* Leaf items */}
              {branch.items.map((item, itemIndex) => {
                const itemX =
                  branchEndX + branch.label.length * 9.5 + 16 + 20
                const itemY = branchY - 10 + itemIndex * 22

                return (
                  <g key={itemIndex}>
                    {/* Line to item */}
                    <line
                      x1={branchEndX + branch.label.length * 9.5 + 16}
                      y1={branchY}
                      x2={itemX}
                      y2={itemY + 6}
                      stroke={branch.color}
                      strokeWidth="1.5"
                      opacity="0.3"
                    />
                    {/* Item dot */}
                    <circle
                      cx={itemX}
                      cy={itemY + 6}
                      r="3"
                      fill={branch.color}
                    />
                    {/* Item text */}
                    <text
                      x={itemX + 10}
                      y={itemY + 10}
                      fill="#FFFFFF"
                      fontSize="10"
                      opacity="0.8"
                    >
                      {item.length > 40 ? item.substring(0, 38) + '...' : item}
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
          {companyName.length > 14
            ? companyName.substring(0, 12) + '...'
            : companyName}
        </text>

        {/* Deal score badge on central node */}
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
    </div>
  )
}
