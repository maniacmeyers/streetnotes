'use client'

import { motion } from 'motion/react'
import { Lightbulb, MessageCircle, MessagesSquare, Phone, Target, Layers, ShieldCheck } from 'lucide-react'
import { playbookCards, playbookCategories, type PlaybookCard, type PlaybookSection } from '@/lib/vbrick/playbook-data'
import { PlaybookAccordion } from '@/components/dashboard/playbook-accordion'

const iconMap: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb size={20} />,
  MessageCircle: <MessageCircle size={20} />,
  MessagesSquare: <MessagesSquare size={20} />,
  Phone: <Phone size={20} />,
  Target: <Target size={20} />,
  Layers: <Layers size={20} />,
  ShieldCheck: <ShieldCheck size={20} />,
}

function SectionContent({ section }: { section: PlaybookSection }) {
  return (
    <div className="space-y-3">
      {section.heading && (
        <h4 className="font-bold text-sm text-white">{section.heading}</h4>
      )}

      {section.body && (
        <p className="text-sm leading-relaxed text-white/75">{section.body}</p>
      )}

      {section.items && (
        <ul className="space-y-1.5 pl-1">
          {section.items.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed text-white/75 flex items-start gap-2.5">
              <span
                className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-volt"
                style={{ boxShadow: '0 0 6px rgba(0,230,118,0.6)' }}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {section.script && (
        <div
          className="p-4 mt-2 rounded-xl border border-white/10"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <p className="text-[11px] uppercase tracking-[0.15em] font-mono font-bold mb-2.5 text-volt">
            {section.script.label}
          </p>
          <div className="space-y-1">
            {section.script.lines.map((line, i) =>
              line === '' ? (
                <div key={i} className="h-2" />
              ) : (
                <p
                  key={i}
                  className={`text-sm leading-relaxed ${
                    line.startsWith('BAD:') || line.startsWith('FEATURE:')
                      ? 'text-white/40'
                      : line.startsWith('GOOD:') || line.startsWith('PROBLEM:')
                        ? 'text-white font-medium'
                        : 'text-white/75'
                  }`}
                >
                  {line}
                </p>
              )
            )}
          </div>
        </div>
      )}

      {section.table && (
        <div className="overflow-hidden mt-2 rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {section.table.headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-volt border-b border-white/10"
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
                      className={`px-4 py-2 text-white/75 ${
                        ri < section.table!.rows.length - 1 ? 'border-b border-white/5' : ''
                      }`}
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
          className="flex gap-3 p-3 mt-2 rounded-lg"
          style={{
            borderLeft: '3px solid #00E676',
            background: 'rgba(0,230,118,0.06)',
          }}
        >
          <p className="text-xs leading-relaxed text-white/70">{section.tip}</p>
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
    <div className="px-4 pt-4 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="mb-6"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-volt/80">
          Field guide
        </p>
        <h1 className="text-3xl font-bold tracking-tight mt-1">
          Play<span className="text-volt drop-shadow-[0_0_16px_rgba(0,230,118,0.4)]">book</span>
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50 mt-2">
          Scripts, frameworks, field-tested plays. Find it. Use it. Close.
        </p>
      </motion.div>

      {/* Cards by category */}
      <div className="space-y-8">
        {grouped.map((group) => (
          <div key={group.category}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-volt/80 mb-3 pl-1">
              {group.category}
            </p>
            <div className="space-y-3">
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
          </div>
        ))}
      </div>
    </div>
  )
}
