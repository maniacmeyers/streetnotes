'use client'

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

function FieldLabel({ label, confidence }: { label: string; confidence?: ConfidenceLevel }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {confidence && confidenceBadge(confidence)}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px]"
    />
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
      {/* Contact / Company */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold">Contact / Company</h3>
        <div>
          <FieldLabel label="Contact name" confidence={data.contactNameConfidence} />
          <TextInput
            value={data.contactName ?? ''}
            onChange={v => update({ contactName: v || undefined })}
            placeholder="e.g. Sarah Chen"
          />
        </div>
        <div>
          <FieldLabel label="Company" confidence={data.companyConfidence} />
          <TextInput
            value={data.company ?? ''}
            onChange={v => update({ company: v || undefined })}
            placeholder="e.g. Acme Corp"
          />
        </div>
      </div>

      {/* Deal Snapshot */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold">Deal Snapshot</h3>
        <div>
          <FieldLabel label="Stage" confidence={data.dealStageConfidence} />
          <select
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
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel label="Estimated value" confidence={data.estimatedValueConfidence} />
          <TextInput
            value={data.estimatedValue ?? ''}
            onChange={v => update({ estimatedValue: v || undefined })}
            placeholder="e.g. $50,000"
          />
        </div>
        <div>
          <FieldLabel label="Close date" confidence={data.closeDateConfidence} />
          <TextInput
            value={data.closeDate ?? ''}
            onChange={v => update({ closeDate: v || undefined })}
            placeholder="e.g. 2026-06-30"
          />
        </div>
      </div>

      {/* Attendees */}
      {data.attendees && data.attendees.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold">Attendees</h3>
          {data.attendees.map((att, i) => (
            <div key={i} className="border border-gray-200 rounded-md p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Attendee {i + 1}</span>
                {confidenceBadge(att.confidence)}
              </div>
              <TextInput
                value={att.name ?? ''}
                onChange={v => {
                  const updated = [...data.attendees!]
                  updated[i] = { ...att, name: v || undefined }
                  update({ attendees: updated })
                }}
                placeholder="Name"
              />
              <TextInput
                value={att.title ?? ''}
                onChange={v => {
                  const updated = [...data.attendees!]
                  updated[i] = { ...att, title: v || undefined }
                  update({ attendees: updated })
                }}
                placeholder="Title"
              />
              <select
                value={att.role ?? 'Unknown'}
                onChange={e => {
                  const updated = [...data.attendees!]
                  updated[i] = {
                    ...att,
                    role: e.target.value as (typeof ATTENDEE_ROLES)[number],
                  }
                  update({ attendees: updated })
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px] bg-white"
              >
                {ATTENDEE_ROLES.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                value={att.sentiment ?? 'unknown'}
                onChange={e => {
                  const updated = [...data.attendees!]
                  updated[i] = {
                    ...att,
                    sentiment: e.target.value as (typeof SENTIMENTS)[number],
                  }
                  update({ attendees: updated })
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px] bg-white"
              >
                {SENTIMENTS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Meeting Summary */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">Meeting Summary</h3>
        <textarea
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

      {/* Next Steps */}
      {data.nextSteps && data.nextSteps.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-base font-semibold">Next Steps</h3>
          {data.nextSteps.map((step, i) => (
            <div key={i} className="border border-gray-200 rounded-md p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Step {i + 1}</span>
                {confidenceBadge(step.confidence)}
              </div>
              <TextInput
                value={step.task}
                onChange={v => {
                  const updated = [...data.nextSteps!]
                  updated[i] = { ...step, task: v }
                  update({ nextSteps: updated })
                }}
                placeholder="Task description"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={step.owner}
                  onChange={e => {
                    const updated = [...data.nextSteps!]
                    updated[i] = {
                      ...step,
                      owner: e.target.value as Owner,
                    }
                    update({ nextSteps: updated })
                  }}
                  className="rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px] bg-white"
                >
                  <option value="rep">You</option>
                  <option value="prospect">Prospect</option>
                </select>
                <select
                  value={step.priority}
                  onChange={e => {
                    const updated = [...data.nextSteps!]
                    updated[i] = {
                      ...step,
                      priority: e.target.value as (typeof PRIORITIES)[number],
                    }
                    update({ nextSteps: updated })
                  }}
                  className="rounded-md border border-gray-300 px-3 py-2 text-base min-h-[44px] bg-white"
                >
                  {PRIORITIES.map(p => (
                    <option key={p} value={p}>
                      {p} priority
                    </option>
                  ))}
                </select>
              </div>
              <TextInput
                value={step.dueDate ?? ''}
                onChange={v => {
                  const updated = [...data.nextSteps!]
                  updated[i] = { ...step, dueDate: v || undefined }
                  update({ nextSteps: updated })
                }}
                placeholder="Due date (e.g. 2026-04-15)"
              />
            </div>
          ))}
        </div>
      )}

      {/* CRM Notes */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">CRM Notes</h3>
        <textarea
          value={data.opportunityNotes ?? ''}
          onChange={e => update({ opportunityNotes: e.target.value || undefined })}
          rows={3}
          placeholder="Notes for the CRM opportunity record"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-base"
        />
      </div>

      {/* Pain Points */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">Pain Points</h3>
        <textarea
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

      {/* Competitors */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">Competitors Mentioned</h3>
        <TextInput
          value={(data.competitorsMentioned ?? []).join(', ')}
          onChange={v => {
            const items = v
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
            update({ competitorsMentioned: items.length > 0 ? items : undefined })
          }}
          placeholder="Comma-separated"
        />
      </div>

      {/* Products */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-semibold">Products Discussed</h3>
        <TextInput
          value={(data.productsDiscussed ?? []).join(', ')}
          onChange={v => {
            const items = v
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
            update({ productsDiscussed: items.length > 0 ? items : undefined })
          }}
          placeholder="Comma-separated"
        />
      </div>
    </div>
  )
}
