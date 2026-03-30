import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { getDraftAssemblyPrompt, DRAFTING_ASSISTANT_SYSTEM_PROMPT } from '@/lib/vbrick/story-prompts'
import type { StoryType, AIMessage } from '@/lib/vbrick/story-types'

export const runtime = 'nodejs'
export const maxDuration = 30

// POST: Continue AI conversation or assemble draft
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json()
  const { action, message, answers } = body as {
    action: 'chat' | 'assemble'
    message?: string
    answers?: Record<string, string>
  }

  const supabase = await createClient()
  const { data: draft, error } = await supabase
    .from('story_drafts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !draft) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })

  const openai = getOpenAIClient()

  if (action === 'assemble' && answers) {
    // Assemble a polished draft from the framework answers
    const { system, user } = getDraftAssemblyPrompt(draft.story_type as StoryType, answers)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 800,
    })

    const assembledDraft = completion.choices[0]?.message?.content?.trim() || ''

    // Update draft with assembled content and metadata
    await supabase
      .from('story_drafts')
      .update({
        draft_content: assembledDraft,
        framework_metadata: answers,
        status: 'practicing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    return NextResponse.json({ draft_content: assembledDraft })
  }

  if (action === 'chat' && message) {
    // Continue conversational AI drafting
    const conversation = (draft.ai_conversation as AIMessage[]) || []
    const updatedConversation = [...conversation, { role: 'user' as const, content: message }]

    const messages = [
      { role: 'system' as const, content: DRAFTING_ASSISTANT_SYSTEM_PROMPT },
      ...updatedConversation.map((m: AIMessage) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = completion.choices[0]?.message?.content?.trim() || ''
    const finalConversation = [...updatedConversation, { role: 'assistant' as const, content: aiResponse }]

    await supabase
      .from('story_drafts')
      .update({
        ai_conversation: finalConversation,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    return NextResponse.json({ message: aiResponse, conversation: finalConversation })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
