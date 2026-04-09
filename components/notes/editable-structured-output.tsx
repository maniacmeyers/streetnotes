'use client'

import { useState } from 'react'
import type { CRMNote, ConfidenceLevel } from '@/lib/notes/schema'

interface Props {
  data: CRMNote
  onChange: (updated: CRMNote) => void
}

function confidenceBadge(level: ConfidenceLevel) {
  const styles: Record<ConfidenceLevel, string> = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-block text-xs font-medium px-1.5 py-0.5 rounded ${styles[level]}`}>
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
    <div className="flex items-center gap-2 mb-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
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
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px]"
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
        className="flex items-center gap-2 text-base font-semibold min-h-[44px] text-left"
      >
        <span className="text-gray-400 w-4 text-center" aria-hidden="true">
          {isOpen ? '▾' : '▸'}
        </span>
        {title}
        {count !== undefined && (
          <span className="text-sm text-gray-400 font-normal">({count})</span>
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
        <h3 className="text-base font-semibold">Contact / Company</h3>
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
        <h3 className="text-base font-semibold">Deal Snapshot</h3>
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px] bg-white"
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
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-base"
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
              <div key={i} className="border border-gray-200 rounded-md p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Step {i + 1}</span>
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px] bg-white"
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px] bg-white"
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
          <p className="text-sm text-gray-400">No next steps extracted.</p>
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
              <div key={i} className="border border-gray-200 rounded-md p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Attendee {i + 1}</span>
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px] bg-white"
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
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px] bg-white"
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
          <p className="text-sm text-gray-400">No attendees extracted.</p>
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-base"
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-base"
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
