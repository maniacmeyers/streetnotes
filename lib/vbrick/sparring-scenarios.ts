import type { PersonaId } from './sparring-personas'

export type BDRAccent = 'irish' | 'newZealand' | 'general'

export interface ScenarioScriptStep {
  label: string
  hint: string
}

/** A decisive moment a great call hits, with the exact line that wins it. */
export interface WinningPathBeat {
  /** Short beat name, e.g. "Opener / hook", "Objection turn", "Close". */
  beat: string
  /** What this beat needs to accomplish. */
  goal: string
  /** The verbatim ideal line — grounded in real Vbrick facts. */
  idealLine: string
}

export interface SparringScenario {
  id: string
  title: string
  subtitle: string
  estimatedMinutes: number
  defaultPersonaId: PersonaId
  defaultAccent: BDRAccent
  scenarioContext: string
  hardModeContext: string
  cheatCard: ScenarioScriptStep[]
  /** 1-10 difficulty rating. */
  difficultyScore: number
  /** Short reason this prospect is a good Vbrick fit. */
  whyVbrickFits: string
  /** What the rep is trying to accomplish on this call. */
  repGoal: string
  /** The desired outcome of the call (usually a booked meeting / warm transfer). */
  desiredOutcome: string
  /** The first sentence after "Ok, cool. I'm calling because..." — keeps the rep primed. */
  openingContinuation: string
  /** One-line tone descriptor for the prospect. */
  prospectTone: string
  /** Realistic prospect responses / pushbacks. */
  likelyProspectResponses: string[]
  /** Strong rep responses to practice — grounded in real Vbrick differentiators. */
  strongRepResponses: string[]
  /** Weak responses to avoid. */
  weakRepResponses: string[]
  /** Coaching takeaway — what the rep should learn. */
  coachingNote: string
  /** Top mistakes new BDRs make in this scenario. */
  topMistakes: string[]
  /** Top things a great BDR does well. */
  topWinMoves: string[]
  /** Ordered decisive moments + the ideal line — ground truth for the coach. */
  winningPathBeats: WinningPathBeat[]
  /**
   * Sparring track. 'easy' = beginner-friendly Government / Financial-Services
   * accounts (encouraging coaching). Undefined or 'hard' = the original, tougher
   * scenarios. Existing scenarios are untagged and therefore Hard.
   */
  track?: 'easy' | 'hard'
}

