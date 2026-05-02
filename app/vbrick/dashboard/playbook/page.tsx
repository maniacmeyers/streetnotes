'use client'

import { motion } from 'motion/react'
import { Lightbulb, MessageCircle, MessagesSquare, Phone, Target, Layers, ShieldCheck } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { cascadeIn, staggerContainer } from '@/lib/vbrick/animations'
import { playbookCards, playbookCategories, type PlaybookCard, type PlaybookSection } from '@/lib/vbrick/playbook-data'
import { PlaybookAccordion } from '@/components/vbrick/playbook/playbook-accordion'

const iconMap: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb size={22} />,
  MessageCircle: <MessageCircle size={22} />,
  MessagesSquare: <MessagesSquare size={22} />,
  Phone: <Phone size={22} />,
  Target: <Target size={22} />,
  Layers: <Layers size={22} />,
  ShieldCheck: <ShieldCheck size={22} />,
}

function SectionContent({ section }: { section: PlaybookSection }) {
  return (
    <div className="space-y-3">
      {section.heading && (
        <h4
          className="font-general-sans font-semibold text-sm"
          style={{ color: neuTheme.colors.text.heading }}
        >
          {section.heading}
        </h4>
      )}

      {section.body && (
        <p className="font-satoshi text-sm leading-relaxed" style={{ color: neuTheme.colors.text.body }}>
          {section.body}
        </p>
      )}

      {section.items && (
        <ul className="space-y-1.5 pl-1">
          {section.items.map((item, i) => (
            <li
              key={i}
              className="font-satoshi text-sm leading-relaxed flex items-start gap-2.5"
              style={{ color: neuTheme.colors.text.body }}
            >
              <span
                className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: neuTheme.colors.accent.primary }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {section.script && (
        <div
          className="p-4 mt-2"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.inset,
            borderRadius: neuTheme.radii.md,
          }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.12em] font-general-sans font-semibold mb-2.5"
            style={{ color: neuTheme.colors.accent.primary }}
          >
            {section.script.label}
          </p>
          <div className="space-y-1">
            {section.script.lines.map((line, i) =>
              line === '' ? (
                <div key={i} className="h-2" />
              ) : (
                <p
                  key={i}
                  className="font-satoshi text-sm leading-relaxed"
                  style={{
                    color: line.startsWith('BAD:') || line.startsWith('FEATURE:')
                      ? neuTheme.colors.text.muted
                      : line.startsWith('GOOD:') || line.startsWith('PROBLEM:')
                        ? neuTheme.colors.text.heading
                        : neuTheme.colors.text.body,
                    fontWeight: line.startsWith('GOOD:') || line.startsWith('PROBLEM:') ? 500 : 400,
                  }}
                >
                  {line}
                </p>
              )
            )}
          </div>
        </div>
      )}

      {section.table && (
        <div
          className="overflow-hidden mt-2"
          style={{
            borderRadius: neuTheme.radii.md,
            boxShadow: neuTheme.shadows.insetSm,
          }}
        >
          <table className="w-full text-sm font-satoshi">
            <thead>
              <tr>
                {section.table.headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-2.5 font-general-sans font-semibold text-xs uppercase tracking-wider"
                    style={{
                      color: neuTheme.colors.accent.primary,
                      borderBottom: `1px solid ${neuTheme.colors.shadow}40`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2"
                      style={{
                        color: neuTheme.colors.text.body,
                        borderBottom:
                          ri < section.table!.rows.length - 1
                            ? `1px solid ${neuTheme.colors.shadow}20`
                            : undefined,
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.tip && (
        <div
          className="flex gap-3 p-3 mt-2"
          style={{
            borderRadius: neuTheme.radii.sm,
            borderLeft: `3px solid ${neuTheme.colors.accent.primary}`,
            background: `${neuTheme.colors.accent.primary}08`,
          }}
        >
          <p className="font-satoshi text-xs leading-relaxed" style={{ color: neuTheme.colors.text.muted }}>
            {section.tip}
          </p>
        </div>
      )}
    </div>
  )
}

function CardContent({ card }: { card: PlaybookCard }) {
  return (
    <div className="space-y-6">
      {card.sections.map((section, i) => (
        <SectionContent key={i} section={section} />
      ))}
    </div>
  )
}

export default function PlaybookPage() {
  const grouped = playbookCategories.map((cat) => ({
    category: cat,
    cards: playbookCards.filter((c) => c.category === cat),
  }))

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <h1 className="font-general-sans font-bold text-2xl tracking-tight mb-2" style={{ color: '#2d3436' }}>
          Playbook
        </h1>
        <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.text.muted }}>
          Scripts, frameworks, and field-tested plays. Find what you need, use it, close.
        </p>
      </motion.div>

        {/* Cards by category */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
          {grouped.map((group, gi) => (
            <motion.div key={group.category} variants={cascadeIn} custom={gi}>
              {/* Category label */}
              <p
                className="text-[11px] uppercase tracking-[0.15em] font-general-sans font-semibold mb-3 pl-1"
                style={{ color: neuTheme.colors.accent.primary }}
              >
                {group.category}
              </p>

              <div className="space-y-4">
                {group.cards.map((card) => (
                  <PlaybookAccordion
                    key={card.id}
                    title={card.title}
                    subtitle={card.subtitle}
                    icon={iconMap[card.icon]}
                  >
                    <CardContent card={card} />
                  </PlaybookAccordion>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
    </div>
  )
}
