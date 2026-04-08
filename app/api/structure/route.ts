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

  try {
    const client = getAnthropicClient()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 4096,
      system: STRUCTURE_SYSTEM_PROMPT,
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

    return NextResponse.json({ structured: parsed.data })
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
