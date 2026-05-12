import 'server-only'
import { getAnthropicClient } from '@/lib/anthropic/server'
import { CRMNoteSchema, type CRMNote, StructuredOutputSchema } from '@/lib/notes/schema'
import {
  CRM_NOTE_INPUT_SCHEMA,
  CRM_NOTE_WITH_PLAN_INPUT_SCHEMA,
} from '@/lib/notes/input-schema'
import {
  STRUCTURE_SYSTEM_PROMPT,
  STRUCTURE_FEW_SHOT_EXAMPLES,
  structureUserPrompt,
  buildSchemaBlock,
  buildStickyRulesBlock,
  PUSH_PLAN_INSTRUCTIONS,
  PUSH_PLAN_FEW_SHOT_SF,
} from '@/lib/notes/prompts'
import { buildClaudeContextBlock, type UserMemory } from '@/lib/user-memory/scoring'
import { reconcileCRMNote } from '@/lib/user-memory/reconcile'
import type { CrmSchema, PushAssignment, PushPlan, StickyRule } from '@/lib/crm/schema/types'

export class StructureValidationError extends Error {
  constructor(message = 'AI returned invalid structure') {
    super(message)
    this.name = 'StructureValidationError'
  }
}

export class StructureProviderAuthError extends Error {
  constructor(message = 'AI provider authentication failed') {
    super(message)
    this.name = 'StructureProviderAuthError'
  }
}

export class StructureProviderModelError extends Error {
  constructor(message = 'AI extraction model is unavailable') {
    super(message)
    this.name = 'StructureProviderModelError'
  }
}

const STRUCTURE_MODEL =
  process.env.ANTHROPIC_STRUCTURE_MODEL || 'claude-sonnet-4-6'

interface StructureTranscriptOptions {
  transcript: string
  memory: UserMemory
  crmSchema?: CrmSchema | null
  stickyRules?: StickyRule[]
}

export interface StructureTranscriptResult {
  crmNote: CRMNote
  pushPlan?: PushPlan
}

function schemaFieldsFromCrm(crmSchema: CrmSchema) {
  return {
    contact: crmSchema.contact.fields.map(f => ({
      name: f.name,
      label: f.label,
      type: f.type,
      custom: f.custom,
    })),
    account: crmSchema.account.fields.map(f => ({
      name: f.name,
      label: f.label,
      type: f.type,
      custom: f.custom,
    })),
    opportunity: crmSchema.opportunity.fields.map(f => ({
      name: f.name,
      label: f.label,
      type: f.type,
      custom: f.custom,
    })),
    activity: crmSchema.activity.fields.map(f => ({
      name: f.name,
      label: f.label,
      type: f.type,
      custom: f.custom,
    })),
  }
}

function validatePushPlanAssignments(
  pushPlan: PushPlan | undefined,
  crmSchema: CrmSchema | null | undefined
): PushPlan | undefined {
  if (!pushPlan || !crmSchema) return pushPlan

  pushPlan.assignments = pushPlan.assignments.filter(a => {
    const obj =
      crmSchema[
        a.targetObject === 'account'
          ? 'account'
          : a.targetObject === 'contact'
            ? 'contact'
            : a.targetObject === 'opportunity'
              ? 'opportunity'
              : 'activity'
      ]
    return obj?.fields.some(f => f.name === a.targetField)
  })

  return pushPlan
}

function applyStickyRules(
  pushPlan: PushPlan | undefined,
  stickyRules: StickyRule[]
): PushPlan | undefined {
  if (!pushPlan || stickyRules.length === 0) return pushPlan

  for (const rule of stickyRules) {
    const override: PushAssignment = {
      sourceField: rule.sourceField,
      targetObject: rule.targetObject,
      targetField: rule.targetField,
      valuePreview: '',
      confidence: 'high',
      reason: 'User sticky rule',
    }
    const existingIdx = pushPlan.assignments.findIndex(
      a => a.sourceField === rule.sourceField && a.targetObject === rule.targetObject
    )
    if (existingIdx >= 0) {
      override.valuePreview = pushPlan.assignments[existingIdx].valuePreview
      pushPlan.assignments[existingIdx] = override
    } else {
      pushPlan.assignments.push(override)
    }
  }

  return pushPlan
}

