'use client'

import { useState } from 'react'
import type { CRMNote, ConfidenceLevel } from '@/lib/notes/schema'

interface Props {
  data: CRMNote
  onChange: (updated: CRMNote) => void
}

const INPUT_CLASS =
  'w-full rounded-xl border border-white/15 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-3 text-base text-white placeholder:text-white/30 outline-none transition focus:border-volt/50 focus:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_0_0_3px_rgba(0,230,118,0.15)] min-h-[44px]'

const SELECT_CLASS = `${INPUT_CLASS} appearance-none bg-black/40`

const TEXTAREA_CLASS =
  'w-full rounded-xl border border-white/15 bg-black/40 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] px-4 py-3 text-base text-white placeholder:text-white/30 outline-none transition focus:border-volt/50 focus:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),0_0_0_3px_rgba(0,230,118,0.15)] resize-y'

function confidenceBadge(level: ConfidenceLevel) {
  const styles: Record<ConfidenceLevel, string> = {
    high: 'border-volt/40 bg-volt/15 text-volt',
    medium: 'border-white/20 bg-white/5 text-white/60',
    low: 'border-white/10 bg-white/[0.03] text-white/40',
  }
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] font-bold backdrop-blur-md ${styles[level]}`}
    >
      {level}
    </span>
  )
}

function FieldLabel({
  htmlFor,
  label,
  confidence,
}: {
  htmlFor: string
  label: string
  confidence?: ConfidenceLevel
}) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50"
      >
        {label}
      </label>
      {confidence && confidenceBadge(confidence)}
    </div>
  )
}

function TextInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={INPUT_CLASS}
    />
  )
}

function CollapsibleSection({
  title,
  defaultOpen,
  count,
  children,
}: {
  title: string
  defaultOpen: boolean
  count?: number
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 font-display uppercase text-base text-white min-h-[44px] text-left"
      >
        <span className="text-volt w-4 text-center" aria-hidden="true">
          {isOpen ? '▾' : '▸'}
        </span>
        {title}
        {count !== undefined && (
          <span className="font-mono text-[10px] tracking-[0.15em] text-white/40 font-bold">
            ({count})
          </span>
        )}
      </button>
      {isOpen && children}
    </div>
  )
}

const DEAL_STAGES = [
  'Prospecting',
  'Discovery',
  'Demo / Evaluation',
  'Proposal / Pricing',
  'Negotiation',
  'Verbal Commit',
  'Closed Won',
  'Closed Lost',
] as const

const ATTENDEE_ROLES = [
  'Decision Maker',
  'Champion',
  'Influencer',
  'End User',
  'Blocker',
  'Technical Evaluator',
  'Economic Buyer',
  'Legal / Procurement',
  'Unknown',
] as const

const SENTIMENTS = ['positive', 'neutral', 'negative', 'unknown'] as const
const PRIORITIES = ['high', 'medium', 'low'] as const
type Owner = 'rep' | 'prospect'

export default function EditableStructuredOutput({ data, onChange }: Props) {
  const update = (patch: Partial<CRMNote>) => onChange({ ...data, ...patch })

  return (
    <div className="flex flex-col gap-5">
      {/* Contact / Company — always visible */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display uppercase text-base text-white">Contact / Company</h3>
        <div>
          <FieldLabel htmlFor="edit-contactName" label="Contact name" confidence={data.contactNameConfidence} />
          <TextInput
            id="edit-contactName"
            value={data.contactName ?? ''}
            onChange={v => update({ contactName: v || undefined })}
            placeholder="e.g. Sarah Chen"
          />
        </div>
        <div>
          <FieldLabel htmlFor="edit-company" label="Company" confidence={data.companyConfidence} />
          <TextInput
            id="edit-company"
            value={data.company ?? ''}
            onChange={v => update({ company: v || undefined })}
            placeholder="e.g. Acme Corp"
          />
        </div>
      </div>

      {/* Deal Snapshot — always visible */}
      <div className="flex flex-col gap-3">
        <h3 className="font-display uppercase text-base text-white">Deal Snapshot</h3>
        <div>
          <FieldLabel htmlFor="edit-dealStage" label="Stage" confidence={data.dealStageConfidence} />
          <select
            id="edit-dealStage"
            value={data.dealStage ?? ''}
            onChange={e =>
              update({
                dealStage: (e.target.value || undefined) as CRMNote['dealStage'],
              })
            }
            className={SELECT_CLASS}
          >
            <option value="">Not set</option>
            {DEAL_STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel htmlFor="edit-estimatedValue" label="Estimated value" confidence={data.estimatedValueConfidence} />
          <TextInput
            id="edit-estimatedValue"
            value={data.estimatedValue ?? ''}
            onChange={v => update({ estimatedValue: v || undefined })}
            placeholder="e.g. $50,000"
          />
        </div>
        <div>
          <FieldLabel htmlFor="edit-closeDate" label="Close date" confidence={data.closeDateConfidence} />
          <TextInput
            id="edit-closeDate"
            value={data.closeDate ?? ''}
            onChange={v => update({ closeDate: v || undefined })}
            placeholder="e.g. 2026-06-30"
          />
        </div>
      </div>

      {/* Meeting Summary — always visible */}
      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="edit-meetingSummary" label="Meeting Summary" />
        <textarea
          id="edit-meetingSummary"
          value={(data.meetingSummary ?? []).join('\n')}
          onChange={e => {
            const lines = e.target.value.split('\n').filter(l => l.trim())
            update({ meetingSummary: lines.length > 0 ? lines : undefined })
          }}
          rows={4}
          placeholder="One bullet point per line"
          className={TEXTAREA_CLASS}
        />
      </div>

      {/* Next Steps — collapsible, default open if populated */}
      <CollapsibleSection
        title="Next Steps"
        defaultOpen={!!data.nextSteps && data.nextSteps.length > 0}
        count={data.nextSteps?.length}
      >
        {data.nextSteps && data.nextSteps.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.nextSteps.map((step, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/12 bg-white/5 backdrop-blur-md p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
                    Step {i + 1}
                  </span>
                  {confidenceBadge(step.confidence)}
                </div>
                <TextInput
                  id={`edit-step-${i}-task`}
                  value={step.task}
                  onChange={v => {
                    const updated = [...data.nextSteps!]
                    updated[i] = { ...step, task: v }
                    update({ nextSteps: updated })
                  }}
                  placeholder="Task description"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={`edit-step-${i}-owner`} className="sr-only">Owner</label>
                    <select
                      id={`edit-step-${i}-owner`}
                      value={step.owner}
                      onChange={e => {
                        const updated = [...data.nextSteps!]
                        updated[i] = { ...step, owner: e.target.value as Owner }
                        update({ nextSteps: updated })
                      }}
                      className={SELECT_CLASS}
                    >
                      <option value="rep">You</option>
                      <option value="prospect">Prospect</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`edit-step-${i}-priority`} className="sr-only">Priority</label>
                    <select
                      id={`edit-step-${i}-priority`}
                      value={step.priority}
                      onChange={e => {
                        const updated = [...data.nextSteps!]
                        updated[i] = { ...step, priority: e.target.value as (typeof PRIORITIES)[number] }
                        update({ nextSteps: updated })
                      }}
                      className={SELECT_CLASS}
                    >
                      {PRIORITIES.map(p => (
                        <option key={p} value={p}>{p} priority</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor={`edit-step-${i}-due`} className="sr-only">Due date</label>
                  <TextInput
                    id={`edit-step-${i}-due`}
                    value={step.dueDate ?? ''}
                    onChange={v => {
                      const updated = [...data.nextSteps!]
                      updated[i] = { ...step, dueDate: v || undefined }
                      update({ nextSteps: updated })
                    }}
                    placeholder="Due date (e.g. 2026-04-15)"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            No next steps extracted.
          </p>
        )}
      </CollapsibleSection>

      {/* Attendees — collapsible */}
      <CollapsibleSection
        title="Attendees"
        defaultOpen={false}
        count={data.attendees?.length}
      >
        {data.attendees && data.attendees.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.attendees.map((att, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/12 bg-white/5 backdrop-blur-md p-3 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
                    Attendee {i + 1}
                  </span>
                  {confidenceBadge(att.confidence)}
                </div>
                <div>
                  <label htmlFor={`edit-att-${i}-name`} className="sr-only">Name</label>
                  <TextInput
                    id={`edit-att-${i}-name`}
                    value={att.name ?? ''}
                    onChange={v => {
                      const updated = [...data.attendees!]
                      updated[i] = { ...att, name: v || undefined }
                      update({ attendees: updated })
                    }}
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label htmlFor={`edit-att-${i}-title`} className="sr-only">Title</label>
                  <TextInput
                    id={`edit-att-${i}-title`}
                    value={att.title ?? ''}
                    onChange={v => {
                      const updated = [...data.attendees!]
                      updated[i] = { ...att, title: v || undefined }
                      update({ attendees: updated })
                    }}
                    placeholder="Title"
                  />
                </div>
                <div>
                  <label htmlFor={`edit-att-${i}-role`} className="sr-only">Role</label>
                  <select
                    id={`edit-att-${i}-role`}
                    value={att.role ?? 'Unknown'}
                    onChange={e => {
                      const updated = [...data.attendees!]
                      updated[i] = { ...att, role: e.target.value as (typeof ATTENDEE_ROLES)[number] }
                      update({ attendees: updated })
                    }}
                    className={SELECT_CLASS}
                  >
                    {ATTENDEE_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor={`edit-att-${i}-sentiment`} className="sr-only">Sentiment</label>
                  <select
                    id={`edit-att-${i}-sentiment`}
                    value={att.sentiment ?? 'unknown'}
                    onChange={e => {
                      const updated = [...data.attendees!]
                      updated[i] = { ...att, sentiment: e.target.value as (typeof SENTIMENTS)[number] }
                      update({ attendees: updated })
                    }}
                    className={SELECT_CLASS}
                  >
                    {SENTIMENTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            No attendees extracted.
          </p>
        )}
      </CollapsibleSection>

      {/* CRM Notes — collapsible */}
      <CollapsibleSection
        title="CRM Notes"
        defaultOpen={!!data.opportunityNotes}
      >
        <div>
          <label htmlFor="edit-opportunityNotes" className="sr-only">CRM Notes</label>
          <textarea
            id="edit-opportunityNotes"
            value={data.opportunityNotes ?? ''}
            onChange={e => update({ opportunityNotes: e.target.value || undefined })}
            rows={3}
            placeholder="Notes for the CRM opportunity record"
            className={TEXTAREA_CLASS}
          />
        </div>
      </CollapsibleSection>

      {/* Pain Points — collapsible */}
      <CollapsibleSection
        title="Pain Points"
        defaultOpen={false}
        count={data.painPoints?.length}
      >
        <div>
          <label htmlFor="edit-painPoints" className="sr-only">Pain Points</label>
          <textarea
            id="edit-painPoints"
            value={(data.painPoints ?? []).join('\n')}
            onChange={e => {
              const lines = e.target.value.split('\n').filter(l => l.trim())
              update({ painPoints: lines.length > 0 ? lines : undefined })
            }}
            rows={3}
            placeholder="One per line"
            className={TEXTAREA_CLASS}
          />
        </div>
      </CollapsibleSection>

      {/* Competitors — collapsible */}
      <CollapsibleSection
        title="Competitors"
        defaultOpen={false}
        count={data.competitorsMentioned?.length}
      >
        <div>
          <label htmlFor="edit-competitors" className="sr-only">Competitors</label>
          <TextInput
            id="edit-competitors"
            value={(data.competitorsMentioned ?? []).join(', ')}
            onChange={v => {
              const items = v.split(',').map(s => s.trim()).filter(Boolean)
              update({ competitorsMentioned: items.length > 0 ? items : undefined })
            }}
            placeholder="Comma-separated"
          />
        </div>
      </CollapsibleSection>

      {/* Products — collapsible */}
      <CollapsibleSection
        title="Products Discussed"
        defaultOpen={false}
        count={data.productsDiscussed?.length}
      >
        <div>
          <label htmlFor="edit-products" className="sr-only">Products</label>
          <TextInput
            id="edit-products"
            value={(data.productsDiscussed ?? []).join(', ')}
            onChange={v => {
              const items = v.split(',').map(s => s.trim()).filter(Boolean)
              update({ productsDiscussed: items.length > 0 ? items : undefined })
            }}
            placeholder="Comma-separated"
          />
        </div>
      </CollapsibleSection>
    </div>
  )
}
