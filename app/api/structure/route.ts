import { NextResponse } from 'next/server'
import { getAnthropicClient } from '@/lib/anthropic/server'
import { CRMNoteSchema } from '@/lib/notes/schema'
import { CRM_NOTE_INPUT_SCHEMA } from '@/lib/notes/input-schema'
import {
  STRUCTURE_SYSTEM_PROMPT,
  STRUCTURE_FEW_SHOT_EXAMPLES,
  structureUserPrompt,
} from '@/lib/notes/prompts'
import { createClient } from '@/lib/supabase/server'
import { getUserMemory } from '@/lib/user-memory/server'
import { buildClaudeContextBlock, EMPTY_USER_MEMORY } from '@/lib/user-memory/scoring'
import { reconcileCRMNote } from '@/lib/user-memory/reconcile'

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

  try {
    const client = getAnthropicClient()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 4096,
      system: systemBlocks,
      messages: [
        ...STRUCTURE_FEW_SHOT_EXAMPLES.map((ex) => ({
          role: ex.role,
          content: ex.content,
        })),
        { role: 'user', content: structureUserPrompt(transcript.trim()) },
      ],
      tools: [
        {
          name: 'extract_crm_note',
          description:
            'Extract structured CRM fields from a sales meeting transcript with confidence indicators',
          input_schema: CRM_NOTE_INPUT_SCHEMA,
        },
      ],
      tool_choice: { type: 'tool', name: 'extract_crm_note' },
    })

    const toolBlock = response.content.find((block) => block.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      return jsonError('No structured output returned from AI', 502)
    }

    const parsed = CRMNoteSchema.safeParse(toolBlock.input)
    if (!parsed.success) {
      console.error('Zod validation failed:', parsed.error.flatten())
      return jsonError('AI returned invalid structure', 502)
    }

    const reconciled = reconcileCRMNote(parsed.data, memory)

    return NextResponse.json({ structured: reconciled })
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
