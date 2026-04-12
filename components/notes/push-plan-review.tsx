'use client'

import { useState, useMemo } from 'react'
import type { CRMNote } from '@/lib/notes/schema'
import type {
  PushPlan,
  PushAssignment,
  CrmSchema,
  CrmField,
  TargetObject,
  StickyRuleInput,
} from '@/lib/crm/schema/types'

interface PushPlanReviewProps {
  crmNote: CRMNote
  pushPlan: PushPlan
  schema: CrmSchema | null
  isPushing: boolean
  onConfirm: (finalPlan: PushPlan, newRules: StickyRuleInput[]) => void
  onCancel: () => void
}

const GLASS_BASE =
  'rounded-2xl border border-white/12 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]'
const BTN_VOLT =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-volt/50 bg-volt/15 px-4 py-3 font-mono text-xs uppercase tracking-[0.15em] font-bold text-volt backdrop-blur-md shadow-[0_8px_24px_-8px_rgba(0,230,118,0.45),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:bg-volt/25 disabled:opacity-40 disabled:cursor-not-allowed'
const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/80 backdrop-blur-md transition hover:bg-white/10 disabled:opacity-40'

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function humanizeSourceField(field: string): string {
  return field
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase())
}

function objectLabel(obj: TargetObject): string {
  switch (obj) {
    case 'contact':
      return 'Contact'
    case 'account':
      return 'Account'
    case 'opportunity':
      return 'Opportunity / Deal'
    case 'activity':
      return 'Activity (Task / Note)'
  }
}

/** Text sources map to string/textarea/picklist; numbers to number/currency; dates to date/datetime; arrays to textarea only. */
function getCompatibleFields(
  sourceField: string,
  targetObject: TargetObject,
  schema: CrmSchema,
): CrmField[] {
  const objectSchema = schema[targetObject]
  if (!objectSchema) return []

  const numberSources = ['estimatedValue']
  const dateSources = ['closeDate']
  const arraySources = [
    'meetingSummary',
    'nextSteps',
    'painPoints',
    'competitorsMentioned',
    'productsDiscussed',
    'attendees',
  ]

  return objectSchema.fields.filter(f => {
    if (f.readOnly) return false

    if (numberSources.includes(sourceField)) {
      return ['number', 'currency', 'string', 'textarea'].includes(f.type)
    }
    if (dateSources.includes(sourceField)) {
      return ['date', 'datetime', 'string'].includes(f.type)
    }
    if (arraySources.includes(sourceField)) {
      return ['textarea', 'string'].includes(f.type)
    }
    // Default text sources
    return [
      'string',
      'textarea',
      'picklist',
      'email',
      'phone',
      'url',
    ].includes(f.type)
  })
}

const CONFIDENCE_STYLES: Record<string, string> = {
  high: 'border-volt/40 bg-volt/15 text-volt',
  medium: 'border-white/20 bg-white/5 text-white/60',
  low: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
}