export async function structureTranscript({
  transcript,
  memory,
  crmSchema = null,
  stickyRules = [],
}: StructureTranscriptOptions): Promise<StructureTranscriptResult> {
  const contextBlock = buildClaudeContextBlock(memory)
  if (process.env.DEBUG_USER_MEMORY && contextBlock) {
    console.log('[structure] injecting user context:\n', contextBlock)
  }

  const systemBlocks: Array<{
    type: 'text'
    text: string
    cache_control?: { type: 'ephemeral' }
  }> = [
    {
      type: 'text',
      text: STRUCTURE_SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ]

  if (contextBlock) {
    systemBlocks.push({
      type: 'text',
      text: `## USER CONTEXT

${contextBlock}

When the transcript is ambiguous, prefer names and entities from USER CONTEXT. Example: if "Mike" is mentioned and Known Contacts includes "Mike Johnson", extract "Mike Johnson". Never invent values that aren't in the transcript. USER CONTEXT only helps you disambiguate what the rep actually said.`,
    })
  }

  if (crmSchema) {
    systemBlocks.push({
      type: 'text',
      text: buildSchemaBlock(JSON.stringify(schemaFieldsFromCrm(crmSchema), null, 2)),
      cache_control: { type: 'ephemeral' },
    })
    systemBlocks.push({
      type: 'text',
      text: PUSH_PLAN_INSTRUCTIONS,
    })
    const rulesBlock = buildStickyRulesBlock(stickyRules)
    if (rulesBlock) {
      systemBlocks.push({ type: 'text', text: rulesBlock })
    }
  }

  try {
    const client = getAnthropicClient()
    const useSchemaAwareTool = !!crmSchema
    const toolName = useSchemaAwareTool
      ? 'extract_crm_note_with_plan'
      : 'extract_crm_note'
    const toolSchema = useSchemaAwareTool
      ? CRM_NOTE_WITH_PLAN_INPUT_SCHEMA
      : CRM_NOTE_INPUT_SCHEMA
    const toolDesc = useSchemaAwareTool
      ? 'Extract structured CRM fields and produce a push plan mapping each field to the user\'s actual CRM schema'
      : 'Extract structured CRM fields from an aesthetic sales debrief with confidence indicators'

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...STRUCTURE_FEW_SHOT_EXAMPLES.map((ex) => ({
        role: ex.role,
        content: ex.content,
      })),
    ]

    if (useSchemaAwareTool) {
      messages.push(
        {
          role: 'user',
          content:
            'Extract structured CRM data from this transcript:\n\n---\nJust got out of a meeting with Sarah Chen, VP of Engineering at Acme Corp. Deal could be around 150K ARR. Main pain is pricing on their current tool. Need to send migration playbook by Friday.\n---',
        },
        PUSH_PLAN_FEW_SHOT_SF
      )
    }

    messages.push({ role: 'user', content: structureUserPrompt(transcript.trim()) })

    const response = await client.messages.create({
      model: STRUCTURE_MODEL,
      max_tokens: 4096,
      system: systemBlocks,
      messages,
      tools: [
        {
          name: toolName,
          description: toolDesc,
          input_schema: toolSchema,
        },
      ],
      tool_choice: { type: 'tool', name: toolName },
    })

    const toolBlock = response.content.find((block) => block.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      throw new StructureValidationError('No structured output returned from AI')
    }

    let crmNote: CRMNote
    let pushPlan: PushPlan | undefined

    if (useSchemaAwareTool) {
      const parsed = StructuredOutputSchema.safeParse(toolBlock.input)
      if (!parsed.success) {
        const fallback = CRMNoteSchema.safeParse(toolBlock.input)
        if (!fallback.success) {
          console.error('Zod validation failed:', parsed.error.flatten())
          throw new StructureValidationError()
        }
        crmNote = fallback.data
      } else {
        crmNote = parsed.data.crmNote
        pushPlan = validatePushPlanAssignments(parsed.data.pushPlan, crmSchema)
        pushPlan = applyStickyRules(pushPlan, stickyRules)
      }
    } else {
      const parsed = CRMNoteSchema.safeParse(toolBlock.input)
      if (!parsed.success) {
        console.error('Zod validation failed:', parsed.error.flatten())
        throw new StructureValidationError()
      }
      crmNote = parsed.data
    }

    return {
      crmNote: reconcileCRMNote(crmNote, memory),
      pushPlan,
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error as { status: number }).status === 401
    ) {
      throw new StructureProviderAuthError()
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error as { status: number }).status === 404
    ) {
      throw new StructureProviderModelError()
    }
    throw error
  }
}
