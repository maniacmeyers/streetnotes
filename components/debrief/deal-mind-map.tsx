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
  return text.substring(0, max - 1) + '\u2026'
}

/* ─── Mobile: trunk-and-branch tree ─── */
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
  const W = 340
  const trunkX = 28
  const branchX = 46
  const itemDotX = 54
  const itemTextX = 66
  const centralX = 12
  const centralW = W - 24
  const centralH = 50
  const centralY = 16
  const R = 6
  const labelH = 26
  const itemH = 22

  // Pre-calculate branch positions
  interface BranchPos {
    labelY: number
    midY: number
    items: number[]
  }

  let y = centralY + centralH + 24
  const positions: BranchPos[] = branches.map((branch) => {
    const labelY = y
    const midY = labelY + labelH / 2
    y += labelH + 6
    const items = branch.items.map(() => {
      const iy = y
      y += itemH
      return iy
    })
    y += 18
    return { labelY, midY, items }
  })

  const totalH = y + 8
  const trunkEndY =
    positions.length > 0
      ? positions[positions.length - 1].midY
      : centralY + centralH

  const svgStyle = {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    textRendering: 'geometricPrecision' as const,
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${totalH}`}
      className="w-full"
      style={svgStyle}
    >
      <rect width={W} height={totalH} fill="#0A0A0A" />

      {/* Central node */}
      <rect
        x={centralX}
        y={centralY}
        width={centralW}
        height={centralH}
        rx={R}
        fill="#00E676"
        stroke="#000"
        strokeWidth="2.5"
      />
      <text
        x={centralX + 16}
        y={centralY + centralH / 2 + 5}
        fill="#000"
        fontSize="14"
        fontWeight="bold"
        style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        {truncateText(companyName, 20)}
      </text>
      {/* Score pill inside central node */}
      <rect
        x={centralX + centralW - 50}
        y={centralY + (centralH - 30) / 2}
        width={36}
        height={30}
        rx={4}
        fill={scoreColor}
        stroke="#000"
        strokeWidth="1.5"
      />
      <text
        x={centralX + centralW - 32}
        y={centralY + centralH / 2 + 6}
        textAnchor="middle"
        fill="#000"
        fontSize="16"
        fontWeight="bold"
      >
        {score}
      </text>

      {/* Trunk line */}
      {positions.length > 0 && (
        <>
          <line
            x1={trunkX}
            y1={centralY + centralH + 2}
            x2={trunkX}
            y2={trunkEndY}
            stroke="#333"
            strokeWidth="2"
          />
          {/* Small connector from central node left edge down to trunk */}
          <line
            x1={trunkX}
            y1={centralY + centralH}
            x2={trunkX}
            y2={centralY + centralH + 2}
            stroke="#444"
            strokeWidth="2"
          />
        </>
      )}

      {/* Branches */}
      {branches.map((branch, bi) => {
        const pos = positions[bi]
        const labelW = branch.label.length * 7.5 + 22

        return (
          <g key={bi}>
            {/* Trunk dot */}
            <circle cx={trunkX} cy={pos.midY} r="4.5" fill={branch.color} />

            {/* Horizontal connector */}
            <line
              x1={trunkX + 5}
              y1={pos.midY}
              x2={branchX - 2}
              y2={pos.midY}
              stroke={branch.color}
              strokeWidth="2"
              opacity="0.5"
            />

            {/* Branch label */}
            <rect
              x={branchX}
              y={pos.labelY}
              width={labelW}
              height={labelH}
              rx={3}
              fill={branch.color}
              stroke="#000"
              strokeWidth="1.5"
            />
            <text
              x={branchX + 11}
              y={pos.labelY + 17}
              fill="#000"
              fontSize="10"
              fontWeight="bold"
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {branch.label}
            </text>

            {/* Items */}
            {branch.items.map((item, ii) => {
              const iy = pos.items[ii]
              return (
                <g key={ii}>
                  <circle
                    cx={itemDotX}
                    cy={iy + itemH / 2}
                    r="2.5"
                    fill={branch.color}
                    opacity="0.6"
                  />
                  <text
                    x={itemTextX}
                    y={iy + itemH / 2 + 4}
                    fill="#FFF"
                    fontSize="11"
                    opacity="0.85"
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

/* ─── Desktop: horizontal radial tree ─── */
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
  const W = 800
  const R = 6
  const centralW = 150
  const centralH = 64
  const branchLabelH = 30
  const itemSlotH = 24

  // Calculate height each branch needs
  const branchHeights = branches.map(
    (b) => branchLabelH + b.items.length * itemSlotH + 16
  )
  const totalBranchHeight =
    branchHeights.reduce((a, b) => a + b, 0) +
    (branches.length - 1) * 10
  const H = Math.max(420, totalBranchHeight + 80)

  const centerX = 155
  const centerY = H / 2

  // Position branches vertically, distributed based on content height
  let branchY = (H - totalBranchHeight) / 2
  const branchPositions = branches.map((_, bi) => {
    const top = branchY
    const mid = top + branchHeights[bi] / 2
    branchY += branchHeights[bi] + 10
    return { top, mid }
  })

  const branchLabelX = 340

  const svgStyle = {
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
    textRendering: 'geometricPrecision' as const,
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={svgStyle}
    >
      <rect width={W} height={H} fill="#0A0A0A" />

      {/* Branches */}
      {branches.map((branch, bi) => {
        const pos = branchPositions[bi]
        const labelW = branch.label.length * 9 + 24

        return (
          <g key={bi}>
            {/* Connector from center */}
            <line
              x1={centerX + centralW / 2}
              y1={centerY}
              x2={branchLabelX}
              y2={pos.mid}
              stroke={branch.color}
              strokeWidth="2"
              opacity="0.3"
            />

            {/* Branch label */}
            <rect
              x={branchLabelX}
              y={pos.mid - branchLabelH / 2}
              width={labelW}
              height={branchLabelH}
              rx={4}
              fill={branch.color}
              stroke="#000"
              strokeWidth="2"
            />
            <text
              x={branchLabelX + 12}
              y={pos.mid + 4}
              fill="#000"
              fontSize="12"
              fontWeight="bold"
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {branch.label}
            </text>

            {/* Items — spread evenly around branch midpoint */}
            {branch.items.map((item, ii) => {
              const itemX = branchLabelX + labelW + 22
              const itemY =
                pos.mid -
                ((branch.items.length - 1) * itemSlotH) / 2 +
                ii * itemSlotH

              return (
                <g key={ii}>
                  <line
                    x1={branchLabelX + labelW}
                    y1={pos.mid}
                    x2={itemX - 6}
                    y2={itemY + 4}
                    stroke={branch.color}
                    strokeWidth="1"
                    opacity="0.2"
                  />
                  <circle
                    cx={itemX - 6}
                    cy={itemY + 4}
                    r="3"
                    fill={branch.color}
                    opacity="0.55"
                  />
                  <text
                    x={itemX + 6}
                    y={itemY + 8}
                    fill="#FFF"
                    fontSize="11"
                    opacity="0.85"
                  >
                    {truncateText(item, 44)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Central node (drawn last to layer on top) */}
      <rect
        x={centerX - centralW / 2}
        y={centerY - centralH / 2}
        width={centralW}
        height={centralH}
        rx={R}
        fill="#00E676"
        stroke="#000"
        strokeWidth="3"
      />
      <text
        x={centerX}
        y={centerY - 8}
        textAnchor="middle"
        fill="#000"
        fontSize="14"
        fontWeight="bold"
        style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
      >
        {truncateText(companyName, 16)}
      </text>
      <circle
        cx={centerX}
        cy={centerY + 16}
        r="14"
        fill={scoreColor}
        stroke="#000"
        strokeWidth="2"
      />
      <text
        x={centerX}
        y={centerY + 21}
        textAnchor="middle"
        fill="#000"
        fontSize="14"
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
        data.decisionMakers.map((d) => `${d.name} \u2014 ${d.role}`),
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
    <div className="w-full bg-[#0A0A0A]">
      {/* Mobile: trunk-and-branch tree */}
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
