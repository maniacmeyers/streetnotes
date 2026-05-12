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
  'fg-card'
const BTN_VOLT =
  'fg-action'
const BTN_GHOST =
  'fg-secondary-action px-4'

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
  high: 'bg-[#A8855A] text-[#FAF6EE]',
  medium: 'bg-[#D4A28A]/28 text-[#8B6B40]',
  low: 'bg-[#F2EBDF] text-[#8B6B40]',
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
            crmType: pushPlan.crmType as 'salesforce',
            sourceField,
            targetObject: targetObject as TargetObject,
            targetField,
          })
        }
      }
    }

    onConfirm(finalPlan, newRules)
  }

  const crmLabel = pushPlan.crmType === 'salesforce' ? 'Salesforce' : 'CRM'

  if (pushPlan.assignments.length === 0) {
    return (
      <div className={`${GLASS_BASE} p-[22px]`}>
        <p className="text-sm text-[#3D332A]">No fields to push.</p>
      </div>
    )
  }

  return (
    <div className={`${GLASS_BASE} flex flex-col gap-5 p-[22px]`}>
      {/* Header */}
      <h3 className="text-[21px] font-extrabold tracking-[-0.02em] text-[#1A1410]">
        Push to {crmLabel}
      </h3>

      {/* Offline warning */}
      {isOffline && (
        <div className="fg-inset px-4 py-3">
          <p className="text-sm font-extrabold text-[#8B6B40]">
            Reconnect to push
          </p>
        </div>
      )}

      {/* Schema missing notice */}
      {!schema && (
        <div className="fg-inset px-4 py-3">
          <p className="text-xs text-[#3D332A]">
            Couldn&apos;t load your CRM schema. Using default field mapping.
          </p>
        </div>
      )}

      {/* Object-grouped sections */}
      {OBJECT_ORDER.filter(obj => grouped.has(obj)).map(obj => {
        const assignments = grouped.get(obj)!
        return (
          <fieldset key={obj} className="flex flex-col gap-3 border-none p-0 m-0">
            <legend className="pb-1 text-xs font-extrabold text-[#3D332A]">
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
                  className={`fg-inset flex flex-col gap-2 px-4 py-3 ${
                    isLow
                      ? 'ring-1 ring-[#8B6B40]/35'
                      : ''
                  }`}
                  aria-label={`${humanizeSourceField(a.sourceField)} mapped to ${currentTarget} on ${objectLabel(obj)}`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Source label */}
                    <span className="text-xs font-extrabold text-[#3D332A]">
                      {humanizeSourceField(a.sourceField)}
                    </span>

                    {/* Arrow */}
                    <span className="text-[#A8855A]" aria-hidden="true">
                      &rarr;
                    </span>

                    {/* Target dropdown */}
                    <select
                      value={currentTarget}
                      onChange={e => handleOverride(key, e.target.value)}
                      aria-label={`Target field for ${humanizeSourceField(a.sourceField)}`}
                      className="fg-input min-h-[48px] max-w-full px-3 py-2 text-xs"
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
                      className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold ${CONFIDENCE_STYLES[a.confidence] ?? CONFIDENCE_STYLES.medium}`}
                    >
                      {a.confidence}
                    </span>

                    {/* Custom field badge */}
                    {a.isCustomField && (
                      <span
                        className="rounded-full bg-[#D4A28A]/24 px-2 py-1 text-[10px] font-extrabold text-[#8B6B40]"
                        title="Custom field"
                        aria-label="Custom field"
                      >
                        Custom
                      </span>
                    )}
                  </div>

                  {/* Value preview */}
                  <p className="text-sm leading-6 text-[#3D332A]">{truncatedValue}</p>

                  {/* Low confidence reason */}
                  {isLow && a.reason && (
                    <p className="text-xs text-[#8B6B40]">{a.reason}</p>
                  )}
                </div>
              )
            })}
          </fieldset>
        )
      })}

      {/* Remember changes checkbox */}
      <label className="flex min-h-[48px] cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={rememberChanges}
          onChange={e => setRememberChanges(e.target.checked)}
          className="h-5 w-5 rounded"
          style={{ accentColor: '#A8855A' }}
        />
        <span className="text-sm font-medium text-[#3D332A]">
          Remember my changes
        </span>
      </label>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
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
