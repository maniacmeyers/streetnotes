import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

// POST: Seed Story Vault with real Vbrick content from documentation
export async function POST() {
  const supabase = createAdminClient()

  const BDR_EMAILS = [
    'jeff@forgetime.ai',
    'dylan.fawsitt@vbrick.com',
    'kara.pryor@vbrick.com',
  ]

  // ──────────────────────────────────────────────
  // ELEVATOR PITCHES (3)
  // ──────────────────────────────────────────────
  const elevatorPitches = [
    {
      title: 'The Network Risk Pitch',
      draft_content: `Every quarter, companies like yours stream CEO town halls to thousands of employees worldwide. And every quarter, IT teams hold their breath hoping the network doesn't crash. Teams and Zoom weren't built for ten thousand concurrent viewers. They break.

Vbrick was built specifically for this. Our enterprise content delivery network offloads ninety percent of video traffic from your WAN, so your CEO's quarterly broadcast reaches every employee, every office, every time. No crashes. No complaints. No fire drills.

ERIE Insurance streams to six thousand employees and thirteen thousand agents across the country without a hiccup. If your next town hall matters, it needs infrastructure that won't let you down.`,
      scores: { framework: 9.0, clarity: 8.5, confidence: 8.8, pacing: 8.2, specificity: 9.0, brevity: 8.0 },
    },
    {
      title: 'The Security & Compliance Pitch',
      draft_content: `Here's something that keeps CIOs up at night: video content scattered across Teams recordings, Zoom clips, local drives, and shared folders. No encryption. No access controls. No audit trail. In regulated industries, that's not just messy. It's a compliance violation waiting to happen.

Vbrick is the only enterprise video platform with FedRAMP certification. SOC 2 Type II. GDPR compliance. End-to-end encryption with zero-trust architecture.

One of the world's largest payment processors chose us specifically because they needed video that met the same security standards as their financial data. Your compliance team will thank you.`,
      scores: { framework: 8.8, clarity: 9.0, confidence: 8.5, pacing: 8.0, specificity: 8.7, brevity: 8.5 },
    },
    {
      title: 'The Video Tsunami Pitch',
      draft_content: `Aragon Research calls it the video tsunami. Sixty-five percent of employees prefer video content. Hybrid work means global teams need on-demand training, onboarding, and communications. And your enterprise content management system was never built to handle it.

Vbrick centralizes all your video in one searchable, AI-enriched platform. Automatic transcription in ninety-plus languages. Smart search that finds concepts, not just keywords. AI summaries and chapters so nobody watches a sixty-minute recording to find the two minutes they need.

C.H. Robinson deployed this and hit a hundred fifty-two thousand video views in three months. The tsunami is coming. The question is whether you're ready.`,
      scores: { framework: 9.2, clarity: 8.8, confidence: 9.0, pacing: 8.5, specificity: 9.2, brevity: 7.8 },
    },
  ]

  // ──────────────────────────────────────────────
  // ABT CUSTOMER STORIES (3)
  // ──────────────────────────────────────────────
  const customerStories = [
    {
      title: 'C.H. Robinson + ServiceNow',
      draft_content: `C.H. Robinson is one of the world's largest logistics platforms. Fifteen thousand employees, ninety thousand customers, operations spanning the globe.

AND they were launching a new HR portal on ServiceNow Employee Center Pro to make information more accessible and drive self-service across the organization. They had video content that employees needed: training materials, how-to guides, policy walkthroughs.

BUT their existing video tools didn't integrate with ServiceNow. They tried linking to external video resources, which pulled users out of the portal, killed the experience, and gave them zero visibility into who watched what. On top of that, translating video content for their global workforce took weeks of coordination with external translation vendors.

THEREFORE they deployed Vbrick's enterprise video platform with native ServiceNow integration. The connector installed out of the box. They embedded curated video playlists directly in the portal workflows. And Vbrick's AI translation turned weeks of manual translation work into minutes.

Within three months, they hit a hundred fifty-two thousand video views, ten thousand unique viewers, and seventy-five percent of their global workforce engaged with the portal. ServiceNow even gave them special recognition for incorporating video. They're now projecting nine percent annual cost savings from consolidating their scattered video tools into Vbrick.`,
      scores: { framework: 9.5, clarity: 9.0, confidence: 8.8, pacing: 8.0, specificity: 9.5, brevity: 7.5 },
    },
    {
      title: 'Global Payment Services Provider',
      draft_content: `One of the world's largest payment services providers operates across dozens of countries with tens of thousands of employees.

AND they needed enterprise video that could handle three completely different use cases simultaneously: elite customer experiences, internal corporate communications, and a global training university. They were serving clients in eight languages across every time zone.

BUT consumer video tools couldn't meet their security requirements, couldn't scale to their audience sizes, and couldn't deliver the professional-grade production quality their brand demanded. They needed encryption at rest and in transit, fine-grained access controls, regulatory compliance auditing, and the ability to stream live to tens of thousands without a single dropped frame.

THEREFORE they deployed Vbrick's enterprise video platform across all three use cases. For their elite cardholders, they delivered immersive virtual coverage of an international sporting event with live streaming, three-sixty degree stadium tours, and interactive Q&A, all in eight languages. For internal comms, they built a full corporate TV channel reaching their global workforce. And they're now building a virtual university projected to generate tens of millions in new revenue from monetized training content.

Today they have seventeen thousand five hundred unique users on the platform every month, twenty-seven thousand six hundred streaming hours of live events monthly, and a video library approaching twenty thousand assets growing at twenty-seven percent.`,
      scores: { framework: 9.3, clarity: 8.5, confidence: 9.0, pacing: 7.8, specificity: 9.5, brevity: 7.0 },
    },
    {
      title: 'ERIE Insurance eCDN Story',
      draft_content: `ERIE Insurance has been around since nineteen twenty-five. Six thousand employees, thirteen thousand independent agents, offices spread across the eastern and midwestern United States.

AND they needed to connect all those branches and agents through video. Quarterly financial broadcasts, company updates, training sessions, all of it streaming live to multiple locations simultaneously.

BUT every time they tried to stream a major event, they risked crashing the corporate network. The bandwidth demands of live video to dozens of offices were immense. And when COVID hit, they went fully remote overnight, then hybrid, and the video demands only got bigger. They needed virtual employee engagement, town halls, even happy hours, and their infrastructure wasn't built for it.

THEREFORE they deployed Vbrick with its built-in enterprise content delivery network. The eCDN handled bandwidth distribution across all their locations so streaming didn't touch the corporate WAN. They integrated with Microsoft Teams for their hybrid workforce. And they expanded from internal-only events to public-facing content.

Their July twenty-twenty-one learning symposium streamed eight live events and ten pre-recorded sessions to agents and customers outside the company for the first time. As their IT administrator Steven Lucas put it: "We needed the ability to stream video without crashing our networks." That's exactly what Vbrick delivered.`,
      scores: { framework: 9.0, clarity: 9.2, confidence: 8.5, pacing: 8.3, specificity: 8.8, brevity: 7.5 },
    },
  ]

  // ──────────────────────────────────────────────
  // FEEL / FELT / FOUND OBJECTION HANDLING (5)
  // ──────────────────────────────────────────────
  const objectionHandling = [
    {
      title: '"We Already Use Teams/Zoom"',
      draft_content: `I completely understand that feeling. Teams and Zoom are great for meetings, and your people already know how to use them.

A lot of the companies we work with felt the same way. ERIE Insurance was running everything through Teams and felt like they had video covered. But then they tried streaming a quarterly financial broadcast to six thousand employees across dozens of offices simultaneously, and they realized there's a gap. Teams handles meetings. It wasn't built to handle ten thousand concurrent viewers without crashing the network.

What they found is that Vbrick sits on top of Teams, not instead of it. We actually integrate with Teams. But when you need to stream a CEO town hall to your entire global workforce, or manage a library of twenty thousand training videos with AI search, or meet FedRAMP compliance requirements, that's where Vbrick picks up where Teams leaves off. The world's largest payment processor runs Teams for their daily meetings and Vbrick for everything enterprise-scale.`,
      scores: { framework: 9.2, clarity: 9.0, confidence: 8.5, pacing: 8.2, specificity: 9.0, brevity: 7.5 },
    },
    {
      title: '"We Don\'t Have Budget"',
      draft_content: `That's a fair concern, and I hear it a lot. Nobody wants to add another line item.

Most of the IT leaders we talk to felt the same way initially. But here's what C.H. Robinson found when they actually ran the numbers. They had video tools scattered across departments. Separate subscriptions, separate contracts, no centralized management. When they consolidated everything into Vbrick, they projected nine percent annual cost savings. Not a new expense. A net reduction.

On top of that, they were spending weeks and significant money on external translation vendors for their global content. Vbrick's AI translation does the same thing in minutes, included in the platform. So the real question isn't whether you can afford another platform. It's whether you can afford to keep paying for five separate ones that don't talk to each other and don't meet your security requirements.`,
      scores: { framework: 8.8, clarity: 9.0, confidence: 8.8, pacing: 8.5, specificity: 9.0, brevity: 8.0 },
    },
    {
      title: '"IT Doesn\'t Have Bandwidth"',
      draft_content: `I hear you. IT teams are stretched thin, and the last thing anyone wants is a six-month implementation project.

That concern is exactly what C.H. Robinson's team raised. They were launching a new ServiceNow portal and had zero appetite for a complex integration.

What they found is that Vbrick's ServiceNow connector was self-installed and worked out of the box. Their HR technology analyst, Teresa Caravajal, specifically called out how refreshingly simple the setup was. They went from zero to forty-plus videos embedded in their portal without a heavy IT lift. And on the ongoing management side, Vbrick centralizes everything. Your IT team stops managing video across five different tools and manages it in one place. Less work, not more.`,
      scores: { framework: 8.5, clarity: 9.2, confidence: 8.0, pacing: 8.8, specificity: 9.0, brevity: 9.0 },
    },
    {
      title: '"Happy With Current Solution"',
      draft_content: `That makes sense, and I'm glad video is on your radar.

A lot of companies we work with felt the same way about their setup. But let me ask you this: when your CEO does a global town hall, does your current solution handle ten thousand concurrent viewers without impacting network performance? Can your compliance team pull audit logs showing exactly who watched required training content and when? Does it transcribe and translate in ninety-plus languages automatically?

The global payment services company we work with thought their solution was working fine too. Then they tried to deliver an immersive virtual event to five thousand elite customers across eight languages with live streaming, interactive Q&A, and three-sixty degree video, and they realized there was a ceiling. They're now doing twenty-seven thousand streaming hours a month on Vbrick. I'm not saying your current solution is bad. I'm saying there might be use cases you haven't been able to unlock yet because the platform wasn't built for it.`,
      scores: { framework: 8.7, clarity: 8.5, confidence: 9.0, pacing: 8.0, specificity: 9.2, brevity: 7.8 },
    },
    {
      title: '"Can\'t We Just Use YouTube?"',
      draft_content: `Totally get it. YouTube and Vimeo are familiar, and for external marketing content, they can work.

But here's the thing. C.H. Robinson's HR technology analyst, Teresa Caravajal, said it best: "Unlike consumer-grade options like YouTube or Vimeo, Vbrick keeps content within the enterprise ecosystem, and that's a major win for security and branding."

When you put HIPAA training on YouTube, even unlisted, you've lost control. No encryption at rest, no granular access permissions, no compliance audit trail. You can't prove who watched it or when. And Vimeo doesn't integrate with ServiceNow, doesn't have an enterprise CDN for bandwidth management, doesn't offer FedRAMP certification.

Regulated industries -- healthcare, financial services, government -- they can't use consumer tools for internal video. That's not a preference. It's a compliance requirement. Vbrick was built specifically for that gap.`,
      scores: { framework: 9.0, clarity: 9.2, confidence: 8.8, pacing: 8.5, specificity: 9.5, brevity: 8.0 },
    },
  ]

  // ──────────────────────────────────────────────
  // SCORE WEIGHTS (same as story-types.ts)
  // ──────────────────────────────────────────────
  const SCORE_WEIGHTS = {
    framework: 0.25,
    clarity: 0.20,
    confidence: 0.20,
    pacing: 0.15,
    specificity: 0.10,
    brevity: 0.10,
  }

  function calcComposite(s: { framework: number; clarity: number; confidence: number; pacing: number; specificity: number; brevity: number }) {
    return Number((
      s.framework * SCORE_WEIGHTS.framework +
      s.clarity * SCORE_WEIGHTS.clarity +
      s.confidence * SCORE_WEIGHTS.confidence +
      s.pacing * SCORE_WEIGHTS.pacing +
      s.specificity * SCORE_WEIGHTS.specificity +
      s.brevity * SCORE_WEIGHTS.brevity
    ).toFixed(1))
  }

  // Assign stories to BDRs for variety
  // Jeff gets elevator pitches, Dylan gets customer stories, Kara gets objection handling
  // But ALL are shared_to_team = true so everyone sees them
  const allStories: Array<{
    bdr_email: string
    story_type: string
    title: string
    draft_content: string
    scores: { framework: number; clarity: number; confidence: number; pacing: number; specificity: number; brevity: number }
  }> = [
    ...elevatorPitches.map((s) => ({ bdr_email: BDR_EMAILS[0], story_type: 'elevator_pitch', ...s })),
    ...customerStories.map((s) => ({ bdr_email: BDR_EMAILS[1], story_type: 'abt_customer_story', ...s })),
    ...objectionHandling.map((s) => ({ bdr_email: BDR_EMAILS[2], story_type: 'feel_felt_found', ...s })),
  ]

  const results: string[] = []

  for (const story of allStories) {
    const composite = calcComposite(story.scores)

    // 1. Create draft
    const { data: draft, error: draftErr } = await supabase
      .from('story_drafts')
      .insert({
        bdr_email: story.bdr_email,
        story_type: story.story_type,
        title: story.title,
        draft_content: story.draft_content,
        ai_conversation: [],
        framework_metadata: {},
        status: 'completed',
      })
      .select()
      .single()

    if (draftErr || !draft) {
      results.push(`DRAFT ERROR (${story.title}): ${draftErr?.message}`)
      continue
    }

    // 2. Create practice session
    const { data: session, error: sessionErr } = await supabase
      .from('story_practice_sessions')
      .insert({
        story_draft_id: draft.id,
        bdr_email: story.bdr_email,
        transcript: story.draft_content,
        duration_seconds: Math.round(story.draft_content.length / 15), // ~15 chars per second spoken
        score_framework: story.scores.framework,
        score_clarity: story.scores.clarity,
        score_confidence: story.scores.confidence,
        score_pacing: story.scores.pacing,
        score_specificity: story.scores.specificity,
        score_brevity: story.scores.brevity,
        composite_score: composite,
        improvement_notes: {},
        coaching_note: 'Strong delivery. Based on real Vbrick case studies and documentation.',
      })
      .select()
      .single()

    if (sessionErr || !session) {
      results.push(`SESSION ERROR (${story.title}): ${sessionErr?.message}`)
      continue
    }

    // 3. Check if a personal best already exists for this email + story_type
    const { data: existing } = await supabase
      .from('story_vault_entries')
      .select('id, composite_score')
      .eq('bdr_email', story.bdr_email)
      .eq('story_type', story.story_type)
      .eq('is_personal_best', true)
      .single()

    let isPersonalBest = true
    if (existing && existing.composite_score >= composite) {
      isPersonalBest = false
    } else if (existing) {
      // Demote old PB
      await supabase
        .from('story_vault_entries')
        .update({ is_personal_best: false })
        .eq('id', existing.id)
    }

    // 4. Create vault entry
    const { error: vaultErr } = await supabase
      .from('story_vault_entries')
      .insert({
        practice_session_id: session.id,
        story_draft_id: draft.id,
        bdr_email: story.bdr_email,
        story_type: story.story_type,
        title: story.title,
        transcript: story.draft_content,
        composite_score: composite,
        is_personal_best: isPersonalBest,
        shared_to_team: true,
      })

    if (vaultErr) {
      results.push(`VAULT ERROR (${story.title}): ${vaultErr.message}`)
    } else {
      results.push(`OK: ${story.title} (${story.bdr_email}) - score ${composite}`)
    }
  }

  return NextResponse.json({ seeded: results.length, results })
}