export const SPARRING_SCENARIOS: Record<string, SparringScenario> = {
  'ai-make-video-searchable': {
    id: 'ai-make-video-searchable',
    scenarioContext: `CALL CONTEXT:
You are an innovation/knowledge owner at a large enterprise. Your company has years of recorded town halls, trainings, and webinars sitting in scattered folders that nobody can search — the knowledge just rots. You are genuinely curious about AI, but the second a vendor's AI touches your data you get cautious, because security would have to bless anything.
The BDR is calling from Vbrick. They will pitch Vbrick AI — making all that video searchable. Let them raise it; react honestly based on your personality. Naturally surface the "does your AI train on our data?" concern at some point.`,
    hardModeContext: `HARD MODE MODIFIERS:
You've been pitched a dozen "AI for video" tools this quarter and most were vapor. You demand specifics: how it actually finds a moment in a 90-minute video, and exactly what happens to your data. Vague answers ("it's powerful," "I'd have to check") end the call within 30 seconds.`,
    title: 'Vbrick AI — Make Your Video Searchable',
    subtitle:
      'Flagship AI pitch. They have thousands of videos nobody can find. Sell Vbrick AI — and handle the "does your AI train on our data?" objection.',
    estimatedMinutes: 4,
    defaultPersonaId: 'enthusiastic-innovator',
    defaultAccent: 'general',
    difficultyScore: 4,
    whyVbrickFits:
      'Vbrick AI runs on AWS Bedrock with RAG, is multimodal (reads what is said AND shown), auto-generates titles/summaries/chapters/tags, does semantic Smart Search, and transcribes/translates in 100+ languages — without ever training on customer data.',
    repGoal:
      'Book a 20-minute working session to demo Smart Search and the Interactive Video Assistant against a slice of their real library.',
    desiredOutcome: 'A scheduled demo focused on their own video content.',
    openingContinuation:
      "We're hearing from teams sitting on thousands of recorded town halls and trainings that nobody can actually find anything in — so it just rots. Is that a fair description of your video library?",
    prospectTone: 'Curious and AI-forward, but will get cautious the second data security comes up.',
    likelyProspectResponses: [
      "Oh interesting — yeah, we've got years of recordings nobody watches.",
      "Wait, does your AI train on our videos? That's a hard no for us.",
      "We already get transcripts from Teams, what's different?",
      "How is this different from just throwing it in a Copilot?",
      "Can it actually find a moment inside a 90-minute video?",
      "Sounds cool but I'd need security to bless anything AI.",
    ],
    strongRepResponses: [
      "Great question, and it's the first thing our security buyers ask: Vbrick AI runs on AWS Bedrock with retrieval-augmented generation, and it never trains on your content. Your video stays yours.",
      "Teams gives you a transcript of what was said. Vbrick is multimodal — it reads what's on the screen too, so it can find the slide, the demo, the moment, not just the words.",
      "Smart Search is semantic — type 'what did we say about the Q3 pricing change' and it jumps you to the 47-second clip inside the 90-minute all-hands.",
      "It auto-writes the title, summary, chapters, and tags so your team stops hand-tagging video — and it does it in 100+ languages.",
    ],
    weakRepResponses: [
      "Yeah our AI is really powerful, it does everything.",
      "I'm not totally sure how the data part works, I'd have to check.",
      "It's basically like ChatGPT but for your videos.",
    ],
    coachingNote:
      "On an AI pitch the deal is won or lost on trust, not features. Lead with the capability, but the moment 'does it train on our data' comes up, answer it cleanly and specifically (Bedrock, RAG, never trains on your data) — vagueness here kills the meeting.",
    topMistakes: [
      "Feature-dumping every AI capability instead of anchoring on their unfindable-library pain.",
      "Fumbling the 'does it train on our data' question with 'I think so' / 'let me check'.",
      "Letting it stay abstract — never grounding it in their actual content.",
    ],
    topWinMoves: [
      "Naming the pain first (dead, unsearchable library) before any feature.",
      "Answering the data-safety objection crisply: Bedrock + RAG + never trains on your data.",
      "Offering to run Smart Search against THEIR library in the demo, not a canned one.",
    ],
    winningPathBeats: [
      {
        beat: 'Opener / hook',
        goal: 'Earn 30 seconds by naming a pain they feel daily, not pitching AI.',
        idealLine:
          "I'll be quick — we're talking to teams sitting on years of town halls and trainings that nobody can search, so the knowledge just rots. Sound familiar?",
      },
      {
        beat: 'Data-safety objection turn',
        goal: 'Convert the security fear into a differentiator on the spot.',
        idealLine:
          "Totally fair — Vbrick AI runs on AWS Bedrock with RAG and never trains on your content. That's exactly why regulated customers pick us over consumer AI tools.",
      },
      {
        beat: 'Proof / specificity',
        goal: 'Make the capability concrete and believable.',
        idealLine:
          "Semantic Smart Search finds the 47-second clip inside a 90-minute video, and it auto-writes summaries and chapters in 100+ languages — no manual tagging.",
      },
      {
        beat: 'Close',
        goal: 'Book a demo against their real content.',
        idealLine:
          "Give me 20 minutes and a sample of your own library and I'll show you Smart Search on your actual videos. Does Thursday or Friday work better?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great, [first name], I was hoping you could help me out for a moment."' },
      { label: '3. Qualification', hint: '"Are you involved in how your company manages or gets value out of its internal video?"' },
      { label: '4. Value prop', hint: '"Cool. We\'re hearing teams have years of video nobody can search — Vbrick AI makes all of it findable. Is that a problem you have?"' },
      { label: '5. Handle data objection', hint: 'If they ask about training on data: "Runs on AWS Bedrock with RAG, never trains on your content."' },
      { label: '6. Soft close', hint: '"Worth 20 minutes to see Smart Search run against your own library?"' },
    ],
  },

  'we-already-have-teams': {
    id: 'we-already-have-teams',
    scenarioContext: `CALL CONTEXT:
You own the digital workplace at a Microsoft-standardized enterprise. Your reflex to any video pitch is "we already have Teams and Stream, we're good." You are loyal to Microsoft and skeptical of paying for another tool. You have, however, quietly noticed buffering complaints after big all-hands.
The BDR is calling from Vbrick. Lead with the Teams brush-off. Only soften if they hit you with a specific, verifiable Microsoft limitation rather than a counter-pitch.`,
    hardModeContext: `HARD MODE MODIFIERS:
IT already "standardized on Microsoft" and you treat that as settled. You push back hard on anything that sounds like rip-and-replace. You will only stay on the line if the rep clearly positions Vbrick as enhancing Teams AND cites a real limit (the ~20K town-hall cap, eCDN gated behind Teams Premium, the bandwidth math).`,
    title: 'Objection — "We Already Have Microsoft Teams/Stream"',
    subtitle:
      'The flagship objection. Counter Microsoft with facts: the 20K town-hall cap, eCDN gated behind Teams Premium, and the bandwidth math.',
    estimatedMinutes: 4,
    defaultPersonaId: 'digital-workplace-manager',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'Teams/Stream stores meeting recordings; it does not govern, search, or webcast at true scale. Vbrick enhances Teams (certified town-hall eCDN integration) and adds a governed, searchable, FedRAMP-certified library on top.',
    repGoal:
      'Get past the brush-off and book a 15-minute call to map their largest live event against Teams’ real limits.',
    desiredOutcome: 'A scheduled call with the person who owns all-hands or network delivery.',
    openingContinuation:
      "Totally — most of our customers had Teams when we met them. Quick question: when you run a company-wide all-hands, how many people are on it live?",
    prospectTone: 'Dismissive and Microsoft-loyal; needs a factual jolt, not a counter-pitch.',
    likelyProspectResponses: [
      "We're a Microsoft shop. We already have Teams and Stream, we're good.",
      "Why would I pay for another video tool?",
      "Stream does recordings and transcripts already.",
      "We've never had a problem with Teams live events.",
      "IT already standardized on Microsoft, that ship sailed.",
      "If Teams can't do it, we'll just wait for Microsoft to add it.",
    ],
    strongRepResponses: [
      "Makes sense — and we're not a Teams replacement, we make Teams better. Quick one though: are you on Teams Premium? Because the eCDN that keeps your network from melting during a live all-hands is gated behind it.",
      "Teams town halls cap at about 20,000 attendees. If you ever go bigger than that, or run a lot of regional events at once, that's the wall we get called about.",
      "Without an eCDN you're pushing roughly 2 Mbps per viewer per site — that's what takes down the office network on all-hands day. Have you seen buffering complaints after big broadcasts?",
      "Stream is great for storing meeting recordings. It doesn't govern retention, it isn't FedRAMP-certified, and it can't webcast at scale — that's the gap, not the recordings.",
    ],
    weakRepResponses: [
      "Vbrick is way better than Teams, honestly.",
      "Teams is kind of a toy for real video.",
      "Okay, well, if you ever want to talk let me know.",
    ],
    coachingNote:
      "Never argue Vbrick-vs-Teams head on — you'll lose to incumbency. Reframe as 'we make Teams better,' then drop ONE specific Microsoft limitation (20K cap, eCDN behind Premium, 2 Mbps math) and turn it into a discovery question. Facts disarm loyalty; opinions harden it.",
    topMistakes: [
      "Trying to beat Teams instead of complementing it.",
      "Conceding the brush-off ('okay, no problem') and ending the call.",
      "Quoting a feature war instead of one sharp, verifiable Microsoft limit.",
    ],
    topWinMoves: [
      "'We make Teams better' reframe that lowers the defenses.",
      "Dropping the 20K cap / eCDN-behind-Premium fact as a question, not a lecture.",
      "Tying the bandwidth math to a pain they've actually felt (buffering on all-hands day).",
    ],
    winningPathBeats: [
      {
        beat: 'Reframe the objection',
        goal: 'Remove the "rip and replace Microsoft" fear immediately.',
        idealLine:
          "Good — we're not here to replace Teams, most of our customers run both. We make Teams better at the one thing it struggles with: scale.",
      },
      {
        beat: 'The factual jolt',
        goal: 'Introduce doubt with one verifiable Microsoft limit.',
        idealLine:
          "Are you on Teams Premium? The eCDN that keeps your network from choking on a live all-hands is gated behind it — and town halls cap at about 20,000.",
      },
      {
        beat: 'Tie to felt pain',
        goal: 'Make the limit personal with a discovery question.',
        idealLine:
          "Without an eCDN it's ~2 Mbps per viewer per site — that's what buffers the network on all-hands day. Have you gotten those complaints?",
      },
      {
        beat: 'Close',
        goal: 'Book a working session on their biggest event.',
        idealLine:
          "Let's spend 15 minutes mapping your biggest live event against where Teams taps out — worst case you confirm you're fine. Thursday work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great, [first name], hoping you could help me out for a sec."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for internal communications or live video events?"' },
      { label: '4. Reframe', hint: '"We\'re not a Teams replacement — we make Teams better at scale."' },
      { label: '5. The fact', hint: '"Are you on Teams Premium? eCDN is gated behind it, town halls cap ~20K."' },
      { label: '6. Soft close', hint: '"Worth 15 minutes to map your biggest event against Teams’ limits?"' },
    ],
  },

  'townhall-network-meltdown': {
    id: 'townhall-network-meltdown',
    scenarioContext: `CALL CONTEXT:
You run internal communications and own the company all-hands. Your last big live town hall buffered for half the building and you caught the blame, even though it's really a network problem. You own the message, not the plumbing, so your instinct is to punt anything technical to IT.
The BDR is calling from Vbrick about all-hands that don't take down the network. React honestly; you may try to hand them off to IT.`,
    hardModeContext: `HARD MODE MODIFIERS:
You're harried and protective of your time, and you've already "solved" buffering by telling people to lower their video quality. You'll only engage if the rep refuses to let you punt entirely to IT and instead offers to bring IT into the conversation with you.`,
    title: 'Town Hall That Melted the Network',
    subtitle:
      'Internal comms owns the all-hands. The network buckles when everyone tunes in live. Sell the eCDN — three modalities from one vendor.',
    estimatedMinutes: 3,
    defaultPersonaId: 'internal-comms-director',
    defaultAccent: 'general',
    difficultyScore: 4,
    whyVbrickFits:
      'Vbrick is the market’s sole provider of three eCDN technologies — peer-to-peer, edge caching, and multicast — from one vendor, and broadcasts studio-quality live events to tens of thousands without choking the corporate network.',
    repGoal: 'Book a 15-minute call with whoever owns the network + the next all-hands.',
    desiredOutcome: 'A scheduled scoping call, ideally with IT/network in the room.',
    openingContinuation:
      "We help comms teams run all-hands that don't take down the office wifi. When you go live company-wide, does the video hold up — or do you get the buffering complaints?",
    prospectTone: 'Friendly but harried; owns the message, not the plumbing — may punt to IT.',
    likelyProspectResponses: [
      "Honestly? The last all-hands buffered for half the building.",
      "That's really an IT thing, not me.",
      "We just tell people to dial down their video quality.",
      "We lowered the resolution and it mostly works now.",
      "We use Teams/Zoom for it, it's fine-ish.",
      "What even is an eCDN?",
    ],
    strongRepResponses: [
      "That buffering is a bandwidth problem, not a video-quality problem — an eCDN fixes it so you stop asking people to degrade their own experience.",
      "You own the message; we make sure the message actually arrives. I can bring IT into a 15-minute call so it's not all on you.",
      "Vbrick is the only vendor that gives you all three delivery methods — peer-to-peer, edge caching, and multicast — so it adapts to whatever your network looks like.",
      "An eCDN is the layer that keeps one live stream from being downloaded 10,000 separate times across your offices. It's the difference between a smooth all-hands and a help-desk flood.",
    ],
    weakRepResponses: [
      "You should really upgrade your whole network.",
      "Just send me to IT then.",
      "Our video quality is amazing, that's the main thing.",
    ],
    coachingNote:
      "Comms owns the outcome (a great all-hands) but not the infrastructure. Don't punt to IT and lose control — offer to bring IT into the meeting. Translate 'eCDN' into their language: it's the reason the broadcast doesn't buffer, full stop.",
    topMistakes: [
      "Letting 'that's IT's job' end the call instead of offering to convene IT.",
      "Talking about video quality when the pain is network bandwidth.",
      "Using 'eCDN' without translating it into 'why your all-hands buffers'.",
    ],
    topWinMoves: [
      "Reframing buffering as bandwidth, not resolution.",
      "Offering to pull IT into the meeting so comms isn't carrying it alone.",
      "Naming the three-modality eCDN as the one-vendor advantage.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on the felt pain',
        goal: 'Lead with the buffering memory, not the product.',
        idealLine:
          "Quick one — when you go live for a company all-hands, does the stream hold up, or do you get the buffering complaints afterward?",
      },
      {
        beat: 'Reframe quality vs bandwidth',
        goal: 'Stop them from blaming the wrong thing.',
        idealLine:
          "That's bandwidth, not video quality — an eCDN means you stop telling people to lower their resolution just to survive the broadcast.",
      },
      {
        beat: "Don't lose control to IT",
        goal: 'Keep the deal alive when they punt to IT.',
        idealLine:
          "You own whether the all-hands lands — let me bring your IT/network person into a 15-minute call so it's not all on your plate.",
      },
      {
        beat: 'Close',
        goal: 'Book the scoping call.',
        idealLine:
          "When's your next big all-hands? Let's scope it before then — 15 minutes, you and IT. Does next week work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great, [first name], hoping you can help me out quickly."' },
      { label: '3. Qualification', hint: '"Are you on the team that runs your company’s all-hands or town halls?"' },
      { label: '4. Value prop', hint: '"We help comms run all-hands that don’t buffer the building. Does your video hold up live?"' },
      { label: '5. Convene IT', hint: 'If punted to IT: "Let me bring them into a 15-min call with you."' },
      { label: '6. Soft close', hint: '"When’s your next all-hands? Let’s scope it first."' },
    ],
  },

  'building-video-library': {
    id: 'building-video-library',
    scenarioContext: `CALL CONTEXT:
You lead L&D / knowledge at a large healthcare org and you actually WANT this. Your training and comms video is scattered across SharePoint, Teams, and three shared drives, and you have a mandate to build a real, governed, searchable video library — but you don't know where to start. Compliance wants retention rules and role-based access.
The BDR is calling from Vbrick. This is a warm, high-intent call: be motivated and open. Volunteer your pain. Push back only on practicality (timeline, governance, permissions, branding).`,
    hardModeContext: `HARD MODE MODIFIERS:
You're enthusiastic but stretched thin and have been burned by tools that overpromised. You need to believe the rep is a guide who will actually help you design the structure — not just sell you storage. Press on retention, permissions, and how long it really takes to stand up.`,
    title: 'Building a Video Library (Warm)',
    subtitle:
      'Higher-intent call: they actually want help standing up a governed, searchable internal video library. Lead with the CMS + governance, let AI assist.',
    estimatedMinutes: 4,
    defaultPersonaId: 'ld-director-healthcare',
    defaultAccent: 'general',
    difficultyScore: 3,
    whyVbrickFits:
      'Vbrick Rev is a full video CMS: a custom-branded portal, channels/categories/playlists, fine-grained permissions, approval workflows, retention/expiration governance, and AI that auto-organizes and makes everything searchable.',
    repGoal: 'Book a 30-minute scoping/demo session to design their library structure and governance.',
    desiredOutcome: 'A scheduled scoping call to plan the library build.',
    openingContinuation:
      "I heard you're trying to get your training and comms video into one organized place. Where's it all living right now — Teams, SharePoint, a shared drive?",
    prospectTone: 'Warm and motivated; has a mandate but is overwhelmed by where to start.',
    likelyProspectResponses: [
      "Yes! It's scattered across SharePoint, Teams, and three shared drives. It's a mess.",
      "We want a real training portal but I don't know where to start.",
      "Compliance wants retention rules on our videos, can you do that?",
      "Can people only see the videos they're allowed to?",
      "How long does something like this take to stand up?",
      "We need it branded so it doesn't look like YouTube.",
    ],
    strongRepResponses: [
      "That scatter is exactly what Rev fixes — one branded portal with channels and playlists, so training lives in one searchable place instead of three drives.",
      "Yes — you set retention and expiration rules and approval workflows, so compliance gets governance baked in, not bolted on.",
      "Permissions are fine-grained: people only see what their role allows. Clinicians see clinical, HR sees HR.",
      "And the AI does the boring part — auto-titles, summaries, chapters, and tags — so your team isn't hand-organizing hundreds of videos.",
    ],
    weakRepResponses: [
      "Yeah we can store videos, sure.",
      "It's basically a YouTube for your company.",
      "We can probably do retention, I'd have to confirm.",
    ],
    coachingNote:
      "This is a warm, high-intent call — the risk is under-selling, not over-pushing. They want a guide. Ask where video lives today, then map Rev's CMS + governance to their mandate. Don't lead with AI here; lead with structure and control, let AI be the bonus.",
    topMistakes: [
      "Treating a warm buyer like a cold one and over-qualifying.",
      "Reducing a CMS + governance platform to 'video storage'.",
      "Leading with AI when they asked for organization and control.",
    ],
    topWinMoves: [
      "Diagnosing where video lives today before prescribing.",
      "Mapping governance (retention, permissions, approvals) directly to their compliance mandate.",
      "Positioning yourself as the guide who'll design the structure with them.",
    ],
    winningPathBeats: [
      {
        beat: 'Diagnose current state',
        goal: 'Anchor on their actual scatter before pitching.',
        idealLine:
          "Before I pitch anything — where does your training and comms video live today? Teams, SharePoint, shared drives?",
      },
      {
        beat: 'Map CMS to the mandate',
        goal: 'Show one organized, branded, governed home.',
        idealLine:
          "Rev gives you one branded portal with channels and playlists, plus retention rules and role-based permissions — so it's organized and compliant by default.",
      },
      {
        beat: 'AI as the bonus',
        goal: 'Sweeten without overshadowing structure.',
        idealLine:
          "And the AI auto-tags, summarizes, and chapters everything, so it's searchable from day one without your team hand-organizing it.",
      },
      {
        beat: 'Close',
        goal: 'Book a scoping/design session.',
        idealLine:
          "Let's do 30 minutes to sketch your channel structure and governance rules — I'll come with a starting blueprint. What's your week look like?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great, [first name], hoping you can help me out for a moment."' },
      { label: '3. Qualification', hint: '"Are you the person driving the video library / training portal project?"' },
      { label: '4. Diagnose', hint: '"Where does your video live today?" Listen before pitching.' },
      { label: '5. Map value', hint: 'Portal + governance + permissions; AI auto-organizes.' },
      { label: '6. Soft close', hint: '"Worth 30 minutes to design the structure together?"' },
    ],
  },

  'fedramp-regulated-governance': {
    id: 'fedramp-regulated-governance',
    scenarioContext: `CALL CONTEXT:
You are a security/compliance gatekeeper at a regulated enterprise (finance/healthcare/gov). You screen every vendor hard and you cannot put video into anything that isn't certified. You're suspicious, time-protective, and allergic to "we're very secure" fluff — you respect specific certifications and controls.
The BDR is calling from Vbrick. Give them about 30 seconds. Only stay on if they lead with hard, verifiable security claims.`,
    hardModeContext: `HARD MODE MODIFIERS:
You already have a video tool that "passed security," so the rep has to differentiate. You'll try to deflect with "send me a whitepaper." You only convert to a meeting if the rep leads with FedRAMP, stacks specific controls, and exposes the gap between a real FedRAMP authorization and a mere SOC 2 report.`,
    title: 'FedRAMP / Regulated Governance',
    subtitle:
      'Security screens every vendor. Win on the one claim competitors can’t match: the only FedRAMP-certified enterprise video platform AND eCDN.',
    estimatedMinutes: 4,
    defaultPersonaId: 'skeptical-security-officer',
    defaultAccent: 'general',
    difficultyScore: 6,
    whyVbrickFits:
      'Vbrick is the industry’s only FedRAMP-certified EVP and the only FedRAMP-certified eCDN — plus SOC 2 Type II, GDPR, encryption at rest and in transit, and multi-layered role-based access control.',
    repGoal: 'Earn a technical/security review meeting by leading with certifications, not features.',
    desiredOutcome: 'A scheduled security/architecture review.',
    openingContinuation:
      "I'll keep this short because I know you screen vendors hard — we're the only enterprise video platform that's FedRAMP-certified, and the only FedRAMP-certified eCDN. Is video security something on your radar right now?",
    prospectTone: 'Suspicious, time-protective, allergic to fluff; respects specifics and certifications.',
    likelyProspectResponses: [
      "I screen every vendor call. You've got 30 seconds.",
      "Everybody says they're secure. Prove it.",
      "We can't put video in anything that isn't certified.",
      "What's your data residency and encryption story?",
      "We already have a video tool that 'passed' security.",
      "Send me a security whitepaper and I'll look at it. Maybe.",
    ],
    strongRepResponses: [
      "Fair — so here's the 30 seconds: we're the only EVP with FedRAMP certification, and the only FedRAMP-certified eCDN on the market. That's not marketing, it's the authorization.",
      "SOC 2 Type II, GDPR, encryption at rest and in transit, multi-layered RBAC — and our AI runs on AWS Bedrock and never trains on your data.",
      "Did the tool that 'passed' actually carry FedRAMP, or just a SOC 2 report? Because in regulated buys that distinction is usually the whole decision.",
      "I could send a whitepaper, but honestly I'd give you a lot more in a quick 20 minutes with your architecture team — would you be open to that?",
    ],
    weakRepResponses: [
      "Oh we're super secure, don't worry about it.",
      "I think we have most of the certs, I can check.",
      "Sure, I'll just email you a brochure.",
    ],
    coachingNote:
      "With a security buyer, certifications ARE the pitch. Open with FedRAMP — it's the one claim no competitor can match — and never overstate. The fastest way to lose this persona is a vague 'we're secure.' Trade the whitepaper brush-off for a live technical review.",
    topMistakes: [
      "Opening with features instead of the FedRAMP certification.",
      "Saying 'we're very secure' without naming specific certifications.",
      "Accepting 'send a whitepaper' as the outcome instead of a review meeting.",
    ],
    topWinMoves: [
      "Leading with FedRAMP (EVP + eCDN) in the first breath.",
      "Stacking specific, verifiable controls (SOC 2 Type II, encryption, RBAC, Bedrock).",
      "Exposing the SOC-2-vs-FedRAMP gap in their incumbent.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on the unbeatable claim',
        goal: 'Buy credibility in the first sentence.',
        idealLine:
          "Thirty seconds: Vbrick is the only enterprise video platform that's FedRAMP-certified, and the only FedRAMP-certified eCDN on the market.",
      },
      {
        beat: 'Stack specifics',
        goal: 'Prove depth, not slogans.',
        idealLine:
          "SOC 2 Type II, GDPR, encryption at rest and in transit, multi-layered RBAC, and AI on AWS Bedrock that never trains on your data.",
      },
      {
        beat: 'Undermine the incumbent',
        goal: 'Open a gap with a sharp question.',
        idealLine:
          "Quick check — does your current tool actually hold FedRAMP, or just a SOC 2 report? In regulated buys that's usually the whole call.",
      },
      {
        beat: 'Close to a review',
        goal: 'Beat the whitepaper brush-off.',
        idealLine:
          "I could send a whitepaper, but honestly I'd give you a lot more in a quick 20-minute call where I walk your architecture team through the controls — would you be open to that?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"I’ll be quick — hoping you can point me in the right direction."' },
      { label: '3. Qualification', hint: '"Are you the person who vets video/streaming tools for security?"' },
      { label: '4. Lead with FedRAMP', hint: '"Only FedRAMP-certified EVP and the only FedRAMP-certified eCDN."' },
      { label: '5. Stack controls', hint: 'SOC 2 Type II, GDPR, encryption, RBAC, Bedrock no-train.' },
      { label: '6. Soft close', hint: '"20 minutes with your architecture team to walk the controls?"' },
    ],
  },

  'c2pa-content-authenticity': {
    id: 'c2pa-content-authenticity',
    scenarioContext: `CALL CONTEXT:
You sit in legal/compliance at a large enterprise. Deepfakes and content authenticity feel like a "next year" problem to you, and your first instinct is that this is IT's or security's issue, not legal's. You're precise, risk-averse, and skeptical of hype, but you perk up at concrete liability framing.
The BDR is calling from Vbrick about proving executive video is real (C2PA). Make them earn it by translating the jargon and making the risk concrete and ownable by legal + comms.`,
    hardModeContext: `HARD MODE MODIFIERS:
You've never had an incident, so "why spend on it?" is your default. You'll demand to know what C2PA actually means in practice and whether it would hold up if something went to court. Fear-mongering loses you instantly; a concrete, ownable risk frame keeps you on.`,
    title: 'C2PA — Content Authenticity in the AI Era',
    subtitle:
      'Brand-new angle (Feb 2026). Deepfakes make video provenance a board-level risk. Sell the first and only C2PA-conformant EVP.',
    estimatedMinutes: 4,
    defaultPersonaId: 'compliance-heavy-legal',
    defaultAccent: 'general',
    difficultyScore: 6,
    whyVbrickFits:
      'Vbrick became the first enterprise video platform to achieve C2PA conformance (Feb 2026) — an official Content Credentials Generator that gives tamper-evident proof of a video’s origin and flags AI-generated elements.',
    repGoal: 'Book a 20-minute call with legal/compliance + comms on executive video authenticity.',
    desiredOutcome: 'A scheduled risk/compliance briefing.',
    openingContinuation:
      "We're calling legal and comms teams about something new: deepfakes of executives are getting good enough to move markets, and we're the first video platform that can cryptographically prove a CEO video is real. Is content authenticity something your team has started worrying about?",
    prospectTone: 'Precise, risk-averse, skeptical of hype; perks up at concrete liability framing.',
    likelyProspectResponses: [
      "Deepfakes feel like a problem for next year, not now.",
      "Isn't that more of a security or IT issue than legal?",
      "What does 'C2PA' actually mean in practice?",
      "We've never had an incident, so why spend on it?",
      "How would this even hold up if something went to court?",
      "Our comms videos are internal, who's going to fake those?",
    ],
    strongRepResponses: [
      "That's the gap — there's usually no incident until there's a very expensive one. C2PA is the cheap insurance: tamper-evident proof of origin before you need it.",
      "C2PA is an open standard for content credentials — it attaches a cryptographic record of who made a video and flags AI-generated elements. We're the first and only EVP that's conformant.",
      "Picture a faked all-hands clip of your CEO announcing layoffs hitting social. With C2PA you can prove in seconds what's authentic and what isn't — that's a legal and a comms control.",
      "It's exactly a legal-and-comms issue, which is why I wanted you both in the room — IT runs the platform, but you own the liability.",
    ],
    weakRepResponses: [
      "Deepfakes are scary, you should really buy this.",
      "I don't fully know how C2PA works but it's important.",
      "Everyone needs AI authenticity now, trust me.",
    ],
    coachingNote:
      "This is a new, education-heavy angle — your job is to make an abstract future risk concrete and ownable today. Translate C2PA into plain English, frame it as cheap insurance against an expensive incident, and pull legal AND comms together since neither owns it alone.",
    topMistakes: [
      "Fear-mongering instead of framing concrete, ownable risk.",
      "Failing to explain C2PA in plain language.",
      "Letting 'that's IT's problem' deflect a legal/comms liability.",
    ],
    topWinMoves: [
      "Making the threat concrete (a faked CEO clip) instead of abstract.",
      "Explaining C2PA simply: tamper-evident proof of origin, flags AI content.",
      "Framing it as the first/only conformant EVP — a true category claim.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on board-level risk',
        goal: 'Make a future threat feel present and relevant to them.',
        idealLine:
          "Deepfakes of executives are now good enough to move markets — and we're the first video platform that can cryptographically prove a CEO video is real. Is that on your radar yet?",
      },
      {
        beat: 'Translate C2PA',
        goal: 'Replace jargon with a concrete control.',
        idealLine:
          "C2PA is an open standard — it stamps each video with tamper-evident proof of who made it and flags AI-generated parts. We're the first and only EVP that's conformant.",
      },
      {
        beat: 'Make it ownable',
        goal: 'Stop the deflection to IT.',
        idealLine:
          "This sits with legal and comms, not just IT — IT runs the platform, but you own the liability when something fake shows up.",
      },
      {
        beat: 'Close to a briefing',
        goal: 'Book the cross-functional call.',
        idealLine:
          "Let's do 20 minutes with you and comms to pressure-test your exposure — even if you decide it's a 2027 problem, you'll know where you stand. Next week?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Hoping you can help me find the right person."' },
      { label: '3. Qualification', hint: '"Do you touch risk or compliance around executive communications/video?"' },
      { label: '4. Value prop', hint: '"First and only EVP that can prove a video is real — C2PA-conformant."' },
      { label: '5. Translate + make concrete', hint: 'Faked CEO clip example; legal + comms own it.' },
      { label: '6. Soft close', hint: '"20 minutes with you and comms to map your exposure?"' },
    ],
  },

  'ai-data-layer-mcp': {
    id: 'ai-data-layer-mcp',
    scenarioContext: `CALL CONTEXT:
You are an overwhelmed CTO with 40 active projects, and you've consciously deprioritized "video." You're heads-down building AI agents and copilots on your own stack. Your reflex is "I don't have engineering cycles for a new platform."
The BDR is calling from Vbrick. They will reframe this as AI-readiness, not video — your agents are blind to knowledge trapped in recorded meetings. React as someone who will only engage if it rides your EXISTING roadmap rather than adding a project.`,
    hardModeContext: `HARD MODE MODIFIERS:
You're skeptical of "another integration to maintain" and you'll ask what MCP even is. If the rep can't explain it in one clean sentence and prove it's one connection (not a maintenance burden) feeding tools you already run, you end the call.`,
    title: 'Video as an AI Data Layer (MCP)',
    subtitle:
      'The 2026 platform wedge. Their AI initiatives ignore the institutional knowledge trapped in video. Sell Vbrick’s MCP server.',
    estimatedMinutes: 4,
    defaultPersonaId: 'overwhelmed-cto',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'Vbrick’s Model Context Protocol (MCP) server turns video into a connected data layer that feeds AI agents and enterprise systems — Copilot, ServiceNow Now Assist, Salesforce — so video stops being a dead end and becomes searchable enterprise intelligence.',
    repGoal: 'Book a 20-minute architecture conversation framed as AI-readiness, not video.',
    desiredOutcome: 'A scheduled technical/architecture discussion.',
    openingContinuation:
      "Quick one for you — you're standing up AI agents and copilots, but all the institutional knowledge sitting in your recorded meetings and trainings is invisible to them. We make that video a data source your AI can actually use. Is that a gap you've hit?",
    prospectTone: 'Overwhelmed, technical, juggling 40 projects; will engage if it rides his existing AI roadmap.',
    likelyProspectResponses: [
      "I've got 40 active projects, video isn't one of them.",
      "We're heads-down on our own AI agents right now.",
      "What's MCP? We're already building on our own stack.",
      "How is this not just another integration to maintain?",
      "Our copilot already searches docs and tickets, isn't that enough?",
      "We don't have engineering cycles for a new platform.",
    ],
    strongRepResponses: [
      "That's exactly the point — this isn't a new project, it plugs into the AI work you're already doing. Your agents just gain access to everything locked in video.",
      "MCP is the Model Context Protocol — the standard way agents pull from a data source. Our server exposes your video library to whatever you're building, no custom pipeline.",
      "Your copilot searches docs and tickets but is blind to the 500 hours of recorded decisions and trainings. That's the knowledge gap MCP closes.",
      "It's one connection, not a maintenance burden — and it feeds Copilot, ServiceNow Now Assist, and Salesforce out of the box.",
    ],
    weakRepResponses: [
      "You should add video to your AI roadmap.",
      "MCP is this really technical thing, hard to explain on a call.",
      "We have tons of AI features, you'll love them.",
    ],
    coachingNote:
      "For an overloaded technical buyer, frame everything as 'rides your existing roadmap, not a new project.' Position video as the missing data source for AI they're already building — an AI-readiness play, not a video play. Explain MCP crisply or you'll lose them.",
    topMistakes: [
      "Pitching 'video' to someone who has consciously deprioritized video.",
      "Adding to his project pile instead of plugging into existing work.",
      "Hand-waving MCP instead of explaining it in one clean sentence.",
    ],
    topWinMoves: [
      "Reframing as AI-readiness that rides his current roadmap.",
      "Naming the gap: copilots are blind to knowledge trapped in video.",
      "Explaining MCP simply and naming the out-of-box targets (Copilot, ServiceNow, Salesforce).",
    ],
    winningPathBeats: [
      {
        beat: 'Reframe off "video"',
        goal: 'Get past the deprioritized-video reflex.',
        idealLine:
          "This isn't a video pitch — you're building AI agents, and all the knowledge in your recorded meetings is invisible to them. We make that video a data source they can use.",
      },
      {
        beat: 'Explain MCP cleanly',
        goal: 'Make the mechanism obvious and low-effort.',
        idealLine:
          "MCP is the standard way agents pull from a source. Our server exposes your video library to whatever you're building — one connection, no custom pipeline.",
      },
      {
        beat: 'Name the payoff',
        goal: 'Tie to systems he already runs.',
        idealLine:
          "It feeds Copilot, ServiceNow Now Assist, and Salesforce out of the box — your AI finally sees the 500 hours of decisions trapped in video.",
      },
      {
        beat: 'Close',
        goal: 'Book the architecture chat.',
        idealLine:
          "Twenty minutes with you or your AI lead — not a demo, an architecture conversation about closing that gap. Does this week work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Hoping you can help me out for one minute."' },
      { label: '3. Qualification', hint: '"Are you involved in your company’s AI / agent initiatives?"' },
      { label: '4. Reframe', hint: '"Not a video pitch — your AI is blind to knowledge trapped in video."' },
      { label: '5. Explain MCP', hint: 'Standard way agents pull data; one connection; feeds Copilot/ServiceNow/Salesforce.' },
      { label: '6. Soft close', hint: '"20-minute architecture chat about closing that gap?"' },
    ],
  },

  'servicenow-now-assist': {
    id: 'servicenow-now-assist',
    scenarioContext: `CALL CONTEXT:
You own digital experience and you're deep in ServiceNow. You don't bolt random things onto the platform, and you've been burned by "integrations" that broke on an upgrade. Your goal this year is cutting case resolution time and improving deflection.
The BDR is calling from Vbrick. React as operational and ROI-minded — make them prove it's truly certified (not just "integrates with") and tie video to a metric you actually own.`,
    hardModeContext: `HARD MODE MODIFIERS:
You're protective of your ServiceNow stack and immediately suspicious of bolt-ons. You'll ask "is this actually certified or just 'integrates with'?" and "who owns this on our side?" Only "the only certified video app in the Store" + a clear resolution-time tie-in keeps you engaged.`,
    title: 'ServiceNow Now Assist — Video Intelligence',
    subtitle:
      'They run ServiceNow. Sell the only certified video app in the ServiceNow Store — feeding Now Assist for faster case resolution and deflection.',
    estimatedMinutes: 4,
    defaultPersonaId: 'digital-experience-director',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'Vbrick is the only certified video app in the ServiceNow Store and powers Now Assist with video intelligence — turning recorded knowledge into case deflection and faster resolution inside the tool agents already live in.',
    repGoal: 'Book a 20-minute call with the ServiceNow platform owner + digital experience.',
    desiredOutcome: 'A scheduled call tied to their ServiceNow roadmap.',
    openingContinuation:
      "You're already on ServiceNow — we're the only certified video app in the ServiceNow Store, and we feed Now Assist so video knowledge shows up right in the agent workflow. Is improving case deflection or resolution time a priority this year?",
    prospectTone: 'Operational, ROI-minded, protective of the ServiceNow stack; wants integration proof.',
    likelyProspectResponses: [
      "We're deep in ServiceNow — we don't bolt random things onto it.",
      "Is this actually certified or just 'integrates with'?",
      "We're trying to cut case resolution time, that's the goal.",
      "How does video help a support agent close a ticket faster?",
      "Who owns this on our side, IT or CX?",
      "We've been burned by 'integrations' that broke on upgrade.",
    ],
    strongRepResponses: [
      "Right to it: we're the only certified video app in the ServiceNow Store — not 'integrates with,' actually certified, so it survives your upgrades.",
      "Now Assist can surface the exact 90-second clip that resolves a ticket, right in the agent's flow — that's deflection and faster resolution without leaving ServiceNow.",
      "If resolution time is the goal, recorded fixes and trainings are knowledge your agents can't currently reach. We make Now Assist able to pull from them.",
      "Certified means it's tested against the platform — that's the difference from the integrations that broke on you before.",
    ],
    weakRepResponses: [
      "Yeah we integrate with ServiceNow, it's great.",
      "Video just makes everything better, including support.",
      "I'm not sure who owns it, you tell me.",
    ],
    coachingNote:
      "With a ServiceNow-committed buyer, 'certified' is the magic word — it answers the upgrade-fragility scar tissue most of them carry. Tie video directly to a metric they own (case deflection, resolution time), and keep it inside the tool their agents already use.",
    topMistakes: [
      "Saying 'integrates with ServiceNow' instead of 'certified in the Store'.",
      "Failing to connect video to a concrete support metric.",
      "Not clarifying ownership (platform owner vs CX) to find the buyer.",
    ],
    topWinMoves: [
      "Leading with 'only certified video app in the ServiceNow Store'.",
      "Tying Now Assist to deflection / resolution time directly.",
      "Using 'certified = survives upgrades' to neutralize integration scars.",
    ],
    winningPathBeats: [
      {
        beat: 'Lead with certified',
        goal: 'Earn credibility with the ServiceNow-specific claim.',
        idealLine:
          "You're on ServiceNow — we're the only certified video app in the Store, and we power Now Assist with video intelligence inside the agent workflow.",
      },
      {
        beat: 'Tie to their metric',
        goal: 'Connect video to deflection / resolution.',
        idealLine:
          "If you're cutting resolution time, Now Assist can surface the 90-second clip that fixes a ticket — without the agent leaving ServiceNow.",
      },
      {
        beat: 'Neutralize the scar',
        goal: 'Beat "integrations break on upgrade".',
        idealLine:
          "Certified means it's tested against the platform and survives your upgrades — that's the difference from the bolt-ons that broke before.",
      },
      {
        beat: 'Close',
        goal: 'Book a call with the platform owner.',
        idealLine:
          "Let's get your ServiceNow owner and CX on a 20-minute call to map it to your roadmap. Who owns the platform on your side?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Hoping you can help me out quickly."' },
      { label: '3. Qualification', hint: '"Are you involved with your ServiceNow platform or digital experience?"' },
      { label: '4. Value prop', hint: '"Only certified video app in the ServiceNow Store — powers Now Assist."' },
      { label: '5. Tie to metric', hint: 'Case deflection + resolution time; certified survives upgrades.' },
      { label: '6. Soft close', hint: '"20 minutes with your ServiceNow owner to map it?"' },
    ],
  },

  'brightcove-friction': {
    id: 'brightcove-friction',
    scenarioContext: `CALL CONTEXT:
Your company is a current Brightcove customer. Brightcove was acquired by Bending Spoons and the integration has been noisy — support changes, tooling disruption, pricing uncertainty. You're a disinterested, vendor-fatigued IT manager who's been contacted about this before.
The BDR is calling from Vbrick (a Brightcove competitor). Do NOT volunteer the Brightcove/Bending Spoons angle — only react once the rep raises it at the value-prop step. React honestly per your personality.`,
    hardModeContext: `HARD MODE MODIFIERS:
You've been called repeatedly this month about the Bending Spoons situation by consultants and competitors, and you're protective of your time. You push back on generic openers and expect specifics — which product, what friction, concrete differentiation. You hang up within 30 seconds without a concrete reason to stay.`,
    title: 'Brightcove Friction — Bending Spoons Acquisition',
    subtitle:
      'Competitor displacement. Brightcove’s Bending Spoons acquisition created tooling, support, and pricing turbulence. Pitch Vbrick as the stable alternative.',
    estimatedMinutes: 3,
    defaultPersonaId: 'disinterested-it-manager',
    defaultAccent: 'general',
    difficultyScore: 4,
    whyVbrickFits:
      'Brightcove customers rattled by the Bending Spoons acquisition want stability, security (FedRAMP), and an AI roadmap — all areas where Vbrick is a credible, enterprise-grade replacement.',
    repGoal: 'Surface real Brightcove friction and book a 15-minute alternative-evaluation call.',
    desiredOutcome: 'A scheduled call to scope a Brightcove replacement.',
    openingContinuation:
      "We have a lot of customers coming to us lately because of friction from the Bending Spoons acquisition of Brightcove. Are you seeing similar issues, or looking at alternatives?",
    prospectTone: 'Disinterested, time-protective, vendor-fatigued; opens up only with specifics.',
    likelyProspectResponses: [
      "Support has honestly been a mess since the acquisition.",
      "Haven't really noticed anything different.",
      "Everyone's calling about this. Why should I care?",
      "We just renewed Brightcove, not looking right now.",
      "What's Vbrick's angle, specifically?",
      "We're mid-evaluation already, actually.",
    ],
    strongRepResponses: [
      "That support drop is the #1 thing we hear — when it's hitting live events, that's a business risk, not an inconvenience.",
      "Fair that everyone's calling — here's the specific angle: we're FedRAMP-certified with an AI roadmap that's actually shipping. That's the gap people are feeling.",
      "Even mid-renewal, a 15-minute look costs you nothing and gives you leverage in your Brightcove negotiation.",
      "If you're already evaluating, let's make sure Vbrick is on the list — worst case you've got a sharper comparison.",
    ],
    weakRepResponses: [
      "Brightcove is bad now, you should switch.",
      "Bending Spoons is ruining everything, trust me.",
      "We're cheaper, that's the main thing.",
    ],
    coachingNote:
      "Don't volunteer the Brightcove angle until the value-prop step, and don't trash the competitor — let the prospect's own friction do the work. Convert vague 'everyone's calling' fatigue into one specific differentiator (FedRAMP + shipping AI) and a low-risk look.",
    topMistakes: [
      "Bad-mouthing Brightcove/Bending Spoons instead of surfacing their friction.",
      "Generic 'we're better' with no specific differentiator.",
      "Accepting 'just renewed' as a dead end instead of offering leverage.",
    ],
    topWinMoves: [
      "Letting the prospect name their own Brightcove pain.",
      "Anchoring the differentiator on FedRAMP + a shipping AI roadmap.",
      "Reframing a renewal as negotiation leverage, not a closed door.",
    ],
    winningPathBeats: [
      {
        beat: 'Value-prop trigger',
        goal: 'Raise the acquisition friction and let them react.',
        idealLine:
          "A lot of customers are coming to us over friction from the Bending Spoons acquisition of Brightcove — are you feeling that, or looking at alternatives?",
      },
      {
        beat: 'Differentiate specifically',
        goal: 'Cut through "everyone is calling" fatigue.',
        idealLine:
          "Fair — the specific angle is FedRAMP certification and an AI roadmap that's actually shipping. That's the gap people are feeling post-acquisition.",
      },
      {
        beat: 'Defuse "just renewed"',
        goal: 'Keep it alive with low-risk leverage.',
        idealLine:
          "Even mid-contract, a 15-minute look costs nothing and gives you leverage next time you negotiate with Brightcove.",
      },
      {
        beat: 'Close',
        goal: 'Book the evaluation call.',
        idealLine:
          "Let's do 15 minutes so Vbrick's at least on your comparison list. Does later this week work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great, [first name], hoping you can help me out for a moment."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for enterprise video?"' },
      { label: '4. Value prop', hint: '"Customers are coming to us over Bending Spoons/Brightcove friction — seeing that?"' },
      { label: '5. Differentiate', hint: 'FedRAMP + shipping AI roadmap; renewal = leverage.' },
      { label: '6. Soft close', hint: '"15 minutes so we’re on your comparison list?"' },
    ],
  },

  'cfo-vendor-consolidation': {
    id: 'cfo-vendor-consolidation',
    scenarioContext: `CALL CONTEXT:
You are a numbers-driven CFO with a reputation for killing wasteful vendor spend. You're direct, allergic to vague benefits, and you think in dollars and necessity. You probably don't even know your total video spend — it's scattered across IT, comms, and conferencing budgets.
The BDR is calling from Vbrick. Give them 30 seconds and make them talk in money. React honestly; "no budget" and "that's an IT line item" are natural deflections.`,
    hardModeContext: `HARD MODE MODIFIERS:
You demand a number and you're skeptical of every vendor's "savings" claim. Any invented or hand-wavy savings percentage loses your trust. You only convert if the rep frames it as consolidation (replacing spend, not adding it) and offers to surface your real, hidden video spend with IT in the room.`,
    title: 'CFO — Vendor Consolidation & TCO',
    subtitle:
      'Numbers-driven CFO who kills wasteful spend. Win on consolidation: replace standalone eCDN + webcasting + per-event conferencing licensing.',
    estimatedMinutes: 3,
    defaultPersonaId: 'budget-conscious-cfo',
    defaultAccent: 'general',
    difficultyScore: 5,
    whyVbrickFits:
      'Vbrick consolidates standalone eCDN, separate webcasting tools, and reduces per-event conferencing licensing — a real customer cut large-event Webex/internet costs by moving to Vbrick. One platform replaces a stack.',
    repGoal: 'Earn a 15-minute TCO conversation by leading with consolidation, not features.',
    desiredOutcome: 'A scheduled TCO/cost-review call (ideally with IT).',
    openingContinuation:
      "I'll be quick and I'll talk in dollars: most teams are paying for a webcasting tool, a separate eCDN, and per-event conferencing licenses. We collapse that into one line. Are you carrying multiple video vendors right now?",
    prospectTone: 'Direct, numbers-only, allergic to vague benefits; respects brevity and ROI.',
    likelyProspectResponses: [
      "You've got 30 seconds. Make it about money.",
      "We don't have budget for new tools.",
      "I don't even know what we spend on video, honestly.",
      "What's the actual number we'd save?",
      "Every vendor promises savings. Prove it.",
      "That's an IT line item, not mine.",
    ],
    strongRepResponses: [
      "Then I'll be blunt: this is a consolidation play, not a new spend. One platform replaces your webcasting tool, your eCDN, and a chunk of per-event conferencing licensing.",
      "Not knowing the number is the problem — video spend is usually scattered across three budgets. The first thing we do is surface it. That alone is worth the call.",
      "A customer cut their large-event Webex and internet costs by moving big broadcasts to us. I can't promise your number without your data, but I can find it with you.",
      "It's an IT line item you ultimately sign off on — let's get IT in the room and put the real total in front of you.",
    ],
    weakRepResponses: [
      "We'll definitely save you money, lots of it.",
      "It's pretty affordable, I think.",
      "I don't have exact numbers but it's a good deal.",
    ],
    coachingNote:
      "A CFO buys consolidation and TCO, not features. Open in dollars, frame it as replacing spend rather than adding it, and never invent a savings number — offer to surface their real (and usually hidden) video spend. Pull IT in so the total is credible.",
    topMistakes: [
      "Leading with features instead of consolidation/TCO.",
      "Promising a specific savings % you can't back.",
      "Letting 'no budget' end it instead of reframing as replacing spend.",
    ],
    topWinMoves: [
      "Opening in dollars and framing it as one line replacing three.",
      "Turning 'we don't know our spend' into the reason to meet.",
      "Using the real Webex-cost-cut proof point honestly (no invented numbers).",
    ],
    winningPathBeats: [
      {
        beat: 'Open in dollars',
        goal: 'Match the CFO’s language instantly.',
        idealLine:
          "Thirty seconds, all money: most teams pay for webcasting, a separate eCDN, and per-event conferencing licenses. We collapse that into one line.",
      },
      {
        beat: 'Reframe "no budget"',
        goal: 'Turn replacement into the pitch.',
        idealLine:
          "This isn't new spend — it's consolidation. We replace tools you're already paying for, which is the opposite of a budget ask.",
      },
      {
        beat: 'Prove honestly',
        goal: 'Credibility without invented numbers.',
        idealLine:
          "A customer cut their large-event Webex and internet costs moving big broadcasts to us. I won't guess your number — I'll find it with your data.",
      },
      {
        beat: 'Close',
        goal: 'Book the TCO review with IT.',
        idealLine:
          "Give me 15 minutes with you and IT and we'll put your real, scattered video spend on one page. Does Friday work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"I’ll be quick — hoping you can point me the right way."' },
      { label: '3. Qualification', hint: '"Do you own or sign off on video/communications vendor spend?"' },
      { label: '4. Value prop', hint: '"Consolidation play: one platform replaces webcasting + eCDN + per-event licensing."' },
      { label: '5. Prove + reframe', hint: 'Real Webex cost-cut; "we’ll surface your hidden spend."' },
      { label: '6. Soft close', hint: '"15 minutes with you and IT to put the real number on one page?"' },
    ],
  },

  'wrong-person-referral': {
    id: 'wrong-person-referral',
    scenarioContext: `CALL CONTEXT:
You are an executive assistant supporting the leadership team. You are NOT the person who owns video or streaming — when the rep qualifies you, say so honestly. You're a polite, busy gatekeeper who will help if the rep is crisp and respectful of your time.
The BDR is calling from Vbrick. The point of this call is navigation: see whether they handle the wrong-person moment cleanly, pivot to a referral, and ask permission to name-drop you.`,
    hardModeContext: `HARD MODE MODIFIERS:
You're slammed and a little guarded about handing out colleagues' info. If the rep gets apologetic and flustered ("oh sorry to bother you!") or asks for a blind transfer, you politely end it. A calm, direct referral ask earns a name and permission.`,
    title: 'Wrong Person → Right Person Referral',
    subtitle:
      'Pure framework drill. You reached the wrong contact (an exec assistant). Practice the clean NO-path: direct pivot to a referral and permission to name-drop.',
    estimatedMinutes: 2,
    defaultPersonaId: 'busy-exec-assistant',
    defaultAccent: 'general',
    difficultyScore: 2,
    whyVbrickFits:
      'Doesn’t matter yet — the goal of this call is navigation, not the pitch. Get the right name and permission to use it, then you can run any of the other scenarios with that person.',
    repGoal: 'Get a named referral and explicit permission to name-drop — no "oh sorry," just a direct pivot.',
    desiredOutcome: 'A specific name + permission to say the assistant sent you.',
    openingContinuation:
      "Ah, you might not be the right person — no problem. Who do you feel would be the best person to speak with about your company's video and streaming?",
    prospectTone: 'Polite gatekeeper, busy, will help if you’re crisp and respectful of her time.',
    likelyProspectResponses: [
      "Oh, that's not me — I'm Patricia, I support the leadership team.",
      "That would probably be someone in IT.",
      "I can't just give out people's info.",
      "What's this regarding, exactly?",
      "You'd want our digital workplace lead, I think.",
      "I'm not sure who handles that, honestly.",
    ],
    strongRepResponses: [
      "Totally understand — who do you feel would be the best person to speak with about the company's video and streaming?",
      "I appreciate that. Just a name and I'll take it from there — who owns video or communications tech?",
      "Perfect, thank you. May I tell them you pointed me their way? It just helps me get through.",
      "No problem at all — even a department or title gets me started. Where would you send me?",
    ],
    weakRepResponses: [
      "Oh sorry to bother you! I'll just go.",
      "Can you transfer me to whoever does video?",
      "Never mind, I'll figure it out.",
    ],
    coachingNote:
      "The killer mistake on a wrong-number is the apologetic 'oh sorry!' followed by hanging up. The pro move is a calm, direct pivot to the referral question, then ask permission to name-drop — that permission is what gets you past the next gatekeeper. Be warm, brief, and respectful.",
    topMistakes: [
      "Apologizing and bailing ('oh sorry to bother you').",
      "Asking for a blind transfer instead of a name.",
      "Forgetting to ask permission to name-drop the referrer.",
    ],
    topWinMoves: [
      "A composed, direct pivot to 'who's the best person?'",
      "Asking for a name (not a transfer) and a title as a fallback.",
      "Securing permission to say she sent you.",
    ],
    winningPathBeats: [
      {
        beat: 'Direct pivot (no apology)',
        goal: 'Stay in control on the wrong-person reveal.',
        idealLine:
          "No problem — who do you feel would be the best person to speak with about the company's video and streaming?",
      },
      {
        beat: 'Make it easy to help',
        goal: 'Lower the effort for the gatekeeper.',
        idealLine:
          "Just a name and I'll take it from there — even a title or department gets me pointed the right way.",
      },
      {
        beat: 'Get the name-drop',
        goal: 'Earn the pass-through for the next call.',
        idealLine:
          "Thank you — and may I mention you pointed me their way? It just helps me get through to them.",
      },
      {
        beat: 'Close warmly',
        goal: 'Leave a good impression with the gatekeeper.',
        idealLine:
          "Really appreciate it, Patricia — you've made my day easier. Have a good one.",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great, hoping you can help me out for a second."' },
      { label: '3. Qualification', hint: '"Are you on the team responsible for the company’s video?"' },
      { label: '4. NO-path pivot', hint: 'No "sorry!" — "Who’s the best person to speak with about video?"' },
      { label: '5. Bridge', hint: '"May I tell them you said hello / pointed me their way?"' },
      { label: '6. Close warmly', hint: 'Thank them by name; leave a good impression.' },
    ],
  },

  'video-not-strategic': {
    id: 'video-not-strategic',
    scenarioContext: `CALL CONTEXT:
You're a transactional, procurement-minded buyer who thinks in price and necessity, not vision. Your reflex is "we're not a video company, this isn't a priority" and "what's the price?" Nobody internally is asking for this, and you don't have a budget line for "video."
The BDR is calling from Vbrick. Lead with the dismissive brush-off. Only re-engage if they concede the video frame and reframe it as a knowledge-retention / AI-readiness issue.`,
    hardModeContext: `HARD MODE MODIFIERS:
You try to drag everything to price immediately and you'll say "make the case in one sentence or I'm out." If the rep defends "video is strategic" or anchors on price before establishing value, you end it. The "knowledge walks out the door" reframe is what keeps you on.`,
    title: 'Objection — "Video Isn’t Strategic For Us"',
    subtitle:
      'The dismissive brush-off. Reframe: their video already holds institutional knowledge that’s invisible to their AI and onboarding. It’s not a video play.',
    estimatedMinutes: 3,
    defaultPersonaId: 'price-shopping-procurement',
    defaultAccent: 'general',
    difficultyScore: 4,
    whyVbrickFits:
      'Even buyers who don’t think of themselves as "video companies" are sitting on recorded knowledge that’s unsearchable and ungoverned. Vbrick reframes it as an AI-readiness and knowledge-retention play, not a video purchase.',
    repGoal: 'Flip the "not strategic" reflex into one strategic frame and book a 15-minute exploratory call.',
    desiredOutcome: 'A scheduled exploratory call with the knowledge/AI or comms owner.',
    openingContinuation:
      "I hear that a lot, and fair — but here's the reframe: you've got years of recorded trainings, all-hands, and decisions that nobody can search, and your AI tools can't see any of it. That's not a video problem, it's a knowledge problem. Does that land?",
    prospectTone: 'Transactional, skeptical, procurement-minded; thinks in price and necessity, not vision.',
    likelyProspectResponses: [
      "We're not a video company, this isn't a priority.",
      "If we need video we'll just use what we have.",
      "What's the price? That's all I care about.",
      "Nobody here is asking for this.",
      "We don't have a budget line for 'video.'",
      "Make the case in one sentence or I'm out.",
    ],
    strongRepResponses: [
      "Here's the one sentence: every time someone leaves, their knowledge walks out the door — unless it's captured, searchable, and feeding your AI. That's what this is.",
      "Agreed you're not a video company — neither are most of our customers. They bought retention and AI-readiness; the video part is just the container.",
      "Price matters, but you can't price a category you haven't scoped. Fifteen minutes tells you if there's even anything here.",
      "Nobody asks for it because it's invisible — buried knowledge becomes a risk quietly, then expensively. The call is about whether you have that exposure.",
    ],
    weakRepResponses: [
      "But video IS strategic, everyone needs it!",
      "It's not that expensive, just take a look.",
      "Okay, maybe it's not for you then.",
    ],
    coachingNote:
      "Don't defend 'video' — concede it and change the category. The win is reframing from 'video tool' to 'knowledge retention + AI-readiness.' With a price-first procurement persona, refuse to anchor on price before value is scoped; trade the brush-off for a short exploratory call.",
    topMistakes: [
      "Arguing that video IS strategic (defending the wrong frame).",
      "Getting dragged into a price conversation before value exists.",
      "Accepting 'not a priority' instead of reframing the category.",
    ],
    topWinMoves: [
      "Conceding 'you're not a video company' and reframing to knowledge/AI.",
      "Using the 'knowledge walks out the door' one-liner.",
      "Refusing to price an unscoped category; trading for 15 minutes.",
    ],
    winningPathBeats: [
      {
        beat: 'Concede + reframe',
        goal: 'Drop the video frame, raise the knowledge frame.',
        idealLine:
          "Fair — you're not a video company. But you've got years of recorded knowledge nobody can search and your AI can't see. That's a knowledge problem, not a video one.",
      },
      {
        beat: 'The one-liner',
        goal: 'Make the stakes vivid and personal.',
        idealLine:
          "Every time someone leaves, their knowledge walks out the door unless it's captured and searchable. That's what this actually is.",
      },
      {
        beat: 'Deflect price-first',
        goal: 'Refuse to anchor on price before value.',
        idealLine:
          "I won't price a category you haven't scoped yet — 15 minutes tells you if there's even anything here worth a number.",
      },
      {
        beat: 'Close',
        goal: 'Book the exploratory call.',
        idealLine:
          "Let's do 15 minutes to see if you've got that exposure. If not, you've lost nothing. Worth a look this week?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They answer "Hello?" — you introduce yourself by your own first and last name, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Hoping you can help me out for a moment."' },
      { label: '3. Qualification', hint: '"Do you touch tools for training, knowledge, or internal comms?"' },
      { label: '4. Concede + reframe', hint: '"You’re not a video company — this is a knowledge/AI problem."' },
      { label: '5. One-liner + deflect price', hint: '"Knowledge walks out the door." Don’t price an unscoped category.' },
      { label: '6. Soft close', hint: '"15 minutes to see if you have that exposure?"' },
    ],
  },

  // =====================================================================
  // EASY TRACK — GOVERNMENT / FEDRAMP SCENARIOS
  // Beginner-friendly. FedRAMP certification is the key leverage point:
  // Vbrick is the ONLY FedRAMP-certified EVP and the ONLY FedRAMP-certified eCDN.
  // =====================================================================

  'gov-fedramp-mandate': {
    id: 'gov-fedramp-mandate',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You run online services and training delivery at a federal agency that handles sensitive data. You have a simple, hard rule: any cloud tool you adopt has to be FedRAMP authorized, or it never gets off the ground. You're friendly and open — you'd genuinely like a better way to deliver training video at scale — but the authorization question decides everything.
The BDR is calling from Vbrick. Let them get to it; warm up the moment they show they understand the federal authorization bar.`,
    hardModeContext: '',
    title: 'Government — "It Has to Be FedRAMP Authorized"',
    subtitle:
      'The core federal play. The agency cannot touch uncertified cloud video. Win on the one claim no competitor can match: the only FedRAMP-certified enterprise video platform.',
    estimatedMinutes: 4,
    defaultPersonaId: 'gov-irs-online',
    defaultAccent: 'general',
    difficultyScore: 2,
    whyVbrickFits:
      'Vbrick is the industry’s only FedRAMP-certified enterprise video platform AND the only FedRAMP-certified eCDN — exactly the authorization a federal agency needs before it can put training and comms video into the cloud.',
    repGoal: 'Book a 20-minute call to map their training-video needs against Vbrick’s FedRAMP authorization.',
    desiredOutcome: 'A scheduled scoping call, ideally with their security/authorization lead in the room.',
    openingContinuation:
      "I'll keep it short — we work with federal agencies that can't put video into anything that isn't FedRAMP authorized, and we're the only enterprise video platform that is. Is authorization the gate for you too?",
    prospectTone: 'Friendly and open, but the FedRAMP question is the whole decision.',
    likelyProspectResponses: [
      "If it isn't FedRAMP authorized, it's a non-starter for us.",
      "We handle sensitive data, so authorization is everything.",
      "We already record trainings — what's actually different?",
      "Is your eCDN authorized too, or just the platform?",
      "How fast can something like this scale during our busy season?",
      "Honestly, a better way to deliver training would help.",
    ],
    strongRepResponses: [
      "That's exactly why I called — Vbrick is the only enterprise video platform that's FedRAMP-certified, so we clear your gate before the conversation even starts.",
      "And it's not just the platform — our eCDN is FedRAMP-certified too, which is the part most vendors can't say.",
      "Recording is the easy part. The value is a governed, searchable library inside an authorized boundary, with retention and access controls baked in.",
      "It scales for surges — a financial-services customer runs about 100 webcasts a month for 115,000 users — so seasonal spikes aren't a problem.",
    ],
    weakRepResponses: [
      "Oh, we're FedRAMP ready, basically the same thing.",
      "I'd have to check whether the eCDN part is authorized.",
      "It's basically YouTube but for the government.",
    ],
    coachingNote:
      "With a federal buyer, FedRAMP authorization is the pitch — lead with it. Be precise: 'authorized,' not 'ready.' The standout move is knowing the eCDN is FedRAMP-certified too, not just the platform. You don't have to be perfect here — just clear the authorization bar and ask for a short scoping call.",
    topMistakes: [
      "Burying FedRAMP under feature talk instead of leading with it.",
      "Saying 'FedRAMP ready' when the win is 'FedRAMP authorized.'",
      "Not knowing the eCDN is separately FedRAMP-certified.",
    ],
    topWinMoves: [
      "Leading with FedRAMP certification in the first breath.",
      "Naming that the eCDN is FedRAMP-certified too.",
      "Tying authorization to a low-risk scoping call.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on FedRAMP',
        goal: 'Clear the gate in the first sentence.',
        idealLine:
          "We work with agencies that can't deploy uncertified cloud video — and we're the only enterprise video platform that's FedRAMP-certified. Is that your gate too?",
      },
      {
        beat: 'Both platform AND eCDN',
        goal: 'Show depth competitors can’t match.',
        idealLine:
          "It's not just the platform — our eCDN is FedRAMP-certified as well, which is the piece most vendors can't claim.",
      },
      {
        beat: 'Make scale concrete',
        goal: 'Reassure on reliability at surge time.',
        idealLine:
          "And it scales — one customer runs about 100 webcasts a month for 115,000 users, so your busy season is well within range.",
      },
      {
        beat: 'Close',
        goal: 'Book a low-risk scoping call.',
        idealLine:
          "Let's grab 20 minutes to map your training-video needs against our authorization — would later this week work, maybe with your security lead on too?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great — I was hoping you could help me out for a second."' },
      { label: '3. Qualification', hint: '"Are you involved in how your agency delivers training or internal video?"' },
      { label: '4. Lead with FedRAMP', hint: '"We\'re the only FedRAMP-certified enterprise video platform — is authorization your gate?"' },
      { label: '5. Go deeper', hint: 'Platform AND eCDN are FedRAMP-certified; governed, searchable, scales for surges.' },
      { label: '6. Soft close', hint: '"20 minutes to map it to your needs — maybe with your security lead?"' },
    ],
  },

  'gov-townhall-field-offices': {
    id: 'gov-townhall-field-offices',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You run enterprise communications for a large federal agency with offices and facilities all over the country. Your monthly all-staff broadcasts buffer badly when everyone tunes in live, and you catch the complaints. You're warm and mission-driven, and you'd love this fixed — but anything you adopt still has to be federally authorized.
The BDR is calling from Vbrick about all-hands that reach every site without buffering. React honestly and warmly.`,
    hardModeContext: '',
    title: 'Government — All-Hands Across Field Offices',
    subtitle:
      'Federal comms owns the agency all-hands, and it buffers at the field sites. Sell the FedRAMP-certified eCDN — three delivery methods from one vendor.',
    estimatedMinutes: 4,
    defaultPersonaId: 'gov-va-comms',
    defaultAccent: 'general',
    difficultyScore: 2,
    whyVbrickFits:
      'Vbrick is the only vendor offering all three eCDN technologies (peer-to-peer, edge caching, multicast) from one vendor, AND the only FedRAMP-certified eCDN — so a federal agency can broadcast to every field site without melting the network, inside an authorized boundary.',
    repGoal: 'Book a 15-minute call with whoever owns the network and the next all-staff broadcast.',
    desiredOutcome: 'A scheduled scoping call, ideally with IT/network in the room.',
    openingContinuation:
      "We help federal agencies run all-staff broadcasts that reach every field office without buffering — using the only FedRAMP-certified eCDN out there. When you go live agency-wide, does the video hold up?",
    prospectTone: 'Warm, mission-driven; owns the message, not the plumbing.',
    likelyProspectResponses: [
      "Honestly, the last all-staff buffered at half our sites.",
      "Anything we adopt has to be FedRAMP authorized.",
      "That's really more of a network thing than mine.",
      "We already have Teams across the agency.",
      "What even is an eCDN?",
      "I'd love for this to just work for once.",
    ],
    strongRepResponses: [
      "That buffering is a bandwidth problem, not a video-quality one — an eCDN fixes it so you stop asking people to lower their resolution just to watch leadership.",
      "And ours is the only FedRAMP-certified eCDN, so you get the fix inside an authorized boundary — that matters for a federal agency.",
      "We're the only vendor that gives you all three delivery methods — peer-to-peer, edge caching, and multicast — so it adapts to whatever each field site's network looks like.",
      "You own whether the message lands; I can bring your network folks into a short call so it's not all on you.",
    ],
    weakRepResponses: [
      "You should just upgrade your whole network.",
      "Let me transfer you to IT then.",
      "Our video quality is amazing, that's the main thing.",
    ],
    coachingNote:
      "Translate 'eCDN' into their language: it's the reason the broadcast doesn't buffer. The federal twist is huge — it's the only FedRAMP-certified eCDN, so it clears authorization too. Don't punt to IT and lose control; offer to bring them into the meeting. You've got room here — be warm and just earn a short call.",
    topMistakes: [
      "Talking about video quality when the pain is network bandwidth.",
      "Using 'eCDN' without translating it into 'why your all-hands buffers.'",
      "Forgetting the federal angle: it's the only FedRAMP-certified eCDN.",
    ],
    topWinMoves: [
      "Reframing buffering as bandwidth, not resolution.",
      "Naming the FedRAMP-certified, three-modality eCDN as the one-vendor advantage.",
      "Offering to pull network/IT into the meeting.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on the felt pain',
        goal: 'Lead with the buffering memory, not the product.',
        idealLine:
          "When you go live agency-wide, does the stream hold up — or do the field offices buffer and you catch the complaints?",
      },
      {
        beat: 'Reframe + federal twist',
        goal: 'Fix the blame and add the authorization angle.',
        idealLine:
          "That's bandwidth, not quality — an eCDN fixes it. And ours is the only FedRAMP-certified eCDN, so it's authorized for a federal agency.",
      },
      {
        beat: 'One vendor, three methods',
        goal: 'Show it adapts to every site.',
        idealLine:
          "We're the only vendor with all three delivery methods from one place, so it adapts to whatever each field site's network looks like.",
      },
      {
        beat: 'Close',
        goal: 'Book the scoping call with the network owner.',
        idealLine:
          "When's your next all-staff? Let's take 15 minutes to scope it before then — I can bring your network folks in too. Does next week work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great — I was hoping you could help me out quickly."' },
      { label: '3. Qualification', hint: '"Are you on the team that runs your agency\'s all-staff broadcasts?"' },
      { label: '4. Value prop', hint: '"We help agencies run all-hands that reach every site without buffering. Does yours hold up live?"' },
      { label: '5. eCDN + FedRAMP', hint: 'eCDN fixes the bandwidth problem; ours is the only FedRAMP-certified one; three methods, one vendor.' },
      { label: '6. Soft close', hint: '"When\'s your next all-staff? 15 minutes to scope it — network folks too?"' },
    ],
  },

  'gov-replace-uncertified-tool': {
    id: 'gov-replace-uncertified-tool',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You help set cloud standards across government, and you know authorization cold. An existing video tool in use only carries a SOC 2 report — not a real FedRAMP authorization — and that gap bothers you. You're friendly and standards-literate, and you enjoy a rep who can speak precisely about the difference.
The BDR is calling from Vbrick. Make them be precise; reward it warmly when they are.`,
    hardModeContext: '',
    title: 'Government — Replace the Uncertified Incumbent',
    subtitle:
      'Their current video tool only has SOC 2, not FedRAMP. Win by exposing the gap between a real FedRAMP authorization and a SOC 2 report.',
    estimatedMinutes: 4,
    defaultPersonaId: 'gov-gsa-cloud',
    defaultAccent: 'general',
    difficultyScore: 3,
    whyVbrickFits:
      'Most video tools carry SOC 2 at best; Vbrick is the only FedRAMP-certified enterprise video platform (and the only FedRAMP-certified eCDN). In a government buy, that authorization gap is usually the whole decision.',
    repGoal: 'Earn a short authorization/architecture review by exposing the SOC-2-vs-FedRAMP gap.',
    desiredOutcome: 'A scheduled review to compare authorization posture.',
    openingContinuation:
      "I'll be quick because I know you live in this — a lot of video tools in government only carry SOC 2, not a real FedRAMP authorization. We're the only enterprise video platform that's actually FedRAMP-certified. Is that gap on your radar?",
    prospectTone: 'Friendly, precise, standards-fluent; rewards a rep who is exact.',
    likelyProspectResponses: [
      "Plenty of vendors say 'FedRAMP-ready' — are you actually authorized?",
      "We already have a tool that passed a security review.",
      "SOC 2 isn't the same as FedRAMP, so be precise with me.",
      "What's your impact level?",
      "Other agencies ask us which platforms are actually authorized.",
      "If you know the difference, I'm listening.",
    ],
    strongRepResponses: [
      "Authorized — not 'ready,' not 'in process.' Vbrick carries a real FedRAMP authorization, which is exactly the distinction most vendors blur.",
      "A SOC 2 report is a point-in-time audit; a FedRAMP authorization is continuous monitoring against federal controls. For a government buy, that's usually the whole decision.",
      "And it's not just the platform — our eCDN is FedRAMP-certified too, so the delivery layer is covered, not just the catalog.",
      "If agencies ask you who's actually authorized, we'd like to be the easy answer — happy to walk your team through the posture.",
    ],
    weakRepResponses: [
      "Yeah, we're FedRAMP-ish, close enough.",
      "SOC 2, FedRAMP — it's all basically security.",
      "I'm not sure on the impact level, I'd have to check.",
    ],
    coachingNote:
      "This buyer knows authorization better than you do, so precision wins respect. Lead with the SOC-2-vs-FedRAMP gap and never overstate — 'authorized,' not 'ready.' You don't need to win an argument; just be exact and ask for a short review. Being honest about what you don't know is fine here.",
    topMistakes: [
      "Blurring 'FedRAMP ready' with 'FedRAMP authorized.'",
      "Treating SOC 2 and FedRAMP as interchangeable.",
      "Missing that the eCDN is separately FedRAMP-certified.",
    ],
    topWinMoves: [
      "Stating 'authorized, not ready' with confidence.",
      "Explaining the SOC-2-vs-FedRAMP gap crisply.",
      "Offering to be the authorized answer other agencies can point to.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on the gap',
        goal: 'Name the SOC-2-vs-FedRAMP distinction immediately.',
        idealLine:
          "Most government video tools carry SOC 2 at best — we're the only enterprise video platform that's actually FedRAMP-certified. Is that gap on your radar?",
      },
      {
        beat: 'Be precise',
        goal: 'Earn respect with exactness.',
        idealLine:
          "Authorized, not 'ready' — continuous monitoring against federal controls, not a point-in-time SOC 2 audit. In a government buy that's usually the whole decision.",
      },
      {
        beat: 'Cover the delivery layer',
        goal: 'Show depth on the eCDN too.',
        idealLine:
          "And the eCDN is FedRAMP-certified as well, so your delivery layer is covered, not just the video catalog.",
      },
      {
        beat: 'Close',
        goal: 'Book a posture/architecture review.',
        idealLine:
          "Let's do 20 minutes to compare authorization posture side by side — would later this week work for you and your security folks?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"I\'ll be quick — hoping you can point me the right way."' },
      { label: '3. Qualification', hint: '"Are you involved in cloud standards or which video tools get authorized?"' },
      { label: '4. Name the gap', hint: '"Most video tools only carry SOC 2 — we\'re actually FedRAMP-certified."' },
      { label: '5. Be precise', hint: '"Authorized, not ready." SOC 2 = point-in-time; FedRAMP = continuous. eCDN certified too.' },
      { label: '6. Soft close', hint: '"20 minutes to compare authorization posture — with your security folks?"' },
    ],
  },

  'gov-dod-secure-training': {
    id: 'gov-dod-secure-training',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You authorize the tools your defense organization uses, and security is your whole job. Training and briefing video has to stay inside an authorized, access-controlled boundary, with real role-based access and encryption end to end. You're careful but genuinely approachable when a rep respects the controls instead of hand-waving them.
The BDR is calling from Vbrick. Reward specificity on security; warm up when they earn it.`,
    hardModeContext: '',
    title: 'Defense — Secure Training & Briefing Video',
    subtitle:
      'A defense security owner who needs authorized, access-controlled video. Lead with FedRAMP, then stack the specific controls: RBAC, encryption, no AI training on data.',
    estimatedMinutes: 4,
    defaultPersonaId: 'gov-disa-issm',
    defaultAccent: 'general',
    difficultyScore: 3,
    whyVbrickFits:
      'Vbrick is FedRAMP-certified, with multi-layered role-based access control, encryption at rest and in transit, SOC 2 Type II, and AI that runs on AWS Bedrock and never trains on customer data — the control stack a defense security owner needs for training and briefing video.',
    repGoal: 'Earn a short technical/security review by leading with certification and stacking specific controls.',
    desiredOutcome: 'A scheduled security/architecture review.',
    openingContinuation:
      "I know security is the whole conversation for you, so here's the 30 seconds: we're FedRAMP-certified, with multi-layered role-based access and encryption at rest and in transit. Is secure video delivery something you're working on?",
    prospectTone: 'Careful, controls-focused, but approachable when respected.',
    likelyProspectResponses: [
      "We can't use anything that isn't authorized at the right level.",
      "How do you handle role-based access and least privilege?",
      "Where does the data live, and is it encrypted end to end?",
      "If you've got AI, does it train on our data?",
      "Most vendors fall over when we ask about controls.",
      "Okay — you're speaking my language, keep going.",
    ],
    strongRepResponses: [
      "We're FedRAMP-certified, which is the baseline; on top of that, multi-layered RBAC so only the right people see the right content — least privilege by design.",
      "Encryption at rest and in transit, plus SOC 2 Type II — the data stays inside the authorized boundary.",
      "On AI: it runs on AWS Bedrock with retrieval-augmented generation and never trains on your data. Your content stays yours.",
      "I'd rather not just send a packet into the void — let me get your team 20 minutes to walk the controls with you.",
    ],
    weakRepResponses: [
      "Oh, we're super secure, don't worry about it.",
      "I think the access stuff is configurable, probably.",
      "Not sure about the AI-training part, I'd have to check.",
    ],
    coachingNote:
      "With a security owner, certifications and controls ARE the pitch. Open with FedRAMP, then stack specifics — RBAC, encryption, Bedrock never-trains-on-your-data. Never say 'we're very secure' without naming a control. You don't need to be flawless; just be concrete and ask for a short review.",
    topMistakes: [
      "Saying 'we're very secure' without naming a specific control.",
      "Hand-waving the AI-training-on-data question.",
      "Leading with features instead of the certification baseline.",
    ],
    topWinMoves: [
      "Leading with FedRAMP, then stacking RBAC + encryption.",
      "Answering the AI-data question cleanly: Bedrock, RAG, never trains on your data.",
      "Trading a static packet for a live controls review.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on certification',
        goal: 'Buy credibility in the first breath.',
        idealLine:
          "Here's the 30 seconds: we're FedRAMP-certified, with multi-layered role-based access and encryption at rest and in transit.",
      },
      {
        beat: 'Stack the controls',
        goal: 'Prove depth, not slogans.',
        idealLine:
          "Least privilege by design, SOC 2 Type II, and AI on AWS Bedrock that never trains on your data — your content stays inside the authorized boundary.",
      },
      {
        beat: 'Answer the AI-data fear',
        goal: 'Turn the worry into a differentiator.',
        idealLine:
          "On the AI question specifically — retrieval-augmented, never trains on your content. That's exactly why regulated buyers choose us.",
      },
      {
        beat: 'Close to a review',
        goal: 'Earn the technical meeting.',
        idealLine:
          "Rather than a packet, let me get your team 20 minutes to walk the controls live — when could that group meet?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Hoping you can point me in the right direction for a second."' },
      { label: '3. Qualification', hint: '"Are you the person who authorizes the tools your org uses?"' },
      { label: '4. Lead with FedRAMP', hint: '"We\'re FedRAMP-certified — is secure video delivery on your plate?"' },
      { label: '5. Stack controls', hint: 'RBAC / least privilege, encryption at rest+transit, SOC 2 Type II, AI never trains on your data.' },
      { label: '6. Soft close', hint: '"20 minutes to walk the controls live with your team?"' },
    ],
  },

  'gov-ai-searchable-no-train': {
    id: 'gov-ai-searchable-no-train',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You lead communications at a public-mission federal agency sitting on years of recorded briefings, guidance, and trainings that nobody can search. You're genuinely excited about AI making all of it findable — but you cannot risk any AI training on your agency's content, and everything has to live inside an authorized boundary.
The BDR is calling from Vbrick about making your video searchable with AI. Be warm and curious; surface the data-safety question naturally.`,
    hardModeContext: '',
    title: 'Government — Make the Archive Searchable (Safely)',
    subtitle:
      'A public-mission agency wants AI to make years of video findable — without the AI ever training on their data. Sell Smart Search on Bedrock, inside a FedRAMP boundary.',
    estimatedMinutes: 4,
    defaultPersonaId: 'gov-cdc-comms',
    defaultAccent: 'general',
    difficultyScore: 2,
    whyVbrickFits:
      'Vbrick AI runs on AWS Bedrock with retrieval-augmented generation and never trains on customer data, does semantic Smart Search, auto-generates titles/summaries/chapters/tags, and transcribes/translates in 100+ languages — all inside a FedRAMP-certified boundary.',
    repGoal: 'Book a 20-minute working session to demo Smart Search against a slice of their real archive.',
    desiredOutcome: 'A scheduled demo focused on their own video content.',
    openingContinuation:
      "We're talking to agencies sitting on years of recorded briefings and trainings nobody can search, so the knowledge just sits there. We make all of it findable with AI — without the AI ever training on your data. Is that a problem you have?",
    prospectTone: 'Warm, curious, forward-leaning — but careful about data.',
    likelyProspectResponses: [
      "We're intrigued by AI, but it can't train on our data.",
      "Is this inside a FedRAMP boundary?",
      "We have years of video nobody can search.",
      "How does it actually find a moment in a long briefing?",
      "Can it handle multiple languages for public messaging?",
      "If the data part checks out, I'm interested.",
    ],
    strongRepResponses: [
      "That's the first thing agencies ask, and it's the easy answer: our AI runs on AWS Bedrock with retrieval-augmented generation and never trains on your content. Your video stays yours.",
      "Smart Search is semantic — type 'what did we say about the spring guidance update' and it jumps you to the 40-second clip inside a 90-minute briefing.",
      "It auto-writes titles, summaries, chapters, and tags, and transcribes and translates in 100+ languages — which matters for public messaging.",
      "And all of it sits inside our FedRAMP-certified boundary, so you get the AI without leaving the authorization behind.",
    ],
    weakRepResponses: [
      "Our AI is really powerful, it does everything.",
      "I'm not totally sure how the data part works.",
      "It's basically ChatGPT for your videos.",
    ],
    coachingNote:
      "On an AI pitch to government, trust wins the meeting. Lead with the capability, but the second 'does it train on our data?' comes up, answer it cleanly — Bedrock, RAG, never trains on your data — and add that it's all inside a FedRAMP boundary. This is a warm buyer; you mostly just have to not fumble the data question and ask for a demo.",
    topMistakes: [
      "Fumbling 'does it train on our data?' with 'I think so / let me check.'",
      "Leaving it abstract instead of grounding it in their archive.",
      "Forgetting the FedRAMP boundary that makes the AI usable for them.",
    ],
    topWinMoves: [
      "Answering the data-safety question crisply: Bedrock + RAG + never trains on your data.",
      "Making Smart Search concrete (find the 40-second clip in a 90-minute briefing).",
      "Tying the AI to the FedRAMP-certified boundary.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on the pain',
        goal: 'Name the dead, unsearchable archive.',
        idealLine:
          "You've got years of briefings and trainings nobody can search, so the knowledge just sits there — that the situation for you?",
      },
      {
        beat: 'Answer the data question',
        goal: 'Convert the safety fear into trust.',
        idealLine:
          "Our AI runs on AWS Bedrock with retrieval-augmented generation and never trains on your content — and it all sits inside our FedRAMP boundary.",
      },
      {
        beat: 'Make it concrete',
        goal: 'Prove the capability is real.',
        idealLine:
          "Smart Search finds the 40-second clip inside a 90-minute briefing, and it auto-summarizes and translates in 100+ languages.",
      },
      {
        beat: 'Close',
        goal: 'Book a demo on their real content.',
        idealLine:
          "Let's grab 20 minutes and I'll run Smart Search against a slice of your own archive — would later this week work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great — hoping you could help me out for a moment."' },
      { label: '3. Qualification', hint: '"Are you involved in how your agency manages or gets value from its video?"' },
      { label: '4. Value prop', hint: '"We make years of video searchable with AI — without the AI ever training on your data."' },
      { label: '5. Handle data + FedRAMP', hint: '"Runs on AWS Bedrock with RAG, never trains on your content — all inside a FedRAMP boundary."' },
      { label: '6. Soft close', hint: '"20 minutes to run Smart Search against your own archive?"' },
    ],
  },

  // =====================================================================
  // EASY TRACK — FINANCIAL-SERVICES SCENARIOS
  // Beginner-friendly. Regulated-finance angles: recordkeeping, scale,
  // security, governed training, and certified AI/ServiceNow integration.
  // =====================================================================

  'fin-recordkeeping-supervision': {
    id: 'fin-recordkeeping-supervision',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You own recordkeeping and supervision for communications at a wealth-management firm. Recorded webcasts and town halls have to be retained and supervisable under SEC Rule 17a-4 (WORM), with full audit trails — and you have no tamper-evident way to prove a video is authentic. You're precise but friendly, and you warm up to a rep who actually knows the regulatory language.
The BDR is calling from Vbrick. Reward a rep who speaks recordkeeping and authenticity.`,
    hardModeContext: '',
    title: 'Financial Services — Recordkeeping & Supervision',
    subtitle:
      'A compliance supervisor who must retain and prove video. Win on governed WORM-style retention, audit trails, and C2PA tamper-evident authenticity.',
    estimatedMinutes: 4,
    defaultPersonaId: 'fin-morgan-stanley-compliance',
    defaultAccent: 'general',
    difficultyScore: 3,
    whyVbrickFits:
      'Vbrick is a governed video CMS with retention/expiration rules, fine-grained access, and complete audit trails — and is the first and only EVP with C2PA conformance, giving tamper-evident proof of a video’s origin. That maps directly to financial-services recordkeeping and supervision.',
    repGoal: 'Book a 20-minute call on governed video retention, audit trails, and authenticity.',
    desiredOutcome: 'A scheduled compliance/recordkeeping review.',
    openingContinuation:
      "We work with compliance teams that have to retain and supervise recorded video the way they do every other communication — with audit trails, and now tamper-evident proof a clip is real. Is recordkeeping for video on your plate?",
    prospectTone: 'Precise, recordkeeping-focused, but approachable when you speak his language.',
    likelyProspectResponses: [
      "Anything we keep has to meet 17a-4 retention.",
      "Can you produce an audit trail on demand?",
      "How would we prove a recording wasn't altered?",
      "Supervision and recordkeeping are the whole question for me.",
      "We already record things — what's actually different?",
      "If you know this space, keep going.",
    ],
    strongRepResponses: [
      "Right to it: Vbrick governs video like a record — retention and expiration rules, fine-grained access, and a complete audit trail you can produce on request.",
      "And on authenticity — we're the first and only enterprise video platform that's C2PA-conformant, so you get tamper-evident proof of a clip's origin.",
      "That means when a regulator asks, you can show what's authentic and pull the record fast, instead of hunting across tools.",
      "It's recordkeeping built in, not bolted on — exactly the supervision burden you're carrying.",
    ],
    weakRepResponses: [
      "We store videos, so you're covered I think.",
      "Not sure on the retention specifics, I'd have to check.",
      "Authenticity isn't really something people worry about.",
    ],
    coachingNote:
      "With a compliance supervisor, speak their language: retention, audit trails, supervision, authenticity. The modern differentiator is C2PA — tamper-evident proof a video is real. You don't have to be perfect; just connect governed retention + audit trail + C2PA to their burden and ask for a short review.",
    topMistakes: [
      "Reducing a governed CMS to 'we store videos.'",
      "Missing the C2PA authenticity angle entirely.",
      "Vague answers on retention and audit trails.",
    ],
    topWinMoves: [
      "Naming governed retention + audit trails as built-in recordkeeping.",
      "Leading the authenticity gap with C2PA conformance.",
      "Framing fast production on a regulatory request.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on recordkeeping',
        goal: 'Speak supervision from the first sentence.',
        idealLine:
          "We help compliance teams retain and supervise recorded video like any other communication — audit trails included. Is that on your plate?",
      },
      {
        beat: 'Governed retention',
        goal: 'Show recordkeeping is built in.',
        idealLine:
          "Retention and expiration rules, fine-grained access, and a complete audit trail you can produce on request — recordkeeping baked in, not bolted on.",
      },
      {
        beat: 'The authenticity gap',
        goal: 'Differentiate with C2PA.',
        idealLine:
          "And we're the first and only EVP that's C2PA-conformant — tamper-evident proof a clip is authentic when a regulator asks.",
      },
      {
        beat: 'Close',
        goal: 'Book a recordkeeping review.',
        idealLine:
          "Let's grab 20 minutes to map this to your supervision and retention requirements — would later this week work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great — hoping you could help me out for a second."' },
      { label: '3. Qualification', hint: '"Are you involved in recordkeeping or supervision for communications?"' },
      { label: '4. Value prop', hint: '"We govern video like a record — retention, audit trails, tamper-evident proof. On your plate?"' },
      { label: '5. C2PA + retention', hint: 'Governed retention + audit trail; first/only C2PA-conformant EVP for tamper-evident authenticity.' },
      { label: '6. Soft close', hint: '"20 minutes to map it to your retention requirements?"' },
    ],
  },

  'fin-bank-townhall-scale': {
    id: 'fin-bank-townhall-scale',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You run the technology behind firmwide town halls at a very large bank. When the whole firm tunes in live, the network strains and some sites buffer. You're polished and warm, and you'd love this to just work — anything new still has to clear security and risk eventually, but that's not today's gate.
The BDR is calling from Vbrick about broadcasts that scale without melting the network. React honestly and warmly.`,
    hardModeContext: '',
    title: 'Financial Services — Town Halls at Bank Scale',
    subtitle:
      'A 300,000-person bank whose firmwide town halls strain the network. Sell the eCDN — three delivery methods from one vendor — plus the security posture banks need.',
    estimatedMinutes: 4,
    defaultPersonaId: 'fin-jpmc-comms',
    defaultAccent: 'general',
    difficultyScore: 2,
    whyVbrickFits:
      'Vbrick is the only vendor offering all three eCDN technologies (peer-to-peer, edge caching, multicast) from one vendor, broadcasts studio-quality live events to tens of thousands, and brings the security posture (SOC 2 Type II, FedRAMP, encryption) banks expect. A financial-services customer runs ~100 webcasts/month for 115,000 users.',
    repGoal: 'Book a 15-minute call with whoever owns the network and the next firmwide town hall.',
    desiredOutcome: 'A scheduled scoping call, ideally with IT/network in the room.',
    openingContinuation:
      "We help banks run firmwide town halls that don't buffer at the branches — using an eCDN that adapts to your network. When the whole firm tunes in live, does the video hold up?",
    prospectTone: 'Polished, warm, scale-minded; owns the broadcast, not the plumbing.',
    likelyProspectResponses: [
      "Honestly, big town halls buffer at some of our sites.",
      "Anything new has to clear security and risk.",
      "How is this different from our meeting tools?",
      "Does it actually scale to our headcount?",
      "What's an eCDN, in plain terms?",
      "I'd love for this to just work.",
    ],
    strongRepResponses: [
      "That buffering is a bandwidth problem — an eCDN fixes it so the branches stop choking when the whole firm tunes in.",
      "We're the only vendor with all three delivery methods — peer-to-peer, edge caching, and multicast — so it adapts to whatever each site's network looks like.",
      "On scale: a financial-services customer runs about 100 webcasts a month for 115,000 users, so your headcount is well within range.",
      "And it carries the posture banks expect — SOC 2 Type II, FedRAMP-certified, encryption end to end — so risk has less to push back on.",
    ],
    weakRepResponses: [
      "You should just upgrade your network.",
      "Our video quality is great, that's the main thing.",
      "Let me send you to IT.",
    ],
    coachingNote:
      "Translate 'eCDN' into 'your town hall stops buffering at the branches.' For a bank, pair the scale story with the security posture (SOC 2, FedRAMP, encryption) so risk has less to object to later. This is a warm buyer — be human and just earn a short scoping call.",
    topMistakes: [
      "Talking video quality when the pain is bandwidth.",
      "Using 'eCDN' without translating it.",
      "Forgetting the bank's security posture matters even on a comms call.",
    ],
    topWinMoves: [
      "Reframing buffering as bandwidth, fixed by an eCDN.",
      "Naming the three-method, one-vendor eCDN advantage.",
      "Backing scale with the real ~100-webcasts/115,000-users proof point.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on the felt pain',
        goal: 'Lead with the buffering memory.',
        idealLine:
          "When the whole firm tunes into a town hall live, does the stream hold up — or do some sites buffer?",
      },
      {
        beat: 'Reframe + eCDN',
        goal: 'Fix the blame and name the fix.',
        idealLine:
          "That's bandwidth, not quality — an eCDN fixes it, and we're the only vendor with all three delivery methods from one place.",
      },
      {
        beat: 'Prove scale + posture',
        goal: 'Reassure on reliability and security.',
        idealLine:
          "One customer runs about 100 webcasts a month for 115,000 users — and it's SOC 2 Type II and FedRAMP-certified, so risk has less to push on.",
      },
      {
        beat: 'Close',
        goal: 'Book the scoping call.',
        idealLine:
          "When's your next firmwide town hall? Let's take 15 minutes to scope it — I can bring your network folks in too. Does next week work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great — hoping you could help me out quickly."' },
      { label: '3. Qualification', hint: '"Are you on the team that runs your firm\'s town halls?"' },
      { label: '4. Value prop', hint: '"We help banks run town halls that don\'t buffer at the branches. Does yours hold up live?"' },
      { label: '5. eCDN + posture', hint: 'eCDN fixes bandwidth; three methods, one vendor; SOC 2 + FedRAMP; ~100 webcasts/mo for 115K users.' },
      { label: '6. Soft close', hint: '"When\'s your next town hall? 15 minutes to scope it — network folks too?"' },
    ],
  },

  'fin-security-no-pii': {
    id: 'fin-security-no-pii',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You review the tools that could touch sensitive or customer data at an investment bank. A video tool cannot expose customer data — period. You need SOC 2 Type II, encryption, and strong access controls, and the moment AI comes up you ask whether data is used for training. You're rigorous but fair, and you reward a rep who names real controls.
The BDR is calling from Vbrick. Make them be specific; warm up when they earn it.`,
    hardModeContext: '',
    title: 'Financial Services — Security Review (No Data Exposure)',
    subtitle:
      'A tech-risk reviewer at a bank. Lead with the control stack: SOC 2 Type II, encryption, RBAC, AI that never trains on your data — with FedRAMP as proof of top-tier rigor.',
    estimatedMinutes: 4,
    defaultPersonaId: 'fin-goldman-techrisk',
    defaultAccent: 'general',
    difficultyScore: 3,
    whyVbrickFits:
      'Vbrick carries SOC 2 Type II, GDPR, encryption at rest and in transit, and multi-layered RBAC; its AI runs on AWS Bedrock with RAG and never trains on customer data; and it is FedRAMP-certified — the top-tier rigor a bank’s tech-risk team wants to see.',
    repGoal: 'Earn a short security/architecture review by leading with controls.',
    desiredOutcome: 'A scheduled security review.',
    openingContinuation:
      "I know you review anything that could touch sensitive data, so here's the 30 seconds: SOC 2 Type II, encryption at rest and in transit, multi-layered role-based access — and our AI never trains on your data. Is secure video on your review list?",
    prospectTone: 'Rigorous but fair; rewards specifics, allergic to fluff.',
    likelyProspectResponses: [
      "Where does our data live, and is it encrypted?",
      "What's your SOC 2 Type II status?",
      "If you have AI, does it train on our data?",
      "We can't expose anything customer-facing.",
      "Most vendors fall over when we ask about controls.",
      "Okay, you're being specific — keep going.",
    ],
    strongRepResponses: [
      "SOC 2 Type II, GDPR, and encryption at rest and in transit — your content stays encrypted end to end.",
      "Access is multi-layered RBAC, so only the right people see the right content — least privilege by design.",
      "On AI: it runs on AWS Bedrock with retrieval-augmented generation and never trains on your data. Your content stays yours.",
      "And we're FedRAMP-certified, which is about as high as the rigor bar goes — happy to get your team 20 minutes to walk it.",
    ],
    weakRepResponses: [
      "We're super secure, don't worry about it.",
      "I think the AI-training part is fine, probably.",
      "Access controls are configurable, I'd have to check.",
    ],
    coachingNote:
      "With a tech-risk reviewer, controls ARE the pitch. Open with the stack — SOC 2 Type II, encryption, RBAC — answer the AI-data question cleanly (Bedrock, RAG, never trains on your data), and use FedRAMP as proof of top-tier rigor. Never say 'we're very secure' without naming a control. Be concrete and ask for a short review.",
    topMistakes: [
      "Saying 'we're very secure' without naming a specific control.",
      "Hand-waving the AI-training-on-data question.",
      "Leading with features instead of the control stack.",
    ],
    topWinMoves: [
      "Stacking SOC 2 Type II + encryption + RBAC up front.",
      "Answering the AI-data question crisply: Bedrock, RAG, never trains on your data.",
      "Using FedRAMP as the rigor proof point.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on controls',
        goal: 'Buy credibility immediately.',
        idealLine:
          "Here's the 30 seconds: SOC 2 Type II, encryption at rest and in transit, multi-layered role-based access.",
      },
      {
        beat: 'Answer the AI-data fear',
        goal: 'Turn the worry into a differentiator.',
        idealLine:
          "Our AI runs on AWS Bedrock with retrieval-augmented generation and never trains on your data — your content stays yours.",
      },
      {
        beat: 'Prove top-tier rigor',
        goal: 'Use FedRAMP as the trust signal.',
        idealLine:
          "And we're FedRAMP-certified — about as high as the rigor bar goes, even outside government.",
      },
      {
        beat: 'Close to a review',
        goal: 'Earn the technical meeting.',
        idealLine:
          "Rather than a packet, let me get your team 20 minutes to walk the controls — would you be open to that?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Hoping you can point me the right way for a second."' },
      { label: '3. Qualification', hint: '"Are you the person who reviews tools that could touch sensitive data?"' },
      { label: '4. Lead with controls', hint: '"SOC 2 Type II, encryption, RBAC — is secure video on your review list?"' },
      { label: '5. AI + FedRAMP', hint: 'AI on Bedrock never trains on your data; FedRAMP-certified as top-tier rigor proof.' },
      { label: '6. Soft close', hint: '"20 minutes to walk the controls with your team?"' },
    ],
  },

  'fin-advisor-training-completion': {
    id: 'fin-advisor-training-completion',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You own training and compliance-education video for financial advisors. The content is scattered and hard to find on the job, and you have to prove compliance-training completion to auditors with reporting that's currently manual. You're warm and pragmatic, and you don't want to rip out your LMS — you want a better video layer.
The BDR is calling from Vbrick. Lean in on completion rates and audit-ready reporting.`,
    hardModeContext: '',
    title: 'Financial Services — Advisor Training & Completion',
    subtitle:
      'An advisor-learning leader who must prove compliance-training completion. Sell the governed CMS + reporting, layered onto their LMS, not replacing it.',
    estimatedMinutes: 4,
    defaultPersonaId: 'fin-fidelity-ld',
    defaultAccent: 'general',
    difficultyScore: 2,
    whyVbrickFits:
      'Vbrick Rev is a governed video CMS — branded portal, channels/playlists, fine-grained permissions, retention rules — with AI that makes everything searchable and reporting on who watched what. It layers onto an existing LMS rather than replacing it.',
    repGoal: 'Book a 20-minute call on a governed, searchable advisor-training library with completion reporting.',
    desiredOutcome: 'A scheduled scoping/demo call.',
    openingContinuation:
      "We help advisor-training teams get their video into one governed, searchable place — and prove who actually completed compliance training, without ripping out the LMS. Is that a problem you have?",
    prospectTone: 'Warm, pragmatic, outcomes-focused; protective of the existing LMS.',
    likelyProspectResponses: [
      "We already have an LMS.",
      "Compliance training has to be auditable.",
      "Is this just a video library?",
      "How does it prove completion to a regulator?",
      "Our advisors can't find training on the job.",
      "If it works with what we have, I'm listening.",
    ],
    strongRepResponses: [
      "It's not a rip-and-replace — Vbrick layers onto your LMS as the video layer, so you keep what works.",
      "Everything lives in one governed, searchable portal, so advisors actually find the training on the job.",
      "And you get reporting on who watched what — the completion evidence auditors want, without the manual pull.",
      "Permissions and retention are baked in, so the compliance side is governed by default.",
    ],
    weakRepResponses: [
      "Yeah, we can store your training videos.",
      "It's basically a YouTube for advisors.",
      "We can probably do completion reporting, I'd check.",
    ],
    coachingNote:
      "This is a warm, high-intent buyer — the risk is under-selling. Don't pitch 'replace your LMS'; pitch a better video layer on top. Tie everything to two outcomes she owns: advisors finding training, and provable completion for auditors. Just don't fumble the LMS-integration point and ask for a short call.",
    topMistakes: [
      "Threatening to replace the LMS instead of layering onto it.",
      "Reducing a governed CMS to 'video storage.'",
      "Not connecting to provable completion for auditors.",
    ],
    topWinMoves: [
      "Positioning as a video layer on the existing LMS.",
      "Tying the library to advisors finding training on the job.",
      "Connecting reporting to audit-ready completion evidence.",
    ],
    winningPathBeats: [
      {
        beat: 'Open on the outcome',
        goal: 'Lead with findable training + provable completion.',
        idealLine:
          "We help advisor-training teams get video into one searchable place and prove who completed compliance training — without ripping out the LMS. That you?",
      },
      {
        beat: 'Protect the LMS',
        goal: 'Remove the rip-and-replace fear.',
        idealLine:
          "It layers onto your LMS as the video layer, so you keep what works and just fix the video experience.",
      },
      {
        beat: 'Reporting auditors accept',
        goal: 'Tie to the compliance burden.',
        idealLine:
          "You get reporting on who watched what — the completion evidence auditors want, without the manual pull.",
      },
      {
        beat: 'Close',
        goal: 'Book a scoping/demo call.',
        idealLine:
          "Let's grab 20 minutes to sketch the library and the reporting against your LMS — would later this week work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Great — hoping you could help me out for a moment."' },
      { label: '3. Qualification', hint: '"Are you the person driving advisor training or compliance education?"' },
      { label: '4. Value prop', hint: '"One governed, searchable library + provable completion — layered on your LMS, not replacing it."' },
      { label: '5. Map value', hint: 'Findable training on the job; reporting auditors accept; permissions + retention baked in.' },
      { label: '6. Soft close', hint: '"20 minutes to sketch the library and reporting against your LMS?"' },
    ],
  },

  'fin-servicenow-ai-bank': {
    id: 'fin-servicenow-ai-bank',
    track: 'easy',
    scenarioContext: `CALL CONTEXT:
You run a cloud-native, ServiceNow-heavy environment at a bank and partner on its AI tooling. You've been burned by "integrations" that broke on upgrade, so "certified" matters to you. The recorded knowledge across the bank is invisible to the AI agents you're building, and the metrics you care about are case deflection and resolution time.
The BDR is calling from Vbrick. Lean in on certified integrations and AI-readiness.`,
    hardModeContext: '',
    title: 'Financial Services — Certified ServiceNow / AI Layer',
    subtitle:
      'A ServiceNow-heavy bank building AI agents. Sell the only certified video app in the ServiceNow Store — powering Now Assist — plus the MCP server feeding the agents they already run.',
    estimatedMinutes: 4,
    defaultPersonaId: 'fin-capitalone-workplace',
    defaultAccent: 'general',
    difficultyScore: 3,
    whyVbrickFits:
      'Vbrick is the only certified video app in the ServiceNow Store and powers Now Assist with video intelligence; its MCP server exposes video as a data layer to AI agents and systems (Copilot, ServiceNow Now Assist, Salesforce) — turning recorded knowledge into deflection and faster resolution.',
    repGoal: 'Book a 20-minute call with the ServiceNow platform owner + digital workplace.',
    desiredOutcome: 'A scheduled call tied to their ServiceNow / AI roadmap.',
    openingContinuation:
      "You're deep in ServiceNow — we're the only certified video app in the ServiceNow Store, and we feed Now Assist so recorded knowledge shows up right in the agent workflow. Is improving case deflection or resolution a priority?",
    prospectTone: 'Friendly, ServiceNow-fluent, protective of the stack; wants integration proof.',
    likelyProspectResponses: [
      "Is this actually certified for ServiceNow or just 'integrates with'?",
      "We don't bolt random things onto our stack.",
      "How does video help an agent close a case faster?",
      "Our copilots already search docs and tickets.",
      "We've been burned by integrations that broke on upgrade.",
      "Certified? Okay, keep going.",
    ],
    strongRepResponses: [
      "Certified, not 'integrates with' — we're the only certified video app in the ServiceNow Store, so it's tested against the platform and survives your upgrades.",
      "Now Assist can surface the exact 90-second clip that resolves a ticket, right in the agent's flow — that's deflection and faster resolution without leaving ServiceNow.",
      "Your copilots search docs and tickets but are blind to recorded knowledge — our MCP server exposes that video to the agents you're already building.",
      "It feeds Copilot, ServiceNow Now Assist, and Salesforce out of the box — one connection, not a maintenance burden.",
    ],
    weakRepResponses: [
      "Yeah, we integrate with ServiceNow, it's great.",
      "Video just makes everything better.",
      "Not sure who owns it on your side, you tell me.",
    ],
    coachingNote:
      "With a ServiceNow-committed bank, 'certified' is the magic word — it answers the upgrade-fragility scar tissue. Tie video to a metric they own (deflection, resolution time), and name the MCP server as the way recorded knowledge reaches the agents they're building. You don't need perfection — just lead with certified and ask for a short call.",
    topMistakes: [
      "Saying 'integrates with' instead of 'certified in the Store.'",
      "Not connecting video to a support metric.",
      "Skipping the MCP / AI-readiness angle for a ServiceNow-heavy bank.",
    ],
    topWinMoves: [
      "Leading with 'only certified video app in the ServiceNow Store.'",
      "Tying Now Assist to deflection / resolution time.",
      "Naming the MCP server as the bridge to the agents they're building.",
    ],
    winningPathBeats: [
      {
        beat: 'Lead with certified',
        goal: 'Earn credibility with the ServiceNow claim.',
        idealLine:
          "You're deep in ServiceNow — we're the only certified video app in the Store, and we power Now Assist with video intelligence in the agent workflow.",
      },
      {
        beat: 'Tie to a metric',
        goal: 'Connect video to deflection / resolution.',
        idealLine:
          "Now Assist can surface the 90-second clip that resolves a ticket — deflection and faster resolution without leaving ServiceNow.",
      },
      {
        beat: 'Name the AI bridge',
        goal: 'Show the MCP value for agents they’re building.',
        idealLine:
          "Your copilots are blind to recorded knowledge — our MCP server exposes that video to the agents you're already building, one connection.",
      },
      {
        beat: 'Close',
        goal: 'Book a call with the platform owner.',
        idealLine:
          "Let's get your ServiceNow owner on a 20-minute call to map it to your roadmap — would later this week work?",
      },
    ],
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Help request', hint: '"Hoping you can help me out quickly."' },
      { label: '3. Qualification', hint: '"Are you involved with your ServiceNow platform or digital workplace?"' },
      { label: '4. Value prop', hint: '"Only certified video app in the ServiceNow Store — powers Now Assist. Deflection a priority?"' },
      { label: '5. Metric + MCP', hint: 'Certified survives upgrades; Now Assist surfaces the fix clip; MCP feeds the agents you\'re building.' },
      { label: '6. Soft close', hint: '"20 minutes with your ServiceNow owner to map it?"' },
    ],
  },
}

export function getScenarioById(id: string | null | undefined): SparringScenario | null {
  if (!id) return null
  return SPARRING_SCENARIOS[id] ?? null
}