const OBJECT_ORDER: TargetObject[] = [
  'contact',
  'account',
  'opportunity',
  'activity',
]

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function PushPlanReview({
  pushPlan,
  schema,
  isPushing,
  onConfirm,
  onCancel,
}: PushPlanReviewProps) {
  const [overrides, setOverrides] = useState<Map<string, string>>(new Map())
  const [rememberChanges, setRememberChanges] = useState(false)
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  )

  // Listen for online/offline
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setIsOffline(false), { once: true })
    window.addEventListener('offline', () => setIsOffline(true), { once: true })
  }

  const grouped = useMemo(() => {
    const map = new Map<TargetObject, PushAssignment[]>()
    for (const a of pushPlan.assignments) {
      const list = map.get(a.targetObject) ?? []
      list.push(a)
      map.set(a.targetObject, list)
    }
    return map
  }, [pushPlan.assignments])

  const handleOverride = (key: string, value: string) => {
    setOverrides(prev => {
      const next = new Map(prev)
      next.set(key, value)
      return next
    })
  }

  const handleConfirm = () => {
    const finalAssignments = pushPlan.assignments.map(a => {
      const key = `${a.sourceField}::${a.targetObject}`
      const overriddenField = overrides.get(key)
      if (overriddenField && overriddenField !== a.targetField) {
        return { ...a, targetField: overriddenField }
      }
      return a
    })

    const finalPlan: PushPlan = {
      ...pushPlan,
      assignments: finalAssignments,
    }

    const newRules: StickyRuleInput[] = []
    if (rememberChanges) {
      for (const [key, targetField] of Array.from(overrides.entries())) {
        const [sourceField, targetObject] = key.split('::')
        const original = pushPlan.assignments.find(
          a => a.sourceField === sourceField && a.targetObject === targetObject,
        )
        if (original && targetField !== original.targetField) {
          newRules.push({
            crmType: pushPlan.crmType as 'salesforce' | 'hubspot',
            sourceField,
            targetObject: targetObject as TargetObject,
            targetField,
          })
        }
      }
    }

    onConfirm(finalPlan, newRules)
  }

  const crmLabel =
    pushPlan.crmType === 'salesforce'
      ? 'Salesforce'
      : pushPlan.crmType === 'hubspot'
        ? 'HubSpot'
        : 'CRM'

  if (pushPlan.assignments.length === 0) {
    return (
      <div className={`${GLASS_BASE} p-5`}>
        <p className="font-body text-sm text-white/60">No fields to push.</p>
      </div>
    )
  }

  return (
    <div className={`${GLASS_BASE} p-5 flex flex-col gap-5`}>
      {/* Header */}
      <h3 className="font-display uppercase text-lg text-white leading-none">
        Push to {crmLabel}
      </h3>

      {/* Offline warning */}
      {isOffline && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-md px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-amber-300">
            Reconnect to push
          </p>
        </div>
      )}

      {/* Schema missing notice */}
      {!schema && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
          <p className="text-xs text-white/40">
            Couldn&apos;t load your CRM schema. Using default field mapping.
          </p>
        </div>
      )}

      {/* Object-grouped sections */}
      {OBJECT_ORDER.filter(obj => grouped.has(obj)).map(obj => {
        const assignments = grouped.get(obj)!
        return (
          <fieldset key={obj} className="flex flex-col gap-3 border-none p-0 m-0">
            <legend className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold text-white/50 pb-1">
              {objectLabel(obj)}
            </legend>

            {assignments.map(a => {
              const key = `${a.sourceField}::${a.targetObject}`
              const currentTarget = overrides.get(key) ?? a.targetField
              const compatibleFields = schema
                ? getCompatibleFields(a.sourceField, a.targetObject, schema)
                : []
              const isLow = a.confidence === 'low'
              const truncatedValue =
                a.valuePreview.length > 60
                  ? a.valuePreview.slice(0, 60) + '...'
                  : a.valuePreview

              return (
                <div
                  key={key}
                  className={`flex flex-col gap-1.5 rounded-xl px-4 py-3 ${
                    isLow
                      ? 'ring-1 ring-amber-500/40 bg-black/40'
                      : 'bg-black/40'
                  } border border-white/6 backdrop-blur-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]`}
                  aria-label={`${humanizeSourceField(a.sourceField)} mapped to ${currentTarget} on ${objectLabel(obj)}`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Source label */}
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">
                      {humanizeSourceField(a.sourceField)}
                    </span>

                    {/* Arrow */}
                    <span className="text-white/30" aria-hidden="true">
                      &rarr;
                    </span>

                    {/* Target dropdown */}
                    <select
                      value={currentTarget}
                      onChange={e => handleOverride(key, e.target.value)}
                      aria-label={`Target field for ${humanizeSourceField(a.sourceField)}`}
                      className="rounded-lg border border-white/15 bg-black/60 text-white/90 font-mono text-xs px-2 py-1.5 min-w-0 max-w-[180px]"
                    >
                      {/* Always include the current target as an option */}
                      {schema ? (
                        <>
                          {compatibleFields.some(f => f.name === a.targetField) ? null : (
                            <option value={a.targetField}>{a.targetField}</option>
                          )}
                          {compatibleFields.map(f => (
                            <option key={f.name} value={f.name}>
                              {f.label}
                              {f.custom ? ' (custom)' : ''}
                            </option>
                          ))}
                        </>
                      ) : (
                        <option value={a.targetField}>{a.targetField}</option>
                      )}
                    </select>

                    {/* Confidence chip */}
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] font-bold backdrop-blur-md ${CONFIDENCE_STYLES[a.confidence] ?? CONFIDENCE_STYLES.medium}`}
                    >
                      {a.confidence}
                    </span>

                    {/* Custom field badge */}
                    {a.isCustomField && (
                      <span
                        className="text-[10px]"
                        title="Custom field"
                        aria-label="Custom field"
                      >
                        &#127991;
                      </span>
                    )}
                  </div>

                  {/* Value preview */}
                  <p className="font-body text-sm text-white/80">{truncatedValue}</p>

                  {/* Low confidence reason */}
                  {isLow && a.reason && (
                    <p className="text-xs text-amber-300/80">{a.reason}</p>
                  )}
                </div>
              )
            })}
          </fieldset>
        )
      })}

      {/* Remember changes checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={rememberChanges}
          onChange={e => setRememberChanges(e.target.checked)}
          className="rounded border-white/20 bg-black/40 text-volt focus:ring-volt/50"
        />
        <span className="font-mono text-xs text-white/60">
          Remember my changes
        </span>
      </label>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className={BTN_GHOST}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPushing || isOffline}
          className={BTN_VOLT}
        >
          {isPushing ? 'Pushing...' : 'Confirm & Push'}
        </button>
      </div>
    </div>
  )
}
