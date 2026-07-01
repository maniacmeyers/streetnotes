import { NextResponse } from 'next/server'
import { getOpenAIClient } from '@/lib/openai/server'
import { createClient } from '@/lib/supabase/server'
import { ACCENT_COACHING_PROMPTS } from '@/lib/vbrick/bdr-framework'
import { getPersonaById, type PersonaId } from '@/lib/vbrick/sparring-personas'
import { getScenarioById } from '@/lib/vbrick/sparring-scenarios'
import {
  VBRICK_2026_CONTEXT,
  INFLECTION_SCHEMA_PROPERTIES,
  mapInflectionPoints,
} from '@/lib/vbrick/sparring-scoring'

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
      currentStep = 'name_capture',
      scenarioId,
      difficulty
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

      // Scenario ground truth — drives the "what should have been said" rewrites
      const scenario = getScenarioById(scenarioId)
      // Easy & Intermediate share the same content; the level decides how
      // leniently to grade. Fall back to the content track if not provided.
      const level: 'easy' | 'intermediate' | 'hard' =
        difficulty ?? (scenario?.track === 'easy' ? 'easy' : 'hard')
      const levelBlock =
        level === 'easy'
          ? `\nBEGINNER MODE — this rep is brand-new to cold calling. Grade encouragingly and constructively. Be generous with the score, lead the feedback with what they did well, and frame every improvement as the next small thing to try (not a failure). Floor a genuine attempt around 70+. The goal is to motivate them to keep practicing.\n`
          : level === 'intermediate'
          ? `\nINTERMEDIATE MODE — this rep has some reps in. Grade honestly but constructively. Do NOT apply the beginner score floor; score what actually happened. Still lead with what they did well and frame improvements as the next thing to try, but hold them to landing a specific, relevant reason for the meeting — a generic or purely scripted attempt should not score as if it booked.\n`
          : ''
      const scenarioContext = scenario
        ? `\nSCENARIO: ${scenario.title}\nRep goal: ${scenario.repGoal}\nDesired outcome: ${scenario.desiredOutcome}\n\nWINNING PATH (ground truth — base "should_have_said" rewrites on these ideal lines):\n${scenario.winningPathBeats
            .map((b) => `- ${b.beat} — ${b.goal}\n  Ideal: "${b.idealLine}"`)
            .join('\n')}\n\nSTRONG REP RESPONSES TO REWARD:\n${scenario.strongRepResponses
            .map((r) => `- "${r}"`)
            .join('\n')}\n`
        : ''

      // Framework-aware scoring
      const scoreCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert, supportive BDR coach evaluating a cold call. You coach on what actually works in a real conversation — NOT on whether the rep recited a script word-for-word.

${VBRICK_2026_CONTEXT}

THE FRAMEWORK IS A GUIDE, NOT A CHECKLIST. The ideal call flows:
1. Name confirmation: the prospect says a plain "Hello?", then the REP says the PROSPECT's first and last name back in an inquisitive tone (e.g., "Dana Whitfield?") and pauses for the prospect to confirm.
2. Self-introduction + help request: the rep introduces themselves and asks for a moment — close to "Great, this is [rep first name] with Vbrick. I was hoping you could help me out for a second." "name_captured" = TRUE if, near the top of the call, the rep EITHER said the prospect's name back to confirm it OR introduced themselves by name (with Vbrick). Be GENEROUS: accept any clearly-spoken personal name, ignore transcription typos/misspellings/hyphenation, do not require exact phrasing. When in doubt, TRUE.
3. Qualification: an "are you involved in / do you lead how your [company/agency] does X?" question (e.g., "are you involved in how your company delivers training or internal video?").
4. Reason for calling — YES → the rep leads with WHY they're calling, naming the key differentiator and why it matters to this buyer (e.g. "we're the only FedRAMP-certified enterprise video platform, and clients like you need that to unlock video + AI"); NO → a clean pivot to "who's the best person?" (no groveling "oh sorry!").
5. Close: a soft ask for a slightly longer follow-up — close to "Would you be open to scheduling a slightly longer conversation to explore this in more detail?" — or permission to name-drop a referral.

