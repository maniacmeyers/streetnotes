import { NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/anthropic/server'
import { CRMNoteSchema, type CRMNote, StructuredOutputSchema } from '@/lib/notes/schema'
import { CRM_NOTE_INPUT_SCHEMA, CRM_NOTE_WITH_PLAN_INPUT_SCHEMA } from '@/lib/notes/input-schema'
import {
  STRUCTURE_SYSTEM_PROMPT,
  STRUCTURE_FEW_SHOT_EXAMPLES,
  structureUserPrompt,
  buildSchemaBlock,
  buildStickyRulesBlock,
  PUSH_PLAN_INSTRUCTIONS,
  PUSH_PLAN_FEW_SHOT_SF,
} from '@/lib/notes/prompts'
import { createClient } from '@/lib/supabase/server'
import { getUserMemory } from '@/lib/user-memory/server'
import { buildClaudeContextBlock, EMPTY_USER_MEMORY } from '@/lib/user-memory/scoring'
import { reconcileCRMNote } from '@/lib/user-memory/reconcile'
import { getPreferredCrm, getCachedSchema, getStickyRules } from '@/lib/crm/schema/cache'
import type { CrmSchema, StickyRule, PushPlan, PushAssignment } from '@/lib/crm/schema/types'

export const runtime = 'nodejs'
export const maxDuration = 60

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return jsonError('Unauthorized', 401)
  }

  let body: { transcript: string }
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  const { transcript } = body
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return jsonError('Missing or empty transcript', 400)
  }

  // Learning is best-effort — never blocks the core extraction path.
  let memory = EMPTY_USER_MEMORY
  try {
    memory = await getUserMemory(user.id)
  } catch (err) {
    if (process.env.DEBUG_USER_MEMORY) {
      console.error('[structure] getUserMemory failed, continuing without:', err)
    }
  }

  let crmSchema: CrmSchema | null = null
  let stickyRules: StickyRule[] = []
  try {
    const preferredCrm = await getPreferredCrm(supabase, user.id)
    if (preferredCrm) {
      const cached = await getCachedSchema(supabase, user.id, preferredCrm)
      if (cached) crmSchema = cached.schema
      stickyRules = await getStickyRules(supabase, user.id, preferredCrm)
    }
  } catch (err) {
    console.error('[structure] schema/rules load failed, continuing without:', err)
  }

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

When the transcript is ambiguous, prefer names and entities from USER CONTEXT. Example: if "Mike" is mentioned and Known Contacts includes "Mike Johnson", extract "Mike Johnson". Never invent values that aren't in the transcript — USER CONTEXT only helps you disambiguate what the rep actually said.`,
    })
  }

  if (crmSchema) {
    const schemaFields = {
      contact: crmSchema.contact.fields.map(f => ({ name: f.name, label: f.label, type: f.type, custom: f.custom })),
      account: crmSchema.account.fields.map(f => ({ name: f.name, label: f.label, type: f.type, custom: f.custom })),
      opportunity: crmSchema.opportunity.fields.map(f => ({ name: f.name, label: f.label, type: f.type, custom: f.custom })),
      activity: crmSchema.activity.fields.map(f => ({ name: f.name, label: f.label, type: f.type, custom: f.custom })),
    }
    systemBlocks.push({
      type: 'text',
      text: buildSchemaBlock(JSON.stringify(schemaFields, null, 2)),
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
    const toolName = useSchemaAwareTool ? 'extract_crm_note_with_plan' : 'extract_crm_note'
    const toolSchema = useSchemaAwareTool ? CRM_NOTE_WITH_PLAN_INPUT_SCHEMA : CRM_NOTE_INPUT_SCHEMA
    const toolDesc = useSchemaAwareTool
      ? 'Extract structured CRM fields and produce a push plan mapping each field to the user\'s actual CRM schema'
      : 'Extract structured CRM fields from a sales meeting transcript with confidence indicators'

    // Build messages: few-shot examples + optional push plan few-shot + user transcript
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...STRUCTURE_FEW_SHOT_EXAMPLES.map((ex) => ({
        role: ex.role,
        content: ex.content,
      })),
    ]
    if (useSchemaAwareTool) {
      messages.push(
        { role: 'user', content: 'Extract structured CRM data from this transcript:\n\n---\nJust got out of a meeting with Sarah Chen, VP of Engineering at Acme Corp. Deal could be around 150K ARR. Main pain is pricing on their current tool. Need to send migration playbook by Friday.\n---' },
        PUSH_PLAN_FEW_SHOT_SF
      )
    }
    messages.push({ role: 'user', content: structureUserPrompt(transcript.trim()) })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6-20250514',
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
      return jsonError('No structured output returned from AI', 502)
    }

    let crmNote: CRMNote
    let pushPlan: PushPlan | undefined

    if (useSchemaAwareTool) {
      const parsed = StructuredOutputSchema.safeParse(toolBlock.input)
      if (!parsed.success) {
        // Fallback: try parsing as just CRMNote (Claude may have ignored the wrapper)
        const fallback = CRMNoteSchema.safeParse(toolBlock.input)
        if (!fallback.success) {
          console.error('Zod validation failed:', parsed.error.flatten())
          return jsonError('AI returned invalid structure', 502)
        }
        crmNote = fallback.data
      } else {
        crmNote = parsed.data.crmNote
        pushPlan = parsed.data.pushPlan

        // Validate pushPlan assignments against schema
        if (pushPlan && crmSchema) {
          pushPlan.assignments = pushPlan.assignments.filter(a => {
            const obj = crmSchema[a.targetObject === 'account' ? 'account' : a.targetObject === 'contact' ? 'contact' : a.targetObject === 'opportunity' ? 'opportunity' : 'activity']
            return obj?.fields.some(f => f.name === a.targetField)
          })
        }

        // Apply sticky rules deterministically
        if (pushPlan && stickyRules.length > 0) {
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
        }
      }
    } else {
      const parsed = CRMNoteSchema.safeParse(toolBlock.input)
      if (!parsed.success) {
        console.error('Zod validation failed:', parsed.error.flatten())
        return jsonError('AI returned invalid structure', 502)
      }
      crmNote = parsed.data
    }

    const reconciled = reconcileCRMNote(crmNote, memory)

    return NextResponse.json({
      structured: {
        crmNote: reconciled,
        pushPlan: pushPlan ?? undefined,
      },
    })
  } catch (error) {
    console.error('Structure API error:', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      (error as { status: number }).status === 401
    ) {
      return jsonError('AI provider authentication failed', 502)
    }
    return jsonError('Failed to structure transcript', 502)
  }
}
