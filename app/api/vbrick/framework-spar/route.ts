import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { createClient } from '@/lib/supabase/server'
import { ACCENT_COACHING_PROMPTS } from '@/lib/vbrick/bdr-framework'
import { getPersonaById, type PersonaId } from '@/lib/vbrick/sparring-personas'

export const runtime = 'nodejs'
export const maxDuration = 60

// Start a new framework-based sparring session
export async function POST(request: Request) {
  // VBrick tenant uses localStorage email identity, not Supabase auth.
  // A Supabase session is opportunistic — used to save session history if present,
  // but not required to run the practice session itself.
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  try {
    const body = await request.json()
    const { 
      personaId, 
      action, 
      sessionId, 
      bdrMessage, 
      transcription, 
      bdrAccent = 'general',
      currentStep = 'name_capture'
    } = body

    // Validate persona
    const persona = getPersonaById(personaId as PersonaId)
    if (!persona) {
      return NextResponse.json({ error: 'Invalid persona' }, { status: 400 })
    }

    // Initialize new session
    if (action === 'start') {
      const openai = getOpenAIClient()

      // Generate opening response based on framework step 1 (name capture)
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `${persona.systemPrompt}\n\nCURRENT CONTEXT: This is a cold call. The BDR (sales rep) is calling you. They'll ask for your name first:\n\n"First and last name?" (inquisitive tone)\n\nAfter you give your name, they say: "Great, I was hoping you can help me out real quick."\n\nYOUR RESPONSE (as ${persona.name}, ${persona.title}):\n- Answer with your first and last name\n- Include your natural reaction (busy, curious, guarded)\n- This sets the tone for the rest of the call\n\nKeep response realistic and conversational (1-2 sentences).`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })

      const openingResponse = completion.choices[0].message.content || "Hello? Who is this?"

      // Generate TTS for the opening
      const tts = await openai.audio.speech.create({
        model: 'tts-1',
        voice: persona.voice,
        input: openingResponse,
        speed: 1.0
      })

      const audioBuffer = Buffer.from(await tts.arrayBuffer())
      const audioBase64 = audioBuffer.toString('base64')

      return NextResponse.json({
        sessionId: crypto.randomUUID(),
        persona,
        openingResponse,
        audioBase64,
        context: `The BDR just called and asked for your name. ${persona.openingContext}`,
        framework: {
          currentStep: 'name_capture',
          nextStep: 'help_request',
          expectedBDRTransition: "Great, I was hoping you can help me out real quick."
        }
      })
    }

    // Continue conversation with framework tracking
    if (action === 'respond' && sessionId && bdrMessage) {
      const openai = getOpenAIClient()

      // Get conversation history
      const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> =
        body.conversationHistory || []

      // Detect which framework step BDR is on based on their message
      const detectedStep = detectFrameworkStep(bdrMessage, currentStep)
      
      // Generate contextual hint for the AI persona
      const frameworkContext = getFrameworkContext(detectedStep, persona)

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `${persona.systemPrompt}\n\nFRAMEWORK TRACKING:\nThe BDR is using the VBRICK cold call framework. Current step: ${detectedStep}\n\n${frameworkContext}\n\nCONVERSATION GUIDELINES:\n- Respond as ${persona.name} authentically\n- React to their script naturally - you can say yes or no to qualification\n- If they ask "Are you responsible for X?" - answer honestly based on your role\n- If you say NO, expect them to ask for a referral\n- If you say YES, expect a value proposition\n- Stay in character - don't "play nice" just because it's training\n- You can be skeptical, busy, or interested based on your personality`
          },
          ...conversationHistory,
          { role: 'user', content: bdrMessage }
        ],
        temperature: 0.75,
        max_tokens: 150
      })

      const response = completion.choices[0].message.content || "I'm going to have to go."

      // Generate TTS
      const tts = await openai.audio.speech.create({
        model: 'tts-1',
        voice: persona.voice,
        input: response,
        speed: 1.0
      })

      const audioBuffer = Buffer.from(await tts.arrayBuffer())
      const audioBase64 = audioBuffer.toString('base64')

      // Determine next expected framework step
      const nextStep = getNextFrameworkStep(detectedStep, response)

      return NextResponse.json({
        response,
        audioBase64,
        detectedStep,
        nextStep,
        conversationHistory: [
          ...conversationHistory,
          { role: 'user', content: bdrMessage },
          { role: 'assistant', content: response }
        ]
      })
    }

    // End session and score with framework evaluation
    if (action === 'score' && sessionId && transcription) {
      const openai = getOpenAIClient()

      // Build full transcript
      const fullTranscript = transcription

      // Get accent-specific coaching context
      const accentContext = bdrAccent === 'irish' 
        ? ACCENT_COACHING_PROMPTS.irish 
        : bdrAccent === 'newZealand' 
        ? ACCENT_COACHING_PROMPTS.newZealand 
        : ''

      // Framework-aware scoring
      const scoreCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert BDR coach evaluating a cold call against the VBRICK framework.

FRAMEWORK BEING EVALUATED:
1. Name Capture: "First and last name?" (inquisitive tone)
2. Help Request: "Great, I was hoping you can help me out real quick."
3. Qualification: "Are you on the team responsible for [company's] X?"
4. Pivot:
   - YES → "Great, the reason I'm calling is because Y" (value prop)
   - NO → "Who do you feel would be the best person to speak with about X?" (NO "oh sorry!" - direct pivot)
5. Bridge: "Thanks! May I tell them hello from you?"

${accentContext}

SCORING RUBRIC:
- Framework Adherence (30%): Did they hit all framework steps correctly?
- Accent Clarity (15%): Were they clear despite their accent? Did they enunciate key words?
- Tonality (20%): Friendly, helpful, confident delivery
- Objection Handling (20%): Handled NO path gracefully, got referral
- Information Gathering (15%): Got name, qualified correctly, got referral if needed, permission to name-drop

PERSONA CONTEXT:
${persona.name}, ${persona.title} at ${persona.company}
Personality: ${persona.personality}`
          },
          {
            role: 'user',
            content: `Evaluate this BDR call transcript:

${fullTranscript}

BDR Selection: ${bdrAccent === 'irish' ? 'Irish accent' : bdrAccent === 'newZealand' ? 'New Zealand accent' : 'General'}

Score on Framework Adherence, Accent Clarity, Tonality, Objection Handling, and Information Gathering.`
          }
        ],
        functions: [{
          name: 'score_framework_call',
          description: 'Score a framework-based cold call practice session',
          parameters: {
            type: 'object',
            properties: {
              total_score: { type: 'number', description: '0-100 total score' },
              framework_score: { type: 'number', description: 'Framework adherence 0-100' },
              accent_score: { type: 'number', description: 'Accent clarity 0-100' },
              dimensions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { 
                      type: 'string', 
                      enum: ['Framework Adherence', 'Accent Clarity', 'Tonality', 'Objection Handling', 'Information Gathering']
                    },
                    score: { type: 'number' },
                    weight: { type: 'number' },
                    feedback: { type: 'string' }
                  }
                }
              },
              framework_analysis: {
                type: 'object',
                properties: {
                  name_captured: { type: 'boolean' },
                  qualification_asked: { type: 'boolean' },
                  pivot_executed: { type: 'boolean' },
                  value_prop_delivered: { type: 'boolean' },
                  referral_requested: { type: 'boolean' },
                  bridge_attempted: { type: 'boolean' },
                  permission_granted_by_persona: { type: 'boolean' }
                }
              },
              accent_feedback: {
                type: 'string',
                description: 'Specific feedback on accent compensation'
              },
              key_strengths: { type: 'array', items: { type: 'string' } },
              improvements: { type: 'array', items: { type: 'string' } },
              script_improvements: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    original: { type: 'string' },
                    improved: { type: 'string' },
                    reason: { type: 'string' }
                  }
                }
              },
              would_transfer: { type: 'boolean' },
              transfer_confidence: { type: 'number', description: '0-100' }
            },
            required: ['total_score', 'framework_score', 'dimensions', 'framework_analysis', 'key_strengths', 'improvements']
          }
        }],
        function_call: { name: 'score_framework_call' },
        temperature: 0.3
      })

      const functionCall = scoreCompletion.choices[0].message.function_call
      if (!functionCall?.arguments) {
        return NextResponse.json({ error: 'Failed to score call' }, { status: 500 })
      }

      const scoringResult = JSON.parse(functionCall.arguments)

      // Store session in database (only if a Supabase user is signed in;
      // the VBrick tenant otherwise runs on localStorage email identity)
      if (user) {
        await supabase.from('sparring_sessions').insert({
          user_id: user.id,
          persona_id: personaId,
          total_score: scoringResult.total_score,
          framework_score: scoringResult.framework_score,
          accent_score: scoringResult.accent_score,
          dimensions: scoringResult.dimensions,
          framework_data: scoringResult.framework_analysis,
          transcription: fullTranscript,
          bdr_accent: bdrAccent,
          would_meet: scoringResult.would_transfer,
          meeting_likelihood: scoringResult.transfer_confidence,
          accent_feedback: scoringResult.accent_feedback,
          key_strengths: scoringResult.key_strengths,
          improvements: scoringResult.improvements
        })
      }

      return NextResponse.json({
        score: scoringResult.total_score,
        frameworkScore: scoringResult.framework_score,
        accentScore: scoringResult.accent_score,
        dimensions: scoringResult.dimensions,
        frameworkAnalysis: scoringResult.framework_analysis,
        accentFeedback: scoringResult.accent_feedback,
        strengths: scoringResult.key_strengths,
        improvements: scoringResult.improvements,
        scriptImprovements: scoringResult.script_improvements || [],
        wouldTransfer: scoringResult.would_transfer,
        transferConfidence: scoringResult.transfer_confidence
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Sparring session error:', error)
    return NextResponse.json(
      { error: 'Failed to process sparring session' },
      { status: 500 }
    )
  }
}

// Helper: Detect which framework step the BDR is on
function detectFrameworkStep(message: string, currentStep: string): string {
  const lower = message.toLowerCase()
  
  // Check for name capture
  if ((lower.includes('could i get your') && lower.includes('name')) || lower.match(/first.*last.*name\?/) || lower.includes("first and last name")) {
    return 'name_capture'
  }
  
  // Check for qualification
  if (lower.includes('responsible for') || lower.includes('in charge of') || lower.includes('team that handles')) {
    return 'qualification'
  }
  
  // Check for yes path (value prop)
  if (lower.includes('reason i\'m calling') || lower.includes('reason for my call')) {
    return 'yes_path'
  }
  
  // Check for no path (referral request)
  if (lower.includes('best person') || lower.includes('right person') || lower.includes('who would')) {
    return 'no_path'
  }
  
  // Check for bridge
  if (lower.includes('tell her hi') || lower.includes('say hi') || lower.includes('mention you') || lower.includes('you said hello')) {
    return 'bridge'
  }
  
  // Default to current step progression
  return currentStep
}

// Helper: Get framework context for AI persona
function getFrameworkContext(step: string, persona: { company: string; title: string }): string {
  const contexts: Record<string, string> = {
    name_capture: `They asked "First and last name?" After you respond, they should say: "Great, I was hoping you can help me out real quick."`,
    help_request: `They just asked for help. Next: "Are you on the team responsible for ${persona.company}'s [video/streaming/communications]?"`,
    qualification: `They'll ask: "Are you on the team responsible for ${persona.company}'s [video/streaming/communications]?" Answer based on your role: ${persona.title}`,
    yes_path: `They said you're qualified. They'll deliver a value proposition starting with "Great, the reason I'm calling is because..." You're ${persona.title}, so react appropriately.`,
    no_path: `You said NO to qualification. Expect: "Who do you feel would be the best person to speak with about [topic]?" (NO "oh sorry!" - direct redirect). Then: "Thanks! May I tell them hello from you?" You can give them a name or deflect.`,
    bridge: `They'll close with: "Thanks! May I tell them hello from you?" or similar. You can grant permission or not.`
  }
  
  return contexts[step] || ''
}

// Helper: Get next framework step
function getNextFrameworkStep(currentStep: string, aiResponse: string): string {
  const lower = aiResponse.toLowerCase()
  
  switch (currentStep) {
    case 'name_capture':
      return 'qualification'
    case 'qualification':
      // Check if they said yes or no
      if (lower.includes('no') || lower.includes('wrong person') || lower.includes('not me')) {
        return 'no_path'
      }
      return 'yes_path'
    case 'yes_path':
    case 'no_path':
      return 'bridge'
    case 'bridge':
      return 'complete'
    default:
      return currentStep
  }
}