${accentContext}

SCORING RUBRIC — reward EFFECTIVENESS over script-matching:
- Call Effectiveness (35%): Did the rep move the call forward and earn the next step? Going OFF-SCRIPT IS NOT A PENALTY. If the rep deviated from the suggested wording but the deviation was effective or advanced the call, score it HIGH. Only mark a missed step down when skipping it actually hurt the call.
- Clarity & Delivery (20%): Were they clear and understandable (including despite any accent)? Score on what they actually said; never penalize the rep for a transcription error.
- Tonality (20%): Friendly, helpful, confident, human.
- Objection Handling (15%): Acknowledged pushback and turned it forward.
- Discovery & Next Step (10%): Asked something useful, qualified, and asked for a concrete next step.

HARD RULES ON FAIRNESS:
- NEVER tell the rep they "didn't say their name" if the transcript shows them stating a first+last name. When unsure, give the rep the benefit of the doubt.
- Do NOT deduct points for not matching the cheat-card wording. "script_improvements" are OPTIONAL polish suggestions, never the basis for a lower score.
- A confident, natural off-script line that gets a yes should outscore a robotic on-script recital.
${levelBlock}
WHAT-SHOULD-HAVE-BEEN-SAID COACHING (most important output):
- Set "would_transfer" to whether the rep earned the appointment/meeting/warm transfer this scenario was aiming for.
- If NOT earned: populate "inflection_points" with the 2-4 specific moments the meeting was lost. Quote what the rep actually said ("rep_said"), say in one concrete line WHY it lost AND what would have generated the appointment ("why_it_lost"), and give the VERBATIM line they should have said ("should_have_said"). Make every "should_have_said" a usable next move, grounded in the real Vbrick facts and the WINNING PATH below. Leave "what_sealed_it" empty.
- If earned: leave "inflection_points" empty and populate "what_sealed_it" with the 1-2 moves that won it.

CALIBRATING THE "should_have_said" REBUTTALS — land in the MIDDLE between a rep's natural phrasing and an overly-aggressive ask. Confident and specific about the next step, but natural enough that a real rep would actually say it and a real prospect would say yes.
- TOO AGGRESSIVE (never write like this): "Give me 20 minutes with your architecture team and I'll walk the controls live. When can that group meet?"
- TOO SOFT / vague (avoid): "Would it maybe be okay if we possibly set something up sometime?"
- JUST RIGHT (write like this): "I could send over a one-pager, but honestly I'd give you a lot more in a quick 20-minute call — would you be open to that?" / "Let's grab 15 minutes so I can show you this on your own setup — does later this week work?"
Write rebuttals in first person, warm and human, offering the meeting as an easy yes.

PERSONA CONTEXT:
${persona.name}, ${persona.title} at ${persona.company}
Personality: ${persona.personality}
${scenarioContext}`
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
                  name_captured: { type: 'boolean', description: 'TRUE if, near the top of the call, the rep EITHER said the prospect\'s name back to confirm it OR introduced themselves by name (with Vbrick). Accept any clearly-spoken personal name; ignore transcription typos. When in doubt, TRUE.' },
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
              transfer_confidence: { type: 'number', description: '0-100' },
              ...INFLECTION_SCHEMA_PROPERTIES
            },
            required: ['total_score', 'framework_score', 'dimensions', 'framework_analysis', 'key_strengths', 'improvements', 'inflection_points', 'what_sealed_it']
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

      const appointmentSecured =
        typeof scoringResult.appointment_secured === 'boolean'
          ? scoringResult.appointment_secured
          : Boolean(scoringResult.would_transfer)

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
        transferConfidence: scoringResult.transfer_confidence,
        appointmentSecured,
        inflectionPoints: mapInflectionPoints(scoringResult.inflection_points),
        whatSealedIt: Array.isArray(scoringResult.what_sealed_it) ? scoringResult.what_sealed_it : []
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
