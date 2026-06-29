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


  // === EASY TRACK — UNIVERSITY / HIGHER-ED SCENARIOS ===
  'edu-lecture-capture-lms': {
    id: 'edu-lecture-capture-lms',
    title: 'Lecture Capture Faculty Actually Like',
    subtitle: 'Pitch Vbrick Rev for simplified recording + native Canvas integration at ASU scale',
    estimatedMinutes: 3,
    defaultPersonaId: 'edu-asu-online',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT:
You are a Vbrick BDR calling Rachel Nguyen, Director of Online Learning Technology at Arizona State University. ASU serves 80,000+ students, heavily online, and runs lecture capture at massive scale.

Rachel's known pain: faculty skip the recording workflow because it has too many steps. Canvas LTI integration breaks mid-semester and she fields the support tickets herself.

Your goal: earn 20 minutes to show her how Vbrick Rev integrates natively with Canvas, cuts the recording workflow to one click, and scales reliably for ASU's online volume. Vbrick's AI auto-titles, chapters, and tags every recording so the library stays searchable.

This is an outbound cold call. Rachel does not know Vbrick well. She picked up — do your job.`,
    hardModeContext: '',
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Ask for help', hint: 'Be brief and honest: "I work with university video teams — did I catch you at a bad time?"' },
      { label: '3. Qualify the pain', hint: 'Ask one open question about their setup: "How is your faculty recording workflow going these days?"' },
      { label: '4. Land one value prop', hint: 'Tie Vbrick to their pain: "We cut the recording workflow to one click inside Canvas — faculty just hit record and it posts automatically."' },
      { label: '5. Handle the brush-off', hint: `If she says she has Kaltura: "Totally — we come up a lot at renewal. Our Canvas integration tends to be the thing people notice first."` },
      { label: '6. Soft close for 20 minutes', hint: `"I could send a one-pager, but honestly I'd give you a lot more in a quick 20-minute call — would you be open to that?"` },
    ],
    difficultyScore: 2,
    whyVbrickFits: 'Vbrick Rev integrates natively with Canvas via LTI, reduces faculty recording to a single click, and delivers reliably at ASU online scale. AI auto-tagging and chaptering keeps the growing library searchable without manual effort from instructors or staff.',
    repGoal: 'Book a 20-minute discovery call with Rachel to demo Canvas integration and AI library search.',
    desiredOutcome: 'Rachel agrees to a 20-minute call next week.',
    openingContinuation: `Rachel says "Hello?" — you are live.`,
    prospectTone: 'Warm but busy. She will give you 60 seconds before she decides whether to stay on.',
    likelyProspectResponses: [
      `"We already have Kaltura — we're mid-contract."`,
      `"Faculty keep skipping the workflow. It's honestly a headache."`,
      `"What does Vbrick do differently from what we have?"`,
      `"Does it actually work with Canvas or is it one of those integrations that breaks?"`,
      `"I'd need faculty involved before I can evaluate anything."`,
      `"Send me something and I'll take a look."`,
    ],
    strongRepResponses: [
      `"That makes sense — a lot of schools are mid-contract when we talk. Our Canvas integration is usually what gets people curious. Can I ask — how many clicks does it take your faculty to post a recording right now?"`,
      `"Totally hear you on faculty buy-in. What if we started with just 20 minutes for you, so you can decide if it is worth their time?"`,
      `"Fair question on the integration. Ours is native LTI — recordings show up in Canvas automatically, no extra step for faculty. Would 20 minutes to see it live be worth it?"`,
      `"Happy to send something. Though honestly a quick call gives you more than a PDF. Would 20 minutes next week work?"`,
    ],
    weakRepResponses: [
      `"Vbrick Rev is a cloud-native AI enterprise video platform with full eCDN and FedRAMP certification..." (too much, too soon)`,
      `"Can I get 45 minutes with you and your faculty team?" (too big an ask too fast)`,
      `"When can your team meet?" (skipped building any rapport)`,
    ],
    coachingNote: 'Lead with the pain you know — faculty workflow friction — not the product. One relevant question earns more than three features listed back-to-back.',
    topMistakes: [
      'Launching into a feature list before confirming the pain is real for her',
      'Asking for too much time too early — 45 minutes or a full team demo on a cold call',
      'Folding when she mentions Kaltura instead of bridging naturally to renewal timing',
    ],
    topWinMoves: [
      'Ask one specific pain question — "how many clicks does faculty recording take?" — to open the conversation',
      'Bridge the Kaltura objection to renewal timing naturally, without sounding defensive',
      'Close for exactly 20 minutes and frame it as more valuable than a PDF',
    ],
    winningPathBeats: [
      { beat: 'Warm opener', goal: 'Get 30 seconds', idealLine: `"Hi, this is [Name] from Vbrick — did I catch you at an okay time? I work with university video teams and wanted to ask one quick question."` },
      { beat: 'Pain probe', goal: 'Surface the faculty workflow problem', idealLine: `"How is your faculty recording experience these days — are they actually using the tool or skipping it?"` },
      { beat: 'Relevant value prop', goal: 'Connect Vbrick to her pain', idealLine: `"That is exactly where we come in. We cut the recording workflow to one click inside Canvas — faculty hit record and it is posted and searchable automatically."` },
      { beat: 'Soft close', goal: 'Book 20 minutes', idealLine: `"I could send you something, but honestly I would give you a lot more in a quick 20-minute call — would you be open to that next week?"` },
    ],
    track: 'easy',
  },

  'edu-accessibility-captions': {
    id: 'edu-accessibility-captions',
    title: 'Captions That Pass the Campus Audit',
    subtitle: 'Pitch Vbrick auto-captioning (100+ languages, Section 508) to a compliance-driven lead at UMich',
    estimatedMinutes: 3,
    defaultPersonaId: 'edu-umich-accessibility',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT:
You are a Vbrick BDR calling Marcus Ellis, Accessibility & Academic Technology Lead at the University of Michigan. UMich is an R1 research university where WCAG 2.1 AA and Section 508 compliance are non-negotiable.

Marcus's known pain: auto-captions on lecture recordings average around 85-88% accuracy — far below the ADA office threshold. A campus accessibility audit is roughly 90 days out. He is quietly under pressure.

Your goal: earn 20 minutes to show Marcus how Vbrick Rev delivers high-accuracy auto-captioning with transcription and translation in 100+ languages, and how the compliance reporting gives him documented audit evidence.

Vbrick holds SOC 2 Type II and is GDPR-compliant. Lead with caption accuracy and language coverage. FedRAMP is not your lead here — that is a government differentiator.`,
    hardModeContext: '',
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Ask for help', hint: '"I work with university accessibility and academic tech teams — do you have 30 seconds?"' },
      { label: '3. Qualify the pain', hint: 'Ask: "How is your lecture caption accuracy holding up right now — is it meeting your WCAG threshold?"' },
      { label: '4. Land one value prop', hint: '"We specialize in high-accuracy auto-captioning with transcription and translation across 100+ languages — built for compliance audits, not just checkbox captions."' },
      { label: '5. Handle the objection', hint: `If he asks how you're different: "Most built-in caption tools hover in the mid-80s on accuracy. Ours are built to 508 standards and we give you the completion and accuracy reports to back it up in an audit."` },
      { label: '6. Soft close for 20 minutes', hint: '"Given your audit timeline, a 20-minute call might be worth your time now rather than later — would that work?"' },
    ],
    difficultyScore: 2,
    whyVbrickFits: 'Vbrick Rev delivers high-accuracy auto-captioning with transcription and translation in 100+ languages. Built-in completion and engagement reporting gives accessibility teams documented evidence for compliance audits. SOC 2 Type II certified and GDPR-compliant.',
    repGoal: 'Book a 20-minute call with Marcus to discuss caption accuracy, audit documentation, and language coverage.',
    desiredOutcome: 'Marcus agrees to a 20-minute call and asks for a calendar invite.',
    openingContinuation: `Marcus picks up at his Ann Arbor office. "Hello?"`,
    prospectTone: 'Measured and thoughtful. He will give you a real shot if you speak his language — compliance, accuracy, documented evidence.',
    likelyProspectResponses: [
      `"We have captioning built into our LMS already."`,
      `"How do I know your captions are actually more accurate than what we have?"`,
      `"What languages do you support?"`,
      `"I'd need to loop in our ADA office before evaluating anything."`,
      `"We actually have an accessibility audit coming up — timing is not terrible for this conversation."`,
      `"Send me something and I'll review it."`,
    ],
    strongRepResponses: [
      `"Totally — LMS captions are a start. The gap we usually see is accuracy. What is your current caption accuracy sitting at? The ADA threshold tends to require 98% or above."`,
      `"Fair. Our captions are built to 508 standards and we can show you accuracy benchmarks on real lecture content — that is usually more convincing than any spec sheet."`,
      `"We cover 100+ languages — Arabic, Mandarin, Spanish, French, and many more. Full transcription and translation, not just English auto-captions."`,
      `"Given you have an audit in 90 days, a 20-minute call now might save you a bigger scramble later — would that be worth your time?"`,
    ],
    weakRepResponses: [
      `"Vbrick is FedRAMP-certified, which means we meet government security standards..." (wrong differentiator for a university accessibility lead)`,
      `"We have the best captions in the market." (vague claim with no evidence)`,
      `"Let me send you our full compliance documentation package." (too much paperwork too soon, buries the lead)`,
    ],
    coachingNote: 'Compliance buyers want evidence, not claims. One specific metric — 98% accuracy threshold, Section 508, 100+ languages — is worth ten feature bullets. Tie your ask directly to his audit deadline.',
    topMistakes: [
      'Leading with FedRAMP (a government credential) to a university accessibility professional',
      'Claiming superior captions without offering a benchmark or specific accuracy figure',
      'Ignoring the 90-day audit window — that is your strongest natural hook',
    ],
    topWinMoves: [
      'Ask about current caption accuracy directly — "what is your 508 threshold right now?"',
      'Name 100+ language transcription and translation specifically — it differentiates from LMS built-in tools',
      'Tie the close to his audit deadline for natural urgency without manufactured pressure',
    ],
    winningPathBeats: [
      { beat: 'Warm opener', goal: 'Get 30 seconds', idealLine: `"Hi, this is [Name] from Vbrick — I work with university accessibility teams. Do you have 30 seconds? Quick question about your lecture caption setup."` },
      { beat: 'Pain probe', goal: 'Surface the accuracy gap', idealLine: `"How is your current caption accuracy holding up? A lot of schools we talk to are hovering in the mid-80s, which tends to be a problem when audit season comes around."` },
      { beat: 'Value prop and differentiator', goal: 'Establish credibility with specifics', idealLine: `"We build to 508 standards with 100+ language transcription and translation — and we give you the compliance reporting to document it for an audit, not just the captions themselves."` },
      { beat: 'Soft close tied to deadline', goal: 'Book 20 minutes', idealLine: `"Given you have an audit coming up, a 20-minute call might be worth it now rather than later — would that work?"` },
    ],
    track: 'easy',
  },

  'edu-hybrid-broadcast-scale': {
    id: 'edu-hybrid-broadcast-scale',
    title: 'Hybrid Classes Without the Buffering',
    subtitle: 'Pitch Vbrick eCDN for reliable multi-campus hybrid delivery across Penn State',
    estimatedMinutes: 3,
    defaultPersonaId: 'edu-pennstate-avp',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT:
You are a Vbrick BDR calling David Chen, Associate VP of Teaching & Learning Technology at Penn State University. Penn State runs University Park (main campus) plus 19 Commonwealth campuses across Pennsylvania.

David's known pain: hybrid class broadcasts buffer or drop quality at smaller Commonwealth campuses that have limited bandwidth. Students at Hazleton, DuBois, and other sites miss lecture content. He just finished a call with the DuBois IT director about another buffering incident.

Your goal: earn 20 minutes to discuss how Vbrick's eCDN — the only platform with all three eCDN technologies (peer-to-peer, edge caching, multicast) from one vendor — delivers reliable broadcast quality to every Penn State campus without saturating limited pipes.`,
    hardModeContext: '',
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Ask for help', hint: '"I work with universities managing video delivery across multiple campuses — got 30 seconds?"' },
      { label: '3. Qualify the pain', hint: '"How is your hybrid class video holding up at your Commonwealth campuses — are students getting a consistent experience everywhere?"' },
      { label: '4. Land the eCDN value prop', hint: '"Vbrick is the only platform with all three eCDN technologies — peer-to-peer, edge caching, and multicast — from one vendor. We keep bandwidth use low even when thousands of students hit the stream at once."' },
      { label: '5. Handle the objection', hint: `If he says he needs his network team involved: "Of course — that makes total sense. Most network teams actually like the eCDN story because it reduces their load, not adds to it. Would it make sense to start with just 20 minutes for you first?"` },
      { label: '6. Soft close for 20 minutes', hint: `"I would give you a lot more in 20 minutes than I can explain on a cold call — would that be worth it?"` },
    ],
    difficultyScore: 2,
    whyVbrickFits: `Vbrick is the only enterprise video platform offering all three eCDN technologies — peer-to-peer, edge caching, and multicast — from a single vendor. This dramatically reduces bandwidth consumption and delivers consistent quality to bandwidth-constrained campuses without requiring network infrastructure upgrades.`,
    repGoal: 'Book a 20-minute discovery call with David to walk through Vbrick eCDN for multi-campus delivery.',
    desiredOutcome: 'David agrees to a 20-minute call and mentions he might loop in his network team.',
    openingContinuation: `David picks up at his University Park office. He sounds a little tired. "Hello?"`,
    prospectTone: 'Collegial and senior. He will engage if you sound like you understand multi-campus complexity and do not waste his time.',
    likelyProspectResponses: [
      `"We're mid-contract with our current provider."`,
      `"Our Commonwealth campuses do struggle with buffering, honestly."`,
      `"What exactly is eCDN — is that different from a regular CDN?"`,
      `"I'd have to loop in our network team for anything like that."`,
      `"Penn State IT has a long procurement cycle — this is not a quick decision."`,
      `"Send me something and I'll look at it when I have a moment."`,
    ],
    strongRepResponses: [
      `"Totally — we come up a lot at renewal. But the buffering problem at your smaller campuses is something eCDN addresses without waiting for a full procurement. Can I ask — how often are your Commonwealth students losing quality during class?"`,
      `"Great question on eCDN. It is smart delivery that routes video intelligently across your network so you are not hammering limited campus pipes. We are the only vendor with all three technologies in one platform."`,
      `"Makes sense to loop in networking. Most network teams actually love this conversation because eCDN reduces their load. Would it make sense to start with just 20 minutes for you first?"`,
      `"I get it — Penn State IT moves carefully and that is smart. A 20-minute call now just helps you decide if it is worth putting us in the pipeline."`,
    ],
    weakRepResponses: [
      `"Vbrick is a cloud-native AI Enterprise Video Platform with FedRAMP certification and SOC 2 Type II..." (wrong lead for a multi-campus delivery pain point)`,
      `"Can we get your whole IT team on a call this week?" (too big an ask on a cold call)`,
      `"Our eCDN is industry-leading." (vague, no specifics)`,
    ],
    coachingNote: 'eCDN is a technical concept — earn the right to explain it by confirming the pain first. "Are students at your smaller campuses getting a consistent experience?" is a better opener than any product description.',
    topMistakes: [
      'Explaining eCDN before confirming the multi-campus buffering pain',
      'Asking for the full IT team on the first call instead of starting small',
      'Leading with FedRAMP or security certifications — irrelevant to a multi-campus delivery problem',
    ],
    topWinMoves: [
      'Ask about the Commonwealth campus experience specifically — not just "universities generally"',
      'Define eCDN in plain language when he asks: "smart delivery that routes video across your network so you do not hammer limited campus bandwidth"',
      'Offer 20 minutes just for him first — lower bar than bringing in the full network team immediately',
    ],
    winningPathBeats: [
      { beat: 'Warm opener', goal: 'Get 30 seconds', idealLine: `"Hi, this is [Name] from Vbrick — I work with multi-campus universities on video delivery. Do you have 30 seconds? One quick question."` },
      { beat: 'Pain probe', goal: 'Surface the Commonwealth campus buffering problem', idealLine: `"How is hybrid class quality holding up at your smaller campuses — are students getting the same experience in Hazleton or DuBois as they do at University Park?"` },
      { beat: 'eCDN value prop', goal: 'Differentiate Vbrick clearly in plain language', idealLine: `"That is exactly where we come in. We are the only platform with all three eCDN technologies — peer-to-peer, edge caching, and multicast — from one vendor. We keep the stream reliable without upgrading campus pipes."` },
      { beat: 'Soft close', goal: 'Book 20 minutes', idealLine: `"Would 20 minutes be worth it to see how this works at multi-campus scale? I would rather show you than try to explain it on a cold call."` },
    ],
    track: 'easy',
  },

  'edu-searchable-library-ai': {
    id: 'edu-searchable-library-ai',
    title: 'Make the Lecture Library Searchable — and Replace the Incumbent',
    subtitle: 'Pitch Vbrick Smart Search + AI privacy to a UT Austin director evaluating Panopto renewal',
    estimatedMinutes: 4,
    defaultPersonaId: 'edu-utaustin-acadtech',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT:
You are a Vbrick BDR calling Sofia Martinez, Director of Academic Technology at the University of Texas at Austin. UT Austin is a top-tier R1 research university with a large and growing lecture capture library.

Sofia's known pain: her Panopto contract is up for renewal and cost has crept up roughly 30% over three years. The library is enormous and nearly unsearchable — faculty record but nobody can find content afterward. The incumbent AI features feel bolted-on and weak.

She is in active evaluation mode. She will ask for peer R1 references. She cares deeply about data privacy — an AI that never trains on UT data is a key differentiator.

Your goal: earn 20 minutes to show her Vbrick's AI Smart Search, auto-titling/chaptering/tagging, and the privacy guarantee — and position Vbrick as the renewal alternative worth evaluating.`,
    hardModeContext: '',
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Ask for help', hint: '"I work with R1 universities evaluating their video platforms — do you have 30 seconds for one question?"' },
      { label: '3. Qualify the pain', hint: '"How searchable is your lecture library right now — can faculty actually find specific content, or is it basically a growing archive nobody can navigate?"' },
      { label: '4. Land the AI and privacy value prop', hint: '"Our AI does semantic search across the entire library — reads what was said AND what was shown on screen — and it never trains on your institutional data. Runs on AWS Bedrock with RAG."' },
      { label: '5. Handle the peer reference ask', hint: '"Totally fair — we work with R1 institutions at comparable scale and I would rather give you names on a call than in a cold email. Would 20 minutes be worth it?"' },
      { label: '6. Soft close for 20 minutes', hint: '"Given your renewal window, 20 minutes now could save you a lot of time later — would that work?"' },
    ],
    difficultyScore: 2,
    whyVbrickFits: 'Vbrick Rev AI delivers semantic Smart Search across the full video library — reading what was said AND what was shown — with native auto-titling, chapters, summaries, and tags on every recording. The AI runs on AWS Bedrock with RAG and never trains on customer data. Proven at R1 scale for institutions evaluating incumbent renewals.',
    repGoal: 'Book a 20-minute discovery call with Sofia focused on AI search and renewal alternatives.',
    desiredOutcome: 'Sofia agrees to 20 minutes and asks you to send something before the call.',
    openingContinuation: `Sofia picks up at her UT Austin office, fresh off opening a renewal quote. "Hello?"`,
    prospectTone: 'Sharp and in evaluation mode. She is curious but will probe. Respond to specifics with specifics.',
    likelyProspectResponses: [
      `"We have been with our current vendor for six years."`,
      `"The library is pretty unsearchable, honestly — that has been a frustration for a while."`,
      `"Does your AI train on our data? That is a real concern for us."`,
      `"Who else at an R1 is using this? I want peer references before I go any further."`,
      `"Switching is painful. Migration costs are real and I have been through one before."`,
      `"Send me something — I am actually in evaluation mode right now."`,
    ],
    strongRepResponses: [
      `"Six years is a long run. A lot of schools that come to us are mid-evaluation after a renewal price jump. How are things sitting — happy with what you have, or looking around?"`,
      `"The unsearchable library is the number-one thing we hear from R1 schools. Our AI does semantic search — reads what was said and what was shown on screen — and auto-titles, chapters, and tags everything automatically."`,
      `"Our AI never trains on your institutional data. Zero. It runs on AWS Bedrock with RAG — retrieval-augmented generation. Your content stays yours, always."`,
      `"Fair on references — I would rather give you names on a call than drop them in a cold email. Would 20 minutes be worth it? Given your renewal timeline, now is a good time to at least see what is out there."`,
    ],
    weakRepResponses: [
      `"Vbrick has FedRAMP certification and SOC 2 Type II compliance..." (wrong lead for a higher ed renewal conversation)`,
      `"Our AI is the best in the market." (no specifics, no evidence)`,
      `"We can migrate everything for free." (not established, overshooting commitment on a cold call)`,
    ],
    coachingNote: 'Sofia is in evaluation mode — she is actually receptive. Do not over-sell. Surface the unsearchable library pain, state the AI privacy guarantee clearly and proactively, and ask for 20 minutes. She will ask about peer references — bridge that ask to the meeting rather than trying to satisfy it on the cold call.',
    topMistakes: [
      'Opening with security certifications before confirming the renewal and library search pain',
      'Being vague on the AI privacy guarantee — say "never trains on your data" explicitly and early',
      'Trying to name specific R1 references on the cold call instead of bridging that ask to a meeting',
    ],
    topWinMoves: [
      'Ask about library searchability first — it is the pain she privately admitted before you called',
      'Lead with the privacy guarantee proactively before she asks — it signals you did your homework',
      'Bridge the R1 reference request to the meeting rather than trying to satisfy it on the cold call',
    ],
    winningPathBeats: [
      { beat: 'Warm opener', goal: 'Get 30 seconds', idealLine: `"Hi, this is [Name] from Vbrick — I work with R1 universities looking at their video library setup. Do you have 30 seconds? One quick question."` },
      { beat: 'Pain probe', goal: 'Confirm the unsearchable library problem', idealLine: `"How searchable is your lecture archive right now — can faculty actually find a specific clip from three semesters ago, or is it basically a pile of recordings growing every semester?"` },
      { beat: 'AI and privacy value prop', goal: 'Land the differentiator with specifics', idealLine: `"That is exactly where our AI comes in. Semantic search across the entire library — reads what was said and what was shown — auto-titles and chapters everything, and it never trains on your institutional data. Runs on AWS Bedrock with RAG."` },
      { beat: 'Soft close', goal: 'Book 20 minutes and bridge the references ask', idealLine: `"Given your renewal window, it is worth 20 minutes to see what the alternative looks like. I can bring peer R1 references to the call. Would that work?"` },
    ],
    track: 'easy',
  },

  'edu-global-multilingual': {
    id: 'edu-global-multilingual',
    title: "Consistent Learning Across NYU's Global Campuses",
    subtitle: 'Pitch Vbrick multilingual delivery + eCDN for NYU New York, Abu Dhabi, and Shanghai',
    estimatedMinutes: 3,
    defaultPersonaId: 'edu-nyu-global',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT:
You are a Vbrick BDR calling Priya Kapoor, Director of Global Learning Technology at New York University. NYU operates three portal campuses: New York, Abu Dhabi, and Shanghai.

Priya's known pain: video streams poorly at NYU Abu Dhabi and NYU Shanghai due to network latency. A recent provost all-hands suffered buffering complaints from both global campuses — embarrassing at the leadership level. Caption and translation coverage is English-centric, underserving NYU's diverse international student body. Data residency for China and UAE is also on her radar.

Your goal: earn 20 minutes to discuss how Vbrick's eCDN delivers reliable video to far campuses and how transcription and translation in 100+ languages serves NYU's multilingual student population.`,
    hardModeContext: '',
    cheatCard: [
      { label: '1. Greet + introduce yourself', hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").' },
      { label: '2. Ask for help', hint: '"I work with universities managing video across global campuses — do you have 30 seconds?"' },
      { label: '3. Qualify the pain', hint: '"How is your video quality holding up at your Abu Dhabi and Shanghai campuses — are students there getting the same experience as in New York?"' },
      { label: '4. Land the global value prop', hint: '"Vbrick is built for global delivery — our eCDN handles latency to far campuses, and we do transcription and translation in 100+ languages so your international students are covered wherever they are."' },
      { label: '5. Handle the incumbent objection', hint: `If she says she already has Panopto: "A lot of global schools keep those for basic recording but hit a wall on delivery quality to far campuses and multilingual coverage. Is that where you are feeling the gap?"` },
      { label: '6. Soft close for 20 minutes', hint: `"Would 20 minutes be worth it to walk through how we handle global delivery? I would rather show you than pitch you on a cold call."` },
    ],
    difficultyScore: 2,
    whyVbrickFits: 'Vbrick Rev delivers reliable video to globally distributed campuses via eCDN (peer-to-peer, edge caching, multicast). Transcription and translation in 100+ languages serves multilingual international student populations. SOC 2 Type II and GDPR-compliant with strong data governance relevant to multi-jurisdiction deployments.',
    repGoal: 'Book a 20-minute discovery call with Priya to discuss global eCDN delivery and multilingual caption and translation coverage.',
    desiredOutcome: 'Priya agrees to 20 minutes and asks you to send a calendar invite.',
    openingContinuation: `Priya picks up at her New York office after a global campus sync. "Hello?"`,
    prospectTone: 'Warm but purposeful. She is open to better solutions after the provost buffering incident.',
    likelyProspectResponses: [
      `"We already have Panopto globally — it works fine for recording."`,
      `"Abu Dhabi and Shanghai do struggle with buffering. The provost all-hands was honestly embarrassing."`,
      `"What languages do you support for captions and translation?"`,
      `"Data residency is a real concern for us in China and UAE — we cannot just put everything on a US server."`,
      `"Getting buy-in across three campus cultures and time zones is complicated."`,
      `"Send me a calendar invite — 20 minutes is fine."`,
    ],
    strongRepResponses: [
      `"Totally — Panopto covers recording well. The gap we usually hear about globally is delivery quality to far campuses. Is Abu Dhabi and Shanghai where you are feeling that most?"`,
      `"We cover 100+ languages — Arabic, Mandarin, Spanish, French, and many more. Full transcription and translation, not just English auto-captions."`,
      `"Data residency is something we take seriously — our architecture is SOC 2 Type II and GDPR-compliant, and we can walk through the governance options on a call. Better than trying to explain it here."`,
      `"Would 20 minutes work to see how we handle global delivery and language coverage? I would rather show you than pitch you cold."`,
    ],
    weakRepResponses: [
      `"Vbrick is FedRAMP-certified, which means government-grade security for your global campuses..." (wrong credential for a university global learning director)`,
      `"Our platform is cloud-native and AI-powered with Smart Search and lecture capture..." (too broad, ignores the specific global delivery pain)`,
      `"We can handle your data residency concerns." (vague, no detail, will not land with someone who has dealt with China and UAE compliance)`,
    ],
    coachingNote: 'Global delivery and multilingual coverage are the twin pain points here. Confirm the Abu Dhabi and Shanghai buffering problem first — that is the most emotionally resonant and recent pain. Then add language coverage. Data residency is real — do not dismiss it, but bridge it to the call rather than trying to solve it cold.',
    topMistakes: [
      'Leading with FedRAMP to a university global learning director — irrelevant credential for this buyer',
      'Ignoring the provost buffering incident — that is the most acute and embarrassing recent pain',
      'Being vague on language count — say "100+ languages" specifically, do not say "many languages"',
    ],
    topWinMoves: [
      'Reference Abu Dhabi and Shanghai specifically by name — not just "global campuses"',
      'Name 100+ language transcription and translation as a concrete capability, not a vague feature',
      'Bridge data residency concerns to the call rather than attempting to resolve them on a cold call',
    ],
    winningPathBeats: [
      { beat: 'Warm opener', goal: 'Get 30 seconds', idealLine: `"Hi, this is [Name] from Vbrick — I work with universities managing video across global campuses. Do you have 30 seconds? One quick question."` },
      { beat: 'Pain probe', goal: 'Confirm the Abu Dhabi and Shanghai buffering problem', idealLine: `"How is your video quality at your Abu Dhabi and Shanghai campuses — are students there getting the same experience as in New York, or is delivery a real challenge?"` },
      { beat: 'Global value prop', goal: 'Land eCDN and multilingual together concisely', idealLine: `"That is exactly where we come in. Our eCDN handles latency to far campuses without degrading quality, and we cover transcription and translation in 100+ languages so every student is actually served wherever they are."` },
      { beat: 'Soft close', goal: 'Book 20 minutes', idealLine: `"Would 20 minutes be worth it to walk through global delivery and language coverage? I would rather show you than try to explain it on a cold call."` },
    ],
    track: 'easy',
  },

  // === EASY TRACK — HEALTHCARE SCENARIOS ===
  "hc-clinical-mobile-training": {
    id: "hc-clinical-mobile-training",
    title: "Mobile Training at the Bedside",
    subtitle: "Help Mayo Clinic get clinical training videos to nurses on the floor — governed, mobile-first, completion-tracked.",
    estimatedMinutes: 4,
    defaultPersonaId: "hc-mayo-clinical-ed",
    defaultAccent: "general",
    scenarioContext: `CALL CONTEXT:
You are calling Dr. Sarah Chen, Director of Clinical Education Technology at Mayo Clinic.
Mayo Clinic is a world-class academic medical center — 76,000+ employees across 20+ locations.
Your goal: earn a 20-minute discovery call.

THE PAIN: Nurses and residents cannot reliably access training videos on mobile at the bedside. The current LMS is desktop-first. Clinicians skip training when it is inconvenient, and the completion gap is a credentialing risk.

VBRICK ANGLE: Vbrick Rev is a mobile-friendly, governed video platform with completion tracking, channel-level permissions by specialty, and AI-assisted content tagging. Videos load fast on any device. The platform is the only FedRAMP-certified enterprise video platform — the same security rigor federal agencies require.

YOUR JOB THIS CALL:
- Lead with the pain (mobile access, completion tracking) before introducing the product.
- Ask one qualification question before the value prop.
- Close with a natural, confident ask for a 20-minute call.`,
    hardModeContext: "",
    cheatCard: [
      {
        label: "1. Greet + introduce yourself",
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: "2. Ask for help",
        hint: `"I was hoping you could point me in the right direction — are you still the person who oversees clinical training video at Mayo?"`,
      },
      {
        label: "3. Qualify the pain",
        hint: `"Quick question — are your nurses able to pull up training videos easily on mobile at the bedside, or is that still a headache?"`,
      },
      {
        label: "4. Land the value prop",
        hint: `"We work with academic medical centers to make governed training video actually mobile-friendly — completion tracking, channel-level permissions by specialty, the whole thing."`,
      },
      {
        label: "5. Handle the LMS objection",
        hint: `"Totally fair — most LMSes have video. The gap we usually find is reliable mobile delivery and completion reporting that holds up for credentialing. Is that true for yours?"`,
      },
      {
        label: "6. Soft close",
        hint: `"I could send a one-pager, but honestly I would give you a lot more in a quick 20-minute call — would you be open to that?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: "Vbrick Rev is purpose-built for governed enterprise video. The mobile-first portal, channel-level RBAC, and completion and engagement reporting directly address Mayo Clinic's bedside training gap. AI auto-tagging and semantic Smart Search make content discoverable across a library that grows with every specialty. The FedRAMP certification means IT conversations move faster than with generic platforms.",
    repGoal: "Earn a 20-minute discovery call with Dr. Chen to explore how Vbrick can complement or replace the current LMS for clinical training video delivery.",
    desiredOutcome: "Dr. Chen agrees to a 20-minute call and provides her availability or asks for a calendar invite.",
    openingContinuation: `"Sure, I have a minute. What is this about?"`,
    prospectTone: "Warm and engaged. Will lean in as soon as mobile access or completion tracking is mentioned. Offers a mild LMS objection but it is easy to navigate.",
    likelyProspectResponses: [
      "We do use an LMS for training, so I am not sure what the gap would be.",
      "Mobile is actually something we have been trying to fix — what does Vbrick do differently?",
      "How does completion tracking work — is it tied to our credentialing system?",
      "Can clinicians access it without going through VPN?",
      "What kind of hospitals are you working with?",
      "A 20-minute call sounds reasonable — what are you thinking?",
    ],
    strongRepResponses: [
      "Vbrick lets you set completion requirements at the channel level — a surgical team can have a different curriculum than the ICU, all tracked from one dashboard.",
      "Clinicians access it through a branded mobile portal — no VPN required, permissions are handled inside the platform.",
      "We work with academic medical centers at Mayo's scale — libraries over 500TB, tens of thousands of users.",
      "Most LMSes serve video but were not built for reliable mobile delivery on the ward. Vbrick is.",
    ],
    weakRepResponses: [
      "We are the best video platform on the market.",
      "Vbrick does everything your LMS does and more.",
      "We have a lot of healthcare clients — I can send you a case study list.",
    ],
    coachingNote: "The most common mistake here is leading with the product before the pain. Dr. Chen responds to the bedside mobile problem — start there and let her pull you into the product conversation. The LMS objection is a paper tiger; probe it with a question rather than challenging it head-on.",
    topMistakes: [
      "Pitching Vbrick features before asking a single qualification question.",
      "Treating the LMS objection as a blocker instead of a probe opportunity.",
      `Closing aggressively ("Give me 20 minutes this week") rather than naturally.`,
    ],
    topWinMoves: [
      "Open with the mobile and bedside pain as a question, not a statement.",
      "Let Dr. Chen confirm the pain in her own words before introducing Vbrick.",
      "Tie the close directly to the specific pain she just confirmed.",
    ],
    winningPathBeats: [
      {
        beat: "Open",
        goal: "Establish identity and ask for navigation help",
        idealLine: `"Hi, this is [Name] — am I reaching the right person for clinical training video at Mayo?"`,
      },
      {
        beat: "Qualify",
        goal: "Uncover the mobile and completion tracking pain",
        idealLine: `"Quick question — are nurses able to pull training videos on mobile at the bedside without issues, or is that still a gap?"`,
      },
      {
        beat: "Value",
        goal: "Connect Vbrick to the confirmed pain",
        idealLine: `"That is exactly where we work with academic medical centers — mobile-first delivery, completion tracking that holds up for credentialing, channel-level governance by specialty."`,
      },
      {
        beat: "Close",
        goal: "Natural ask for a 20-minute discovery call",
        idealLine: `"I could send a one-pager, but honestly I would give you a lot more in a quick 20-minute call — would you be open to that?"`,
      },
    ],
    track: "easy",
  },

  "hc-hospital-allhands-scale": {
    id: "hc-hospital-allhands-scale",
    title: "All-Hands Without the Meltdown",
    subtitle: "Help Kaiser Permanente run system-wide live events across 39 hospitals without crushing the corporate network.",
    estimatedMinutes: 3,
    defaultPersonaId: "hc-kaiser-comms",
    defaultAccent: "general",
    scenarioContext: `CALL CONTEXT:
You are calling Marcus Williams, Director of Enterprise Communications at Kaiser Permanente.
Kaiser is one of the largest integrated health systems in the US — 300,000+ employees, 39 hospitals, 8 regions.
Your goal: earn a 20-minute discovery call.

THE PAIN: System-wide live events — CEO all-hands, town halls, emergency communications — bring the corporate WAN to its knees. Remote hospitals and rural clinics get buffering and dropouts. Leadership wants more live events; the infrastructure says no.

VBRICK ANGLE: Vbrick Rev is the only enterprise video vendor offering all three eCDN technologies (peer-to-peer, edge caching, multicast) from a single platform. Customers broadcast to tens of thousands simultaneously without straining the WAN. Post-event, AI generates summaries, chapters, and transcripts automatically.

YOUR JOB THIS CALL:
- Lead with the network pain — Marcus responds to that immediately.
- eCDN is the key differentiation; keep the explanation plain ("the stream stays inside your building").
- Close naturally after confirming the pain.`,
    hardModeContext: "",
    cheatCard: [
      {
        label: "1. Greet + introduce yourself",
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: "2. Ask for help",
        hint: `"Quick question — are you still the person who owns large-scale live events at Kaiser?"`,
      },
      {
        label: "3. Qualify the pain",
        hint: `"When you run a system-wide all-hands, do remote hospitals and rural clinics get reliable delivery, or is network strain still an issue?"`,
      },
      {
        label: "4. Land the value prop",
        hint: `"We help health systems broadcast live to tens of thousands simultaneously without any WAN impact — using eCDN technology built specifically for enterprise networks."`,
      },
      {
        label: "5. Handle the IT ownership objection",
        hint: `"Makes sense — most IT teams own the streaming stack. The issue we usually find is that the tools were not built with eCDN. Is that true for what you are running today?"`,
      },
      {
        label: "6. Soft close",
        hint: `"I could send you a quick overview, but honestly a 20-minute call would let me show you the eCDN architecture for Kaiser's footprint — would that be worth your time?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: "Vbrick is the only vendor offering all three eCDN technologies — peer-to-peer, edge caching, and multicast — from a single platform. At Kaiser's scale (300k employees, 39 hospitals, 8 regions), this is the exact problem Vbrick was designed to solve. Customers run over 100 webcasts per month for 115,000 users. Post-event AI handles summaries, chapters, and transcription in 100+ languages automatically.",
    repGoal: "Earn a 20-minute discovery call with Marcus to explore how Vbrick's eCDN can solve Kaiser's live event delivery problem at scale.",
    desiredOutcome: "Marcus agrees to a 20-minute call and gives availability or asks for a calendar invite.",
    openingContinuation: `"Yeah, Marcus here. Make it quick — I am between meetings."`,
    prospectTone: "Pressed for time but pragmatic. Opens up fast when network pain or eCDN is mentioned. Brief, direct responses.",
    likelyProspectResponses: [
      "Network strain is actually a real problem for us — tell me more.",
      "Our IT team handles the streaming side, so I am not sure this is my call.",
      "We just ran an all-hands and three regions buffered out. My CHRO is not happy.",
      "What is eCDN and how is it different from what we are doing now?",
      "How many other health systems at our size are you working with?",
      "Okay, 20 minutes — what does your calendar look like?",
    ],
    strongRepResponses: [
      "eCDN routes the live stream locally inside your network — the video never leaves the building until it has to, so your WAN sees almost zero load even with 50,000 people tuned in.",
      "Vbrick is the only vendor with all three eCDN technologies — peer-to-peer, edge caching, and multicast — so we pick the right one for each site automatically.",
      "We have customers running over 100 webcasts a month for 115,000 users. Kaiser's scale is right in our wheelhouse.",
      "Happy to loop IT in — we have a technical eCDN architecture brief that makes that conversation easy. Would a quick alignment call with you first make sense?",
    ],
    weakRepResponses: [
      "We are the best live streaming platform out there.",
      "You should switch away from whatever you are using now.",
      "eCDN is complicated — let me just send you a brochure.",
    ],
    coachingNote: "Marcus responds to speed and specificity. Do not open with a company overview — lead with the network pain as a question. If he says IT owns streaming, do not retreat; offer to bring IT in after a quick alignment call with Marcus first. The eCDN explanation needs plain language: the stream stays inside your building.",
    topMistakes: [
      "Leading with a company overview instead of the network pain question.",
      `Backing off when Marcus says "IT handles this" instead of offering a path forward.`,
      "Trying to explain all three eCDN types in one breath instead of keeping it simple.",
    ],
    topWinMoves: [
      "Open with the network strain question — let Marcus confirm the pain before explaining anything.",
      `Use the plain-language eCDN summary: "the stream stays inside your building, your WAN barely notices."`,
      "Offer to involve IT after the alignment call — position Marcus as the internal champion.",
    ],
    winningPathBeats: [
      {
        beat: "Open",
        goal: "Establish identity, ask for navigation",
        idealLine: `"Hi, this is [Name] — are you still the person who owns large-scale live events at Kaiser?"`,
      },
      {
        beat: "Qualify",
        goal: "Surface the network strain pain",
        idealLine: `"When you run a system-wide all-hands, are remote hospitals getting clean delivery or is network strain still a problem?"`,
      },
      {
        beat: "Value",
        goal: "Land eCDN in plain language",
        idealLine: `"We help health systems like yours broadcast to tens of thousands simultaneously — the stream stays inside your building, your WAN barely notices."`,
      },
      {
        beat: "Close",
        goal: "Earn the 20-minute call",
        idealLine: `"Would a quick 20-minute call be worth it — I can show you exactly how the eCDN handles Kaiser's footprint?"`,
      },
    ],
    track: "easy",
  },

  "hc-compliance-completion": {
    id: "hc-compliance-completion",
    title: "Prove It to the Auditors",
    subtitle: "Help HCA Healthcare show The Joint Commission that 180+ hospitals completed mandatory compliance training — centrally, automatically.",
    estimatedMinutes: 4,
    defaultPersonaId: "hc-hca-compliance",
    defaultAccent: "general",
    scenarioContext: `CALL CONTEXT:
You are calling Jennifer Torres, Director of Compliance Training at HCA Healthcare.
HCA is one of the largest for-profit hospital systems in the US — 180+ hospitals, 2,000+ care sites, approximately 300,000 employees.
Your goal: earn a 20-minute discovery call.

THE PAIN: Jennifer cannot produce a unified completion report across 180+ hospitals for mandatory compliance modules. Data is siloed by facility. The Joint Commission survey window is two months away. Auditors want proof.

VBRICK ANGLE: Vbrick Rev's governed CMS includes centralized completion and engagement reporting, video retention and expiration rules (outdated content removed automatically), and approval workflows before content goes live. One dashboard. Audit-ready in seconds.

YOUR JOB THIS CALL:
- Lead with the audit and completion pain, not the product.
- The Joint Commission is the external pressure — reference it naturally.
- Retention rules and content expiration are often overlooked but critical for compliance buyers — use them.
- Soft close; she will say yes once completion tracking is clearly connected.`,
    hardModeContext: "",
    cheatCard: [
      {
        label: "1. Greet + introduce yourself",
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: "2. Ask for help",
        hint: `"Quick question — are you still the person overseeing compliance training across HCA's hospitals?"`,
      },
      {
        label: "3. Qualify the pain",
        hint: `"When you need to show completion for a mandatory module across all your facilities — can you pull that from one place, or is it still a manual chase?"`,
      },
      {
        label: "4. Land the value prop",
        hint: `"We give hospital systems a single completion dashboard across every facility — the kind of report you can hand an auditor in 60 seconds."`,
      },
      {
        label: "5. Handle the LMS objection",
        hint: `"Totally fair — most LMSes handle the learning side. The gap we usually find is centralized video completion reporting and automatic content expiration. Is that tracked for you today?"`,
      },
      {
        label: "6. Soft close",
        hint: `"I think there is probably a 20-minute conversation worth having here — would that work given where you are with the survey window?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: "Vbrick's governed CMS gives compliance teams a single completion dashboard across every facility, video-level retention and expiration rules that remove outdated content automatically, and approval workflows before any module goes live. Reporting is audit-ready — exportable, timestamped, tied to individual users. This directly addresses HCA's siloed completion data problem ahead of Joint Commission surveys.",
    repGoal: "Earn a 20-minute discovery call with Jennifer to explore how Vbrick can centralize compliance video completion reporting across HCA's 180+ hospitals.",
    desiredOutcome: "Jennifer agrees to a 20-minute call and provides availability or asks for a calendar invite.",
    openingContinuation: `"This is Jennifer. What can I do for you?"`,
    prospectTone: "Polite, organized, and pressed. Warms up quickly when completion tracking or auditor-readiness is mentioned. Mild LMS objection but it is not a blocker.",
    likelyProspectResponses: [
      "We do use an LMS for compliance training — what would be different here?",
      "Pulling completion across 180 hospitals is honestly a nightmare right now.",
      "We have a Joint Commission survey in two months — timing is not great.",
      "What does the completion report actually look like?",
      "Can this integrate with our existing LMS or does it replace it?",
      "A 20-minute call could work — let me check my calendar.",
    ],
    strongRepResponses: [
      "The dashboard shows every module, every facility, every user — filter by hospital or training track and export it in one click for the auditor.",
      "Built-in expiration rules mean outdated modules are pulled from circulation automatically. No more staff watching last year's version.",
      "We can run alongside your LMS — most customers use Vbrick specifically for the video governance and reporting layer while keeping their LMS for curriculum management.",
      "Two months out from a survey window is actually a good time to have this conversation — setup is fast and the reporting is immediately useful.",
    ],
    weakRepResponses: [
      "Vbrick is better than any LMS on the market.",
      "You should probably replace your LMS with us.",
      "We have tons of healthcare clients — I can send case studies.",
    ],
    coachingNote: "Jennifer's biggest fear is walking into a Joint Commission survey with completion data gaps. Lead with that fear, not with product features. The LMS objection is a probe opportunity — ask if their LMS gives them a cross-facility completion report for video. It almost certainly does not.",
    topMistakes: [
      "Pitching the product before confirming the completion data problem exists.",
      "Treating the LMS objection as a lost cause instead of a probe opportunity.",
      "Missing the expiration and retention angle — that often seals the deal for compliance buyers.",
    ],
    topWinMoves: [
      "Ask the completion-across-facilities question early and let Jennifer confirm the pain in her own words.",
      `Probe the LMS objection: "Does your LMS give you a cross-hospital video completion report today?"`,
      `Tie the close to the survey window: "Two months is a reasonable runway — a 20-minute call would help us figure out if this fits your timeline."`,
    ],
    winningPathBeats: [
      {
        beat: "Open",
        goal: "Establish identity, confirm she owns compliance training",
        idealLine: `"Hi, this is [Name] — are you still the person overseeing compliance training across HCA's facilities?"`,
      },
      {
        beat: "Qualify",
        goal: "Surface the siloed completion data pain",
        idealLine: `"When you need to prove completion for a mandatory module across all your hospitals — is that one report or a manual chase?"`,
      },
      {
        beat: "Value",
        goal: "Land the central dashboard and expiration rules",
        idealLine: `"We give compliance teams a single completion dashboard across every facility — plus automatic expiration so outdated modules disappear from circulation."`,
      },
      {
        beat: "Close",
        goal: "Earn the call with survey-window urgency",
        idealLine: `"Given where you are with the survey window, I think there is a 20-minute conversation worth having — would that work?"`,
      },
    ],
    track: "easy",
  },

  "hc-clinical-knowledge-ai": {
    id: "hc-clinical-knowledge-ai",
    title: "The Retiring Surgeon Problem",
    subtitle: "Help Cleveland Clinic capture clinical expertise on video and make it searchable with AI — without feeding patient data to a model.",
    estimatedMinutes: 4,
    defaultPersonaId: "hc-clevelandclinic-knowledge",
    defaultAccent: "general",
    scenarioContext: `CALL CONTEXT:
You are calling Dr. Robert Park, Director of Knowledge Management at Cleveland Clinic.
Cleveland Clinic is a world-class academic medical center — 70,000+ caregivers, 22 hospitals, a global reputation for clinical innovation.
Your goal: earn a 20-minute discovery call.

THE PAIN: Institutional knowledge walks out the door every time a senior clinician retires. The video library is unsearchable — clinicians give up and ask a colleague instead. The team is curious about AI but deeply worried that clinical content will be used to train a model.

VBRICK ANGLE: Vbrick Rev's AI runs on AWS Bedrock with RAG — it NEVER trains on customer data. Smart Search is semantic (not keyword-based), so a surgeon can search a clinical concept and find the right video. AI auto-generates titles, summaries, chapters, and tags at upload so the library stays organized without manual effort.

CRITICAL: Do NOT say Vbrick is "HIPAA compliant" or "HIPAA certified." Position data safety via the Bedrock and RAG architecture and the explicit guarantee that the AI never trains on customer data.

YOUR JOB THIS CALL:
- The AI data safety question will come early — have the Bedrock and RAG answer ready.
- Smart Search is the core value prop; feature-list selling will lose Dr. Park.
- The retiring-expert narrative is the emotional hook — use it.`,
    hardModeContext: "",
    cheatCard: [
      {
        label: "1. Greet + introduce yourself",
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: "2. Ask for help",
        hint: `"Quick question — are you still the person who owns knowledge management and clinical video at Cleveland Clinic?"`,
      },
      {
        label: "3. Qualify the pain",
        hint: `"When a senior clinician retires or transitions out — is there a reliable way to capture their expertise on video and make it findable, or is that knowledge still at risk of walking out the door?"`,
      },
      {
        label: "4. Land the value prop",
        hint: `"We help academic medical centers turn video into a searchable knowledge base — AI-powered semantic search across the whole library, and the AI never trains on your clinical content."`,
      },
      {
        label: "5. Handle the AI data concern",
        hint: `"Great question — our AI runs on AWS Bedrock with RAG. It reads your content to answer search queries but never fine-tunes on it, never stores it in a shared model. Your clinical video stays yours, period."`,
      },
      {
        label: "6. Soft close",
        hint: `"I think the AI architecture question alone is worth a 20-minute call — would you be open to that so I can walk you through exactly how it works?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: "Vbrick's AI runs on AWS Bedrock with RAG — it never fine-tunes on customer data, so clinical content surfaces answers but is never absorbed into a shared model. Smart Search is semantic rather than keyword-based, solving the give-up-and-ask-a-colleague problem. Auto-generated titles, summaries, and chapters mean the library stays organized as it scales. Fine-grained RBAC enables cross-department discoverability without privacy leakage.",
    repGoal: "Earn a 20-minute discovery call with Dr. Park to explore Vbrick's AI knowledge platform and address his data safety concerns directly.",
    desiredOutcome: "Dr. Park agrees to a 20-minute call, particularly to hear the Bedrock and RAG architecture explanation in more depth.",
    openingContinuation: `"Sure, what is this regarding?"`,
    prospectTone: "Intellectually curious and thoughtful. Will ask about AI data safety within the first two turns. Warms up significantly once the Bedrock and RAG answer is given. Responds well to the retiring-expert narrative.",
    likelyProspectResponses: [
      "Knowledge capture is something we think about a lot — what does your platform actually do?",
      "My first question is always: does the AI train on our clinical content?",
      "Our video library is enormous but nobody can find anything in it.",
      "We tried a knowledge management tool before and nobody used it because search was too basic.",
      "Can you tell me more about how the AI works without using our data?",
      "A 20-minute call to understand the architecture — that actually makes sense.",
    ],
    strongRepResponses: [
      "The AI runs on AWS Bedrock with RAG — it reads your content to surface answers but never fine-tunes on it. Your clinical video trains nothing. Ever.",
      "Smart Search is semantic, not keyword-based — a resident can type a clinical concept and find the right video even if those exact words are never in the title.",
      "At upload, AI auto-generates a title, summary, chapters, and tags — so the library stays organized even as it grows, without manual effort from your team.",
      "The retiring-expert scenario is exactly what we were built for — one recorded session with a surgeon, auto-organized and searchable, available to every resident the next morning.",
    ],
    weakRepResponses: [
      "Our AI is the most advanced in the healthcare space.",
      "Do not worry about the data privacy stuff — it is all secure.",
      "We have a great knowledge management tool — let me send you the brochure.",
    ],
    coachingNote: "Dr. Park's AI data concern is not a blocker — it is an invitation to show you know your product. Nail the Bedrock and RAG answer and he relaxes immediately. After that, Smart Search and the retiring-expert narrative close the call. Do not rush past the data safety question with a vague reassurance; answer it precisely.",
    topMistakes: [
      `Giving a vague "all your data is secure" answer instead of the specific Bedrock and RAG explanation.`,
      "Leading with a feature list instead of the retiring-expert emotional hook.",
      `Claiming Vbrick is "HIPAA compliant" — Dr. Park will probe it and credibility drops.`,
    ],
    topWinMoves: [
      "Open with the retiring-expert question — it is emotionally resonant and immediately relevant to his role.",
      `Answer the AI data safety question with specifics: "AWS Bedrock, RAG, never fine-tunes on your content."`,
      `Connect Smart Search to the "give up and ask a colleague" problem he already recognizes.`,
    ],
    winningPathBeats: [
      {
        beat: "Open",
        goal: "Establish identity, confirm he owns clinical knowledge management",
        idealLine: `"Hi, this is [Name] — are you still the person who owns knowledge management and clinical video at Cleveland Clinic?"`,
      },
      {
        beat: "Qualify",
        goal: "Surface the retiring-expert and unsearchable library pain",
        idealLine: `"When a senior surgeon retires — is there a reliable way to capture their expertise and make it findable, or is that knowledge still at risk of walking out the door?"`,
      },
      {
        beat: "Value",
        goal: "Land AI search and data safety together",
        idealLine: `"We turn video into a searchable knowledge base with AI — and the AI never trains on your clinical content. It runs on AWS Bedrock with RAG."`,
      },
      {
        beat: "Close",
        goal: "Earn a call to walk through the architecture",
        idealLine: `"I think the AI architecture question alone is worth 20 minutes on a call — would you be open to that?"`,
      },
    ],
    track: "easy",
  },

  "hc-phi-secure-governance": {
    id: "hc-phi-secure-governance",
    title: "Secure Video for PHI-Adjacent Workflows",
    subtitle: "Help CVS Health (Aetna) govern video in a PHI-sensitive environment — FedRAMP-grade controls, RBAC, encryption, retention, and audit trails.",
    estimatedMinutes: 4,
    defaultPersonaId: "hc-cvshealth-security",
    defaultAccent: "general",
    scenarioContext: `CALL CONTEXT:
You are calling Lisa Armstrong, Director of Information Security and Privacy at CVS Health (Aetna).
CVS Health includes Aetna, one of the largest health insurers in the US — 300,000+ employees, 23M+ members insured.
Your goal: earn a 20-minute discovery call.

THE PAIN: Generic video platforms fail Lisa's security review consistently. PHI-adjacent workflows need encryption at rest and in transit, fine-grained RBAC, retention rules, and a complete audit trail. Most vendors do not come close.

VBRICK ANGLE: Vbrick Rev is the ONLY FedRAMP-certified enterprise video platform AND the only FedRAMP-certified eCDN — the highest available security bar in enterprise software. Layer on: SOC 2 Type II, GDPR compliance, AES encryption at rest and in transit, multi-layered RBAC down to individual video assets, configurable retention and expiration rules, and timestamped audit trails for every view event.

CRITICAL: Do NOT say "Vbrick is HIPAA compliant" or "HIPAA certified." Lisa is sophisticated — she evaluates controls, not certs. If you use HIPAA-seal language, she will correct you and your credibility drops. Frame everything through the controls stack and let her connect it to her regulatory context.

YOUR JOB THIS CALL:
- Lead with FedRAMP — it is the signal that cuts through noise for a security director.
- Let her ask the follow-up questions; answer each control precisely.
- The close is confident but natural — she has an unsolved problem and needs this.`,
    hardModeContext: "",
    cheatCard: [
      {
        label: "1. Greet + introduce yourself",
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: "2. Ask for help",
        hint: `"Quick question — are you still the person who evaluates security for enterprise video or collaboration tools at CVS Health?"`,
      },
      {
        label: "3. Qualify the pain",
        hint: `"I am curious — when your teams use video in workflows that are close to PHI or sensitive member data, are you confident the governance controls actually meet your bar, or is that still an open question?"`,
      },
      {
        label: "4. Land the value prop",
        hint: `"We are the only FedRAMP-certified enterprise video platform — same security rigor federal agencies are held to. On top of that: encryption at rest and in transit, multi-layered RBAC, retention rules, and a complete audit trail."`,
      },
      {
        label: "5. Handle the documentation-first objection",
        hint: `"Absolutely — we have a full security documentation package. Before I send a PDF though, I want to make sure we are talking about the right controls for your environment. Would a 20-minute call help me understand what your review checklist actually looks for?"`,
      },
      {
        label: "6. Soft close",
        hint: `"I could send you the FedRAMP docs, but honestly a 20-minute call would let me map our controls directly to your environment — would that be worth your time?"`,
      },
    ],
    difficultyScore: 3,
    whyVbrickFits: "Vbrick Rev is the only FedRAMP-certified enterprise video platform and the only FedRAMP-certified eCDN — the highest federal security standard in enterprise software. AES encryption at rest and in transit, multi-layered RBAC down to individual video assets, configurable retention and expiration rules, and timestamped audit trails (who watched what and when) directly address the controls CVS Health and Aetna require for PHI-adjacent video workflows.",
    repGoal: "Earn a 20-minute discovery call with Lisa Armstrong by leading with FedRAMP and the controls stack — not HIPAA claims.",
    desiredOutcome: "Lisa agrees to a 20-minute call to map Vbrick's controls against her security review checklist.",
    openingContinuation: `"Armstrong here. I have five minutes."`,
    prospectTone: "Measured and initially skeptical. Opens steadily as controls are named precisely. Will correct a HIPAA-seal claim — do not make one. Agrees to a call once FedRAMP and at least one additional control are mentioned relevantly.",
    likelyProspectResponses: [
      "Most video platforms do not clear our security bar — what makes you different?",
      "FedRAMP — that is not something I hear from video vendors very often.",
      "What does the RBAC model actually look like at the video level?",
      "If you are about to say HIPAA compliant, I am going to stop you — that is not how we evaluate this.",
      "Walk me through the audit trail — who watched what and when?",
      "Okay — 20 minutes to map your controls to our checklist. Send me a calendar invite.",
    ],
    strongRepResponses: [
      "We are the only FedRAMP-certified enterprise video platform and the only FedRAMP-certified eCDN. That is the same bar federal agencies are held to — it tends to clear most security checklists.",
      "RBAC goes down to the individual video asset — you can restrict a single video to a specific team without touching anything else in the library.",
      "Audit trail captures every view event — who watched, when, how long, from what device. Timestamped and exportable.",
      "We do not talk about HIPAA as a certification — we talk about the controls stack. Encryption at rest and in transit, RBAC, retention, audit. That maps to your regulatory context.",
    ],
    weakRepResponses: [
      "We are fully HIPAA compliant, so you do not need to worry about that.",
      "Our security is the best in the industry.",
      "I can send you a brochure with all our security features.",
    ],
    coachingNote: "Lisa is the hardest persona in the easy track because she will test your controls language. The HIPAA framing trap is real — if you say HIPAA certified, she will call it out and your credibility drops. Lead with FedRAMP, follow with specific controls, and let her drive the checklist conversation. The close works because she has an unsolved problem; you just need to prove you speak her language.",
    topMistakes: [
      `Saying "Vbrick is HIPAA compliant" — this triggers a correction and drops your credibility immediately.`,
      "Leading with features instead of FedRAMP — the one credential that cuts through noise for a security director.",
      `Offering to send documentation instead of earning the call — "I will send the docs" is a dead end.`,
    ],
    topWinMoves: [
      "Open with FedRAMP immediately — it is the credential that earns you the next sentence.",
      "Follow FedRAMP with specific controls in plain language: RBAC down to the individual video, encryption at rest and in transit, timestamped audit trail.",
      "Frame the close around mapping controls to her checklist — make the call feel useful, not salesy.",
    ],
    winningPathBeats: [
      {
        beat: "Open",
        goal: "Establish identity, confirm she owns video and collaboration security",
        idealLine: `"Hi, this is [Name] — are you still the person who evaluates security for enterprise video tools at CVS Health?"`,
      },
      {
        beat: "Qualify",
        goal: "Surface the controls gap in current PHI-adjacent video workflows",
        idealLine: `"When teams use video near sensitive workflows — are the governance controls actually meeting your bar, or is that still an open question?"`,
      },
      {
        beat: "Value",
        goal: "Lead with FedRAMP, follow with specific controls",
        idealLine: `"We are the only FedRAMP-certified enterprise video platform. On top of that: encryption at rest and in transit, RBAC down to the individual video, and a full timestamped audit trail."`,
      },
      {
        beat: "Close",
        goal: "Earn a controls-mapping call",
        idealLine: `"A 20-minute call would let me map our controls directly to your checklist — would that be worth your time?"`,
      },
    ],
    track: "easy",
  },


  // === EASY TRACK — MANUFACTURING SCENARIOS ===
  'mfg-plant-allhands-scale': {
    id: 'mfg-plant-allhands-scale',
    title: 'Plant All-Hands at Scale',
    subtitle: `eCDN delivery to 10,000+ factory workers without melting the WAN`,
    estimatedMinutes: 4,
    defaultPersonaId: 'mfg-gm-comms',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You're calling Marcus Delgado, Director of Manufacturing Communications at General Motors. He oversees internal communications to 100,000+ employees across North American manufacturing plants. Last week's all-hands buffered for 30% of viewers — plant managers are still complaining. He's not expecting your call but he's in solve-it mode. Your hook: Vbrick's eCDN delivers live video to tens of thousands simultaneously using three methods (peer-to-peer, edge caching, multicast) from a single vendor, without taxing the corporate WAN.`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").',
      },
      {
        label: '2. Ask for help (15 seconds)',
        hint: `Ask: "I caught you at a bad time?" then bridge to your hook — "I work with manufacturing comms teams that run large all-hands events and hit buffering problems at plant scale. Is that something on your radar?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `When he confirms buffering, ask: "How many sites or viewers were affected?" Let him tell the story — that's your qualification.`,
      },
      {
        label: '4. Deliver the value prop (one sentence)',
        hint: `"Vbrick uses three eCDN methods simultaneously — peer-to-peer, edge caching, and multicast — so 10,000 people can tune in at once and your WAN barely notices." Drop the proof point: one customer runs 100 webcasts/month to 115,000 users this way.`,
      },
      {
        label: '5. Handle the Teams objection',
        hint: `"Teams is great for meetings — it wasn't built for broadcast to 10,000 factory workers simultaneously. We sit alongside Teams and handle the delivery layer."`,
      },
      {
        label: '6. Soft close',
        hint: `"I could send a one-pager, but honestly I'd give you a lot more in a quick 20-minute call — I can walk you through the delivery architecture and pressure-test whether it maps to your plant setup. Worth a look?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: `Vbrick is the only vendor offering all three eCDN technologies from one platform — peer-to-peer, edge caching, and multicast. A real customer runs ~100 webcasts per month for 115,000 users without WAN saturation. GM's factory-floor all-hands buffering problem is exactly this use case. Vbrick also provides multilingual auto-translation and captions in 100+ languages, which addresses GM's diverse manufacturing workforce.`,
    repGoal: `Qualify the all-hands bandwidth problem and book a 20-minute discovery call with Marcus and possibly an IT contact.`,
    desiredOutcome: `Marcus agrees to a 20-minute call to see the delivery architecture and explore fit for GM's plant communications.`,
    openingContinuation: `Hi Marcus, this is [Your Name] with Vbrick — I'll be brief. I work with manufacturing communications teams that run large all-hands events, and I've been talking to a lot of plant comms leaders about the same problem: live video that buffers when the whole plant tunes in at once. Is that something you've run into?`,
    prospectTone: `Frazzled but hopeful. He wants a solution. He'll engage fast if you sound like you actually understand his specific problem — not just "video delivery" in the abstract.`,
    likelyProspectResponses: [
      `Yeah, last week's all-hands was a mess. Half the plants couldn't watch without buffering.`,
      `We use Teams for this — it mostly works but not when the whole plant logs in at once.`,
      `How is this different from just upgrading our bandwidth?`,
      `What does eCDN actually mean? I'm not super technical on this.`,
      `Would IT have to install something at every plant location?`,
      `Okay, that's interesting. What would a next step look like?`,
    ],
    strongRepResponses: [
      `That buffering problem is exactly what we solve — Vbrick uses three eCDN methods simultaneously so local devices share the stream with each other. Your WAN barely notices even when 10,000 people tune in.`,
      `eCDN in plain terms: instead of every screen in every plant pulling video from the cloud at once, local devices share the stream peer-to-peer. One customer runs 100 live webcasts a month to 115,000 people this way.`,
      `IT typically deploys a lightweight agent once per site — not something on every endpoint. Most of our manufacturing customers are live in weeks, not months.`,
      `I could send a one-pager, but honestly I'd give you a lot more in a quick 20-minute call — I can walk you through the delivery architecture and pressure-test whether it maps to your plant setup. Worth a look?`,
    ],
    weakRepResponses: [
      `We have a really comprehensive enterprise video platform with a lot of features across live, on-demand, and CMS...`,
      `Vbrick Rev is a cloud-native AI Enterprise Video Platform that does live webcasting, video CMS, eCDN delivery, and a lot more...`,
      `I can send you some information and you can review it whenever you have bandwidth.`,
    ],
    coachingNote: `Lead with the pain — "buffering during all-hands" — not the product. Marcus doesn't care what Vbrick is called. He cares that 30% of his plant viewers couldn't watch the CEO speak last week. Name that problem first, then introduce eCDN as the specific mechanism that solves it. Save product features for the discovery call.`,
    topMistakes: [
      `Pitching "Enterprise Video Platform" features before confirming the buffering pain`,
      `Getting lost in eCDN technical details before Marcus has bought in on the basic concept`,
      `Asking for the meeting before he's confirmed "yes, that's exactly my problem"`,
    ],
    topWinMoves: [
      `Name the buffering problem in the first sentence — let him confirm it before you say anything else`,
      `Explain eCDN in one plain sentence: "devices share the stream so your WAN stays clean"`,
      `Drop a specific proof point: 100 webcasts per month, 115,000 users, no WAN saturation`,
    ],
    winningPathBeats: [
      {
        beat: 'Open with the pain',
        goal: 'Get Marcus to confirm the buffering problem before pitching anything',
        idealLine: `I work with manufacturing comms teams that run large all-hands events — a lot of them hit buffering issues when the whole plant tunes in at once. Is that something that's come up for you?`,
      },
      {
        beat: 'Explain eCDN simply',
        goal: `Help him understand the mechanism without losing him in network jargon`,
        idealLine: `Short version: instead of every screen in every plant pulling video from the cloud at once, local devices share the stream with each other. Your WAN barely notices.`,
      },
      {
        beat: 'Drop the proof point',
        goal: 'Make the claim feel real and specific, not just a pitch',
        idealLine: `One of our manufacturing customers runs about 100 live webcasts a month to 115,000 people this way. Their IT team doesn't even get calls during town halls anymore.`,
      },
      {
        beat: 'Soft close',
        goal: 'Book the 20-minute call without pushing',
        idealLine: `I could send a one-pager, but honestly I'd give you a lot more in a quick 20-minute call — would you be open to that?`,
      },
    ],
    track: 'easy',
  },

  'mfg-tribal-knowledge-ai': {
    id: 'mfg-tribal-knowledge-ai',
    title: 'Tribal Knowledge, Preserved and Searchable',
    subtitle: `AI-powered video search that finds the expert answer without training on your data`,
    estimatedMinutes: 4,
    defaultPersonaId: 'mfg-3m-knowledge',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You're calling Dr. Elena Vasquez, Director of Knowledge Management & R&D Learning at 3M. Three senior R&D fellows are retiring this quarter. She has hours of recorded expert sessions that no one can navigate, and she was burned last year by an AI tool that legal shut down over data privacy concerns. Your hook: Vbrick's AI generates semantic search, auto-chapters, auto-summaries, and auto-tags on video content — running on AWS Bedrock with RAG and never training on customer data. That's a contractual commitment, not a policy statement.`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").',
      },
      {
        label: '2. Ask for help (15 seconds)',
        hint: `"I'll keep this short — I work with knowledge management leaders in R&D-heavy companies dealing with a specific problem: video recordings that pile up and can't be searched. Is that something you're dealing with?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `When she confirms, ask: "And is it specifically the search and navigation problem, or is the bigger issue just getting experts to record in the first place?" Let her answer — it tells you where to go next.`,
      },
      {
        label: '4. Deliver the value prop — lead with data safety',
        hint: `"Before I go further — I know AI and R&D content is a sensitive mix. Our AI runs on AWS Bedrock, generates chapters and semantic search, and never trains on your data. That's contractual. Then the search itself: an engineer types what they remember and finds the 4-minute segment in a 3-hour recording."`,
      },
      {
        label: '5. Handle the data privacy objection',
        hint: `"The AI processes video to generate metadata — it doesn't store your content or use it to improve the model. AWS Bedrock guarantees that. If legal wants to see the architecture, we can walk them through it on a call."`,
      },
      {
        label: '6. Soft close',
        hint: `"I could send our data privacy overview, but the fastest path is a 20-minute call where you can ask the data questions directly — you could even bring your privacy lead. Would that be worth 20 minutes?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: `Vbrick's AI auto-generates titles, summaries, chapters, and tags on upload. Its Smart Search is semantic — an engineer can describe what they remember and land on the specific minute in a multi-hour recording. The AI runs on AWS Bedrock with RAG and never trains on customer data, which is contractual. This directly addresses 3M's legal mandate and knowledge-capture crisis simultaneously.`,
    repGoal: `Qualify the knowledge discovery and AI data privacy problem. Address the data concern proactively — before she raises it. Book a discovery call that can include her legal or privacy team.`,
    desiredOutcome: `Dr. Vasquez agrees to a 20-minute call, likely wanting to include her privacy team to hear the data model directly.`,
    openingContinuation: `Hi Dr. Vasquez, this is [Your Name] with Vbrick — I'll keep this short. I work with knowledge management leaders at R&D-heavy companies dealing with a specific challenge: expert sessions get recorded, the videos pile up, and nobody can find anything in them when they need it. Is that a problem you're sitting on?`,
    prospectTone: `Thoughtful and cautious. She'll engage when you demonstrate you understand both the knowledge problem AND the data privacy constraint together — not just one side of it.`,
    likelyProspectResponses: [
      `Yes, we have hours of recorded expert sessions that are basically unsearchable right now.`,
      `We tried an AI tool last year and legal shut it down. Data privacy was the issue.`,
      `How does your AI actually work — does it train on our content?`,
      `What can it actually surface from a long, unstructured recording?`,
      `How is semantic search different from keyword search on video?`,
      `Okay, I'm somewhat interested. What would a reasonable next step look like?`,
    ],
    strongRepResponses: [
      `Our AI runs on AWS Bedrock — it processes your video to generate chapters and semantic search, and it never retains your content to train the model. That's contractual, not just a privacy policy.`,
      `Semantic search means an engineer types what they remember — "how did Chen explain the bonding process for the new substrate" — and gets the exact 4-minute segment in a 3-hour session, not a list of files.`,
      `We auto-generate titles, summaries, chapters, and tags on upload. A retiring expert's 3-hour deep-dive becomes a navigable, searchable knowledge asset in minutes without anyone manually editing it.`,
      `I'd love to show you the search in a 20-minute call — you could even bring your privacy team to hear the data model directly. That's usually the fastest way to get legal comfortable. Would that work?`,
    ],
    weakRepResponses: [
      `Our AI is really powerful and handles a lot of different search and discovery use cases across video...`,
      `We have a comprehensive platform with strong compliance features and enterprise security controls...`,
      `I can send you our data privacy documentation to share with your legal team.`,
    ],
    coachingNote: `Dr. Vasquez has two distinct concerns: knowledge discovery and data safety. Address both in the same call — don't lead with AI features and hope she forgets about privacy. Name the data concern proactively ("I know AI and R&D data is a sensitive mix — here's exactly how ours works") and she'll trust you more, not less. That move is the difference between a meeting and a polite goodbye.`,
    topMistakes: [
      `Pitching AI search features without proactively addressing the data privacy concern she's already been burned by`,
      `Generic AI language ("powerful AI," "intelligent search") without explaining the AWS Bedrock and no-training-on-data mechanism in plain terms`,
      `Skipping the retiring-engineers knowledge crisis and jumping straight to the technology`,
    ],
    topWinMoves: [
      `Address the AI data privacy concern before she raises it — it's the move that builds trust`,
      `Explain AWS Bedrock in plain language: "processes your video to generate search, never retains your content to train the model"`,
      `Make semantic search concrete with a scenario: "an engineer describes what they remember and finds the 3-minute clip in a 4-hour session"`,
    ],
    winningPathBeats: [
      {
        beat: 'Open with the knowledge crisis',
        goal: 'Get her to confirm retiring experts and unsearchable video before pitching',
        idealLine: `I've been talking with knowledge management leaders who have years of expert recordings that no one can navigate — the expert is retiring, and the video library is basically a black box. Does that map to what you're dealing with?`,
      },
      {
        beat: 'Address data privacy first — proactively',
        goal: `Disarm the legal concern before she raises it, which signals you understand her situation`,
        idealLine: `Before I go further — I know AI and R&D content is a sensitive combination. Our AI runs on AWS Bedrock, generates chapters and semantic search, and never trains on your data. Contractual.`,
      },
      {
        beat: 'Make semantic search concrete',
        goal: 'Help her see what "findable" actually means in practice',
        idealLine: `An engineer types "how did Nakamura explain the polymer bonding process" — and instead of nothing, they get the 4-minute segment in a 3-hour recording. That's the difference.`,
      },
      {
        beat: 'Soft close with a privacy-team invitation',
        goal: 'Make the meeting feel like the logical next step for her and her legal contact',
        idealLine: `The fastest path is a 20-minute call where you can ask the data questions directly — you could even bring your privacy lead. Would that be worth 20 minutes?`,
      },
    ],
    track: 'easy',
  },

  'mfg-secure-export-training': {
    id: 'mfg-secure-export-training',
    title: 'Secure Training for Export-Controlled Content',
    subtitle: `Role-based access and audit trails for ITAR-sensitive technical training at scale`,
    estimatedMinutes: 4,
    defaultPersonaId: 'mfg-boeing-training',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You're calling Sandra Okafor, Director of Technical Training & Workforce Development at Boeing. She manages technical training curricula for 70,000+ engineers and technicians across dozens of facilities. Her biggest headache: distributing training on export-controlled (ITAR) content without the video delivery layer becoming a compliance exposure. Most LMS platforms control the course wrapper but outsource video to a CDN with weaker access controls. Your hook: Vbrick is the ONLY FedRAMP-certified enterprise video platform, with multi-layered RBAC that mirrors job classifications, encryption at rest and in transit, SOC 2 Type II, and access logging for audit-ready reporting.`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").',
      },
      {
        label: '2. Ask for help (15 seconds)',
        hint: `"I'll be quick — I work with training leaders at large aerospace and defense manufacturers on one specific problem: controlling access to export-controlled training video without the video delivery layer becoming a compliance gap. Is that a challenge at Boeing?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `When she confirms ITAR or access control as real issues, ask: "Is the concern more about who can access the video itself, or about audit trails and proving access was restricted appropriately?" Her answer tells you where to focus.`,
      },
      {
        label: '4. Deliver the value prop',
        hint: `"Vbrick is the only FedRAMP-certified enterprise video platform — that's independently audited, not self-certified. RBAC goes to the individual video level, we can mirror Boeing job classifications, and every access attempt is logged for audit." Then contrast: "Most LMS platforms govern the course wrapper but outsource video delivery to a CDN with much weaker controls. We govern the video itself."`,
      },
      {
        label: '5. Handle the LMS renewal objection',
        hint: `"Your LMS is the right home for course structure and completion tracking — we're not replacing it. But if your LMS is hosting video on a general-purpose CDN, the video itself isn't under the same RBAC as the course. That's the gap we close."`,
      },
      {
        label: '6. Soft close',
        hint: `"Given your security review timeline, the smartest move is a scoping call now — so when it goes to IT, they're reviewing something specific. Worth 20 minutes to map that out?"`,
      },
    ],
    difficultyScore: 3,
    whyVbrickFits: `Vbrick is the ONLY FedRAMP-certified enterprise video platform AND the only FedRAMP-certified eCDN. It has multi-layered RBAC that can be configured to Boeing's job classification structure, encryption at rest and in transit, SOC 2 Type II, and per-video access logging for audit trails. No other enterprise video vendor can make these claims in combination. Most LMS platforms outsource video delivery to a general-purpose CDN — Vbrick controls delivery end-to-end.`,
    repGoal: `Qualify Boeing's access control and compliance pain around training video. Land on FedRAMP and RBAC as the differentiators. Book a discovery call, likely including an IT security contact.`,
    desiredOutcome: `Sandra agrees to a 20-minute scoping call, likely wanting to include her IT security or compliance team.`,
    openingContinuation: `Hi Sandra, this is [Your Name] with Vbrick — I'll be quick. I work with training directors at large aerospace and defense manufacturers, and the challenge I hear most often is managing access to export-controlled training content — making sure the right people can get to it, and the wrong people absolutely can't, at the video delivery level, not just the course wrapper. Is that something that keeps you up at night?`,
    prospectTone: `Measured and methodical. She won't get excited fast, but she will engage when you demonstrate real fluency on ITAR, RBAC, and audit compliance — not just buzzwords.`,
    likelyProspectResponses: [
      `Access control is definitely a challenge. ITAR content is serious — we can't have the wrong person accessing it.`,
      `We have an LMS we just renewed — what does Vbrick do differently from what we already have?`,
      `What does FedRAMP certification actually mean in the context of a video platform?`,
      `How granular is the role-based access? We have dozens of job classifications that map to content restrictions.`,
      `Our security reviews take months — is it worth starting this conversation now?`,
      `Okay, I'll hear more. What would a next step look like?`,
    ],
    strongRepResponses: [
      `Vbrick is the only FedRAMP-certified enterprise video platform — that's independently audited security posture, not a self-certification. That's a claim your current video hosting layer almost certainly can't make.`,
      `Our RBAC goes to the individual video level — you can mirror Boeing job classifications so a 737 technician never sees 787 content they're not cleared for, and every access attempt is logged for audit review.`,
      `Most LMS platforms manage the course wrapper but outsource video delivery to a general-purpose CDN with much looser access controls. We control delivery end-to-end — the video itself is under the same governance as the course.`,
      `Given your security review timeline, the smartest move is a scoping call now — so when it goes to IT, they're reviewing something specific, not a generic vendor inquiry. Worth 20 minutes to map it out?`,
    ],
    weakRepResponses: [
      `We have a very comprehensive security posture with a lot of certifications across compliance frameworks...`,
      `FedRAMP is basically the gold standard for government and enterprise cloud security...`,
      `I can send you our security documentation and you can pass it to your IT team.`,
    ],
    coachingNote: `Sandra has a high bar — she's Boeing. Don't lead with features; lead with the compliance problem. FedRAMP is your differentiator but you have to explain what it means in practice for video: an independently audited security posture, not just a badge. The RBAC story is equally powerful — help her see that most LMS platforms outsource video delivery to a CDN with weaker controls. That gap is where Vbrick lives.`,
    topMistakes: [
      `Dropping "FedRAMP" without explaining what it means specifically for a video delivery context`,
      `Treating this like a general video platform sale — Sandra's concern is compliance, not features`,
      `Asking for the meeting before Sandra has confirmed that access control is her actual pain point`,
    ],
    topWinMoves: [
      `Name the ITAR and export-controlled training pain in the opening — let her confirm it before pitching`,
      `Explain why FedRAMP matters for video specifically: it's the delivery layer, not just the LMS wrapper`,
      `Draw the contrast clearly: most platforms govern the course, Vbrick governs the video itself end-to-end`,
    ],
    winningPathBeats: [
      {
        beat: 'Open with the compliance pain',
        goal: 'Get Sandra to confirm ITAR and access control as real problems she owns',
        idealLine: `I work with training directors at aerospace and defense manufacturers — the challenge I hear most is controlling access to export-controlled video content across a large, distributed workforce. Is that on your radar?`,
      },
      {
        beat: 'Introduce FedRAMP with meaning',
        goal: 'Make FedRAMP land as a real differentiator, not a certification badge',
        idealLine: `Vbrick is the only FedRAMP-certified enterprise video platform — meaning our security posture has been independently audited to federal standards. That's a claim your current video hosting layer probably can't make.`,
      },
      {
        beat: 'Make RBAC concrete for Boeing',
        goal: `Help her see granular access control that mirrors Boeing's real job classification structure`,
        idealLine: `Our RBAC goes to the individual video level — you can mirror Boeing job classifications so a 737 tech never sees 787 content they're not cleared for, and every access attempt is logged for audit.`,
      },
      {
        beat: 'Soft close with a scoping frame',
        goal: 'Make the meeting feel like a logical planning step, not a sales pitch',
        idealLine: `Given your security review timeline, the smartest move is a scoping call now — so when it goes to IT, they're reviewing something specific. Worth 20 minutes to map that out?`,
      },
    ],
    track: 'easy',
  },

  'mfg-dealer-field-training': {
    id: 'mfg-dealer-field-training',
    title: 'Dealer & Field Training at Global Scale',
    subtitle: `A branded, governed training portal for independent dealers and field technicians`,
    estimatedMinutes: 3,
    defaultPersonaId: 'mfg-caterpillar-dealer',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You're calling Priya Nair, Manager of Global Dealer Training at Caterpillar. She manages training for 3,000+ independent dealers and field technicians worldwide. Independent dealers aren't employees — they need external access without being inside the firewall. Her current setup: a generic SharePoint link and a manual spreadsheet for completion tracking. Your hook: Vbrick provides a branded external portal with fine-grained permissions, mobile-first delivery, and automated completion reporting — no VPN required.`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").',
      },
      {
        label: '2. Ask for help (15 seconds)',
        hint: `"I'll be brief — I work with manufacturer training teams that manage content for external dealer and partner networks. The challenge is usually giving independent dealers a professional experience without the headache of getting them inside the corporate firewall. Does that sound familiar?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `When she confirms, ask: "Is the bigger challenge the external access piece, or is it more about tracking completion and compliance across dealers you don't directly control?" Her answer shapes your next move.`,
      },
      {
        label: '4. Deliver the value prop',
        hint: `"We give dealers a branded Caterpillar training portal — they log in externally, no VPN, and they only see content scoped to their region or equipment line. Completion rolls up automatically to your dashboard. No spreadsheet."`,
      },
      {
        label: '5. Handle the IT-involvement objection',
        hint: `"You control the portal configuration — content, permissions by dealer or equipment line, branding. IT sets up SSO once and stays out of the way after that."`,
      },
      {
        label: '6. Soft close with a portal demo offer',
        hint: `"The fastest way to see if this fits is a 20-minute call where I walk you through exactly what a dealer sees when they log in — their portal, their content, your reporting. Would that be worth your time?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: `Vbrick's governed CMS supports branded portals accessible to external users — no VPN required. Permissions can be scoped by dealer, region, or equipment line. Mobile-friendly delivery with offline download works for field techs on tablets at job sites. Automated completion and engagement reporting replaces manual spreadsheet tracking. Fine-grained RBAC means each dealer only sees what's relevant to their specific equipment lines, managed centrally.`,
    repGoal: `Qualify the external portal and completion tracking problem. Book a discovery call focused on what Caterpillar dealers would actually experience.`,
    desiredOutcome: `Priya agrees to a 20-minute call, likely wanting to include a digital learning or IT contact to see the portal demo.`,
    openingContinuation: `Hi Priya, this is [Your Name] with Vbrick — I'll be brief. I work with manufacturer training teams that manage content for external dealer and partner networks, and the challenge I hear most is giving independent dealers a professional training experience without the headache of getting them inside the corporate firewall. Is that something you're dealing with?`,
    prospectTone: `Warm, organized, and receptive. She has a real operational headache and will engage readily if you speak her language: external access, branded portal, completion tracking, mobile.`,
    likelyProspectResponses: [
      `Yes — dealers aren't employees so getting them into our internal systems is always a hassle.`,
      `Right now it's basically a SharePoint link and a spreadsheet. It's functional but not great.`,
      `How do you handle permissions for external users who aren't in our directory?`,
      `Our dealers are on tablets in the field — the mobile experience has to actually work in low connectivity.`,
      `Would dealers need to create separate accounts or is there some kind of SSO?`,
      `Okay, I'd like to hear more. What's a reasonable next step?`,
    ],
    strongRepResponses: [
      `External dealers get a branded Caterpillar training portal — no VPN, no internal credentials. They see only the content scoped to their region or equipment line. You configure that centrally.`,
      `Permissions go to the video level — a dealer in Australia who sells only Cat excavators never sees content for mining equipment they don't handle. You control that without IT involvement after initial setup.`,
      `The mobile experience is built for field techs: offline downloads for low-connectivity sites, mobile-optimized player, works on a tablet at a job site without a strong connection.`,
      `The fastest way to see if this fits is a 20-minute call where I show you exactly what a dealer sees when they log in — their portal, their content, how completion rolls up to your dashboard. Would that be worth your time?`,
    ],
    weakRepResponses: [
      `We have a really robust platform with a lot of features for different training use cases...`,
      `Permissions are very comprehensive — you can set them up in lots of different ways depending on your structure...`,
      `I can send you some marketing materials and product documentation to start.`,
    ],
    coachingNote: `Priya's pain is operational and concrete: dealers aren't employees, the current setup looks unprofessional, and completion tracking is a spreadsheet. Lead with the external portal story — "branded, no VPN, external access" — before getting into features. Mobile is her secondary hook. The close should emphasize a portal demo, not just a generic discovery call — she wants to see what dealers would actually see.`,
    topMistakes: [
      `Talking about internal employee use cases before addressing external dealer access`,
      `Using RBAC technical language without translating it: she wants to know dealers can log in without calling IT`,
      `Not mentioning mobile, which is a key pain for field techs on tablets at job sites`,
    ],
    topWinMoves: [
      `Lead with "external branded portal, no VPN" — that's the exact gap in her current setup`,
      `Make permissions sound simple: "you configure it once per equipment line, dealers see only what's relevant"`,
      `Offer a portal demo, not just a discovery call — she wants to see what dealers would experience`,
    ],
    winningPathBeats: [
      {
        beat: 'Open with external access pain',
        goal: 'Get Priya to confirm the dealer-outside-the-firewall problem',
        idealLine: `I work with manufacturer training teams that manage dealer networks — the challenge is usually giving independent partners a professional experience without the headache of getting them inside the corporate firewall. Does that sound familiar?`,
      },
      {
        beat: 'Introduce the branded portal',
        goal: `Help her see what "good" looks like for dealers logging in`,
        idealLine: `We give dealers a branded Caterpillar training portal — they log in externally, no VPN, and they only see content scoped to their region or equipment line. Completion rolls up automatically to your dashboard.`,
      },
      {
        beat: 'Hit the mobile hook',
        goal: "Connect to the field tech reality she's already dealing with",
        idealLine: `Field techs access it from tablets on job sites — mobile-optimized player, offline download option for low-connectivity areas. No desktop required.`,
      },
      {
        beat: 'Soft close with a portal demo offer',
        goal: 'Make the meeting feel concrete and specific, not a generic vendor call',
        idealLine: `The fastest way to see if this fits is a 20-minute call where I walk you through exactly what a dealer sees when they log in — their portal, their content, your reporting. Worth a look?`,
      },
    ],
    track: 'easy',
  },

  'mfg-consolidate-governance': {
    id: 'mfg-consolidate-governance',
    title: 'One Governed Video Home',
    subtitle: `Replace the patchwork with a single searchable, governed video platform and eCDN`,
    estimatedMinutes: 4,
    defaultPersonaId: 'mfg-siemens-it',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You're calling Thomas Gruber, Senior Manager of Digital Workplace & IT at Siemens USA. He's managing four different video tools that don't integrate: Teams recordings, a legacy on-prem system, a Zoom webinar account, and a file share full of .mp4s. Last month's CEO all-hands buffered at 8 of 12 US manufacturing sites. He's skeptical of vendors but genuinely tired of the patchwork and the post-incident reports. Your hook: Vbrick consolidates webcasting, video CMS, and all three eCDN delivery methods from a single vendor — with native Microsoft Teams and SharePoint integration and full governance (RBAC, retention, audit trail).`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: 'They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").',
      },
      {
        label: '2. Ask for help (15 seconds)',
        hint: `"I'll keep it quick — I work with IT leaders at large manufacturers who've ended up with a mix of video tools that don't talk to each other, and all-hands events that buffer when the whole plant tunes in. Does that sound familiar?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `When he confirms, ask: "Is the bigger headache the WAN saturation during live events, or the fact that there's no single searchable home for all the video content?" Let him prioritize — it tells you where to lead.`,
      },
      {
        label: '4. Deliver the value prop — lead with eCDN',
        hint: `"We use all three eCDN methods simultaneously: peer-to-peer, edge caching, and multicast. Whatever you're running now probably uses one. That's why 8 sites buffered — single-method delivery doesn't hold at plant scale." Then add: "Everything lives in one governed library — RBAC, retention rules, audit trail — and we integrate natively with Teams and SharePoint."`,
      },
      {
        label: '5. Handle the Microsoft-ecosystem objection',
        hint: `"We integrate natively — video lives in Vbrick's governed library but users access it through Teams or SharePoint. SSO, embedded player, no new login. You stay fully Microsoft — we're the delivery and governance layer underneath."`,
      },
      {
        label: '6. Soft close with an architecture frame',
        hint: `"I'd like 20 minutes to map this to your existing Microsoft footprint — bring your architecture lead if you want. We can figure out what consolidation actually looks like without a big migration lift. Worth a look?"`,
      },
    ],
    difficultyScore: 3,
    whyVbrickFits: `Vbrick is the only vendor offering all three eCDN technologies — peer-to-peer, edge caching, and multicast — from a single platform. Its governed CMS includes RBAC, retention and expiration policies, and full audit trails. AI semantic search makes existing content discoverable without manual reorganization. Native Microsoft integration: Teams embedded player, SharePoint access, SSO. A real customer manages libraries exceeding 500 TB with these tools. This is the consolidation + eCDN story Siemens IT needs.`,
    repGoal: `Qualify the consolidation and eCDN pain. Address the Microsoft ecosystem concern directly. Book a scoping call that includes Thomas's architecture lead.`,
    desiredOutcome: `Thomas agrees to a 20-minute scoping call and is open to including his architecture or digital workplace lead.`,
    openingContinuation: `Hi Thomas, this is [Your Name] with Vbrick — I'll keep it quick. I work with IT leaders at large manufacturers who've ended up with a mix of video tools — Teams recordings in one place, webcasting somewhere else, file shares full of .mp4s — and all-hands events that buffer at the plant level. Sound familiar?`,
    prospectTone: `Measured, technical, and slightly weary. He'll engage when you demonstrate actual technical knowledge — especially specific eCDN methods and Microsoft integration details. He wants to solve a real problem, not be impressed by a pitch.`,
    likelyProspectResponses: [
      `Yeah — Teams recordings, a legacy system, Zoom, and a shared drive nobody can search. Four tools, no searchable home.`,
      `What makes this different from just using Teams more aggressively for everything?`,
      `We're deep in Microsoft — everything has to work with Teams and SharePoint or it's a non-starter.`,
      `How does your eCDN actually work? We've heard "better delivery" promises before.`,
      `Any migration from our legacy video system is going to be a significant lift. We can't just move 10 TB overnight.`,
      `Alright, I'd hear more. What does a reasonable next step look like?`,
    ],
    strongRepResponses: [
      `Teams is great for meetings — it wasn't designed for broadcast delivery to 10,000 factory workers simultaneously. That's where the WAN saturation comes from. We sit alongside Teams and handle the scale delivery layer.`,
      `We use all three eCDN methods simultaneously: peer-to-peer, edge caching, and multicast. Whatever you're running now probably relies on one. That's why 8 of 12 sites buffered — single-method delivery breaks at plant scale.`,
      `We integrate natively — video lives in Vbrick's governed library but users access it through Teams or SharePoint. SSO, embedded player, no new login. You stay fully Microsoft.`,
      `I'd like 20 minutes to map this to your existing Microsoft footprint — bring your architecture lead if you want. We can figure out what consolidation actually looks like without a big lift. Worth a look?`,
    ],
    weakRepResponses: [
      `We have a very comprehensive enterprise video platform with governance, delivery, and AI features...`,
      `A lot of companies are moving away from siloed video tools toward unified platforms right now...`,
      `I can send you a comparison document against your current video tools to review.`,
    ],
    coachingNote: `Thomas has two live wounds: the all-hands buffering (he wrote the post-incident report) and the patchwork. Lead with eCDN first — that's the fresh pain. When he raises Microsoft, don't pivot away — go deeper: "we integrate natively with Teams and SharePoint, video stays in Vbrick's governed library but users never leave Microsoft." That's the right answer and it closes the objection without fighting it.`,
    topMistakes: [
      `Positioning Vbrick as a Microsoft replacement instead of a complement that lives alongside Teams`,
      `Vague eCDN language ("we handle network delivery better") without naming the three specific methods and why single-method delivery fails at plant scale`,
      `Leading with consolidation before earning credibility on the buffering problem that's still fresh in his mind`,
    ],
    topWinMoves: [
      `Name the buffering problem first and directly — he wrote the post-incident report, it's top of mind`,
      `Name all three eCDN methods specifically — peer-to-peer, edge caching, multicast — and explain why Teams-only delivery fails at plant scale`,
      `Position Vbrick as living alongside Microsoft, not replacing it: "video in Vbrick, accessed through Teams"`,
    ],
    winningPathBeats: [
      {
        beat: 'Open with patchwork + buffering',
        goal: 'Get Thomas to confirm both pains in the first 30 seconds',
        idealLine: `I work with IT leaders at large manufacturers who end up with video scattered across Teams, Zoom, file shares, and a legacy system — and all-hands events that buffer when the whole plant tunes in. Did last month give you a post-incident report to write?`,
      },
      {
        beat: 'Lead eCDN with specifics',
        goal: 'Distinguish from generic delivery promises he has already heard and discounted',
        idealLine: `We use all three eCDN methods simultaneously: peer-to-peer, edge caching, and multicast. Whatever you're running now probably relies on one. That's why 8 sites buffered — single-method delivery doesn't hold at plant scale.`,
      },
      {
        beat: 'Address Microsoft directly',
        goal: 'Remove the "we are a Microsoft shop" objection without fighting it',
        idealLine: `We integrate natively — video lives in Vbrick's governed library but users access it through Teams or SharePoint. SSO, embedded player, no new login. You stay fully Microsoft.`,
      },
      {
        beat: 'Soft close with an architecture framing',
        goal: 'Make the call feel like a technical scoping session, not a vendor pitch',
        idealLine: `I'd love 20 minutes to map this to your existing footprint — bring your architecture lead if you want. We can figure out what consolidation actually looks like without a big migration lift. Worth a look?`,
      },
    ],
    track: 'easy',
  },

  // === EASY TRACK — TELECOMMUNICATIONS SCENARIOS ===
  'telco-employee-townhall-scale': {
    id: 'telco-employee-townhall-scale',
    title: 'Employee Town Halls at Scale',
    subtitle: `Help AT&T deliver live all-hands events to 200K+ employees without straining the corporate network`,
    estimatedMinutes: 4,
    defaultPersonaId: 'telco-att-comms',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You are cold-calling Sarah Chen, Director of Employee Communications at AT&T. AT&T runs quarterly all-hands events for 200,000+ employees. The last event had widespread buffering complaints and IT has been pushing back on large webcasts. Your goal is to surface the network-delivery pain, introduce Vbrick eCDN as the fix, and book a 20-minute discovery call.`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: '2. Ask for help',
        hint: `"I work with enterprise comms teams on large live-event delivery — do you have 30 seconds for one quick question?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `"When you run a firm-wide town hall, how does the network handle the load?" Listen for buffering, IT pushback, or scale concerns.`,
      },
      {
        label: '4. Deliver the value prop',
        hint: `"Vbrick's eCDN uses three delivery methods — peer-to-peer, edge caching, and multicast — so 200,000 streams don't all hit the WAN at once."`,
      },
      {
        label: '5. Handle the Teams objection',
        hint: `"Totally — we actually pair with Teams. Vbrick handles the eCDN layer underneath so your Teams events don't saturate the network."`,
      },
      {
        label: '6. Soft close',
        hint: `"I could send over a one-pager, but honestly I'd give you a lot more in a quick 20-minute call — would you be open to that?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: `Vbrick is the only vendor offering all three eCDN technologies — peer-to-peer, edge caching, and multicast — from one platform. For a workforce of 200,000+, this means live town halls deliver without saturating the corporate WAN, something Teams or Zoom webcasting alone cannot solve.`,
    repGoal: `Book a 20-minute discovery call to explore how Vbrick eCDN can support AT&T town halls`,
    desiredOutcome: `Sarah agrees to a 20-minute call and provides a preferred time or suggests a next step`,
    openingContinuation: `Hi Sarah, this is [Your Name] with Vbrick. I work with enterprise comms teams on large-scale live events — do you have 30 seconds?`,
    prospectTone: `Warm and curious. Sarah is open to solutions and mildly frustrated about the last town hall's buffering issues.`,
    likelyProspectResponses: [
      `Sure, what's this about?`,
      `We've had some issues with our last all-hands — what do you do?`,
      `We use Microsoft Teams for our webcasts already`,
      `IT would have to review anything new before we could even look at it`,
      `What does the network delivery piece actually look like?`,
      `Would this work alongside what we already have?`,
    ],
    strongRepResponses: [
      `"Totally — Vbrick sits behind Teams as an eCDN layer, so events still run in Teams but don't flood the WAN."`,
      `"With a workforce your size, peer-to-peer delivery means the 200,000th stream costs the same bandwidth as the first."`,
      `"We can walk your IT team through the architecture — it usually answers their questions faster than a doc."`,
      `"Sounds like the last all-hands had some pain — that's exactly what we'd want to dig into on a call."`,
    ],
    weakRepResponses: [
      `"Vbrick is the best enterprise video platform on the market."`,
      `"You should seriously think about switching away from Teams."`,
      `"Can I send you a 40-page security deck and follow up next week?"`,
    ],
    coachingNote: `The key insight is that Vbrick does not replace Teams — it layers eCDN delivery behind it. Reps who lead with "replace your tools" lose. Reps who lead with "we make your existing tools work at scale" win. Name all three eCDN methods to signal depth.`,
    topMistakes: [
      `Pitching Vbrick as a Teams replacement`,
      `Going straight to features before confirming the network-strain pain`,
      `Closing with "I'll send you a link" instead of asking for the call`,
    ],
    topWinMoves: [
      `Name all three eCDN methods (peer-to-peer, edge caching, multicast) — it signals depth and differentiates`,
      `Position Vbrick as complementary to Teams, not competitive with it`,
      `Mirror her scale back to her — "200,000 employees" — to show you listened`,
    ],
    winningPathBeats: [
      {
        beat: 'Hook with scale empathy',
        goal: `Get Sarah to confirm the buffering or network problem`,
        idealLine: `"Running a live event for 200,000 people is a different animal — how has that been going on your end?"`,
      },
      {
        beat: 'Qualify the tech stack',
        goal: `Learn if they use Teams, Webex, or a custom setup for delivery`,
        idealLine: `"Are you running these through Teams today, or do you have something else handling the webcast layer?"`,
      },
      {
        beat: 'Bridge to eCDN',
        goal: `Connect the buffering pain to the three-method eCDN solution`,
        idealLine: `"We sit behind whatever webcast tool you use and handle the delivery — three technologies, one vendor, no WAN saturation."`,
      },
      {
        beat: 'Ask for the call',
        goal: `Book the 20-minute discovery call`,
        idealLine: `"I could send a one-pager, but honestly I'd give you a lot more in a quick 20-minute call — would you be open to that?"`,
      },
    ],
    track: 'easy',
  },

  'telco-field-tech-mobile': {
    id: 'telco-field-tech-mobile',
    title: 'Mobile Field-Technician Training',
    subtitle: `Help Verizon push updated procedures to field techs who learn on phones in the field`,
    estimatedMinutes: 4,
    defaultPersonaId: 'telco-verizon-field',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You are cold-calling Marcus Rivera, Senior Manager of Field Technician Enablement at Verizon. Marcus manages training content for thousands of field techs who work on towers, fiber installs, and equipment swaps. Training videos go stale fast and techs cannot find them on spotty LTE. Your goal is to surface the search-and-delivery pain, introduce Vbrick's Smart Search and governed mobile library, and book a 20-minute call.`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: '2. Ask for help',
        hint: `"I work with field-enablement teams on mobile training delivery — quick question, do you have 30 seconds?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `"When a procedure changes mid-shift, how do your techs find the updated training?" Listen for SharePoint chaos, helpdesk calls, or slow rollout.`,
      },
      {
        label: '4. Deliver the value prop',
        hint: `"Vbrick's Smart Search reads inside the video — a tech searches 'fiber splice' on their phone and gets the exact timestamp, not just a filename."`,
      },
      {
        label: '5. Handle the SharePoint objection',
        hint: `"SharePoint stores the file — Vbrick lets techs search inside what's actually said in the video. Big difference in the field."`,
      },
      {
        label: '6. Soft close',
        hint: `"I'd love to show you what the mobile experience looks like — 20 minutes, your call. Would that be useful?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: `Vbrick's governed video CMS with AI-powered Smart Search lets field techs search by topic and jump to the right moment inside a video — on a phone, over LTE. Near-instant publish means a new safety procedure is live to every tech's device in minutes, not days.`,
    repGoal: `Book a 20-minute call to show Marcus the mobile experience and Smart Search in action`,
    desiredOutcome: `Marcus agrees to a discovery call, ideally open to including a peer from IT or L&D`,
    openingContinuation: `Hi Marcus, this is [Your Name] with Vbrick — I work with field-enablement teams at large telcos. Quick question for you?`,
    prospectTone: `Direct and practical. Marcus is open to solutions that solve a real operational problem but impatient with anything that sounds like enterprise marketing.`,
    likelyProspectResponses: [
      `Yeah, go ahead — make it quick`,
      `We use SharePoint for that — it works but it's a mess`,
      `My techs don't have time to learn another system`,
      `How does it handle low bandwidth or spotty LTE?`,
      `Can we push urgent updates without waiting on IT?`,
      `What does Smart Search actually do differently than a regular keyword search?`,
    ],
    strongRepResponses: [
      `"Smart Search reads what's actually said inside the video — 'fiber splice' returns the exact clip, not just a file with those words in the title."`,
      `"Publish is near-instant. You update the video, hit publish, and it's live on every tech's phone — no IT ticket needed."`,
      `"The mobile experience is built for LTE — adaptive streaming, works on any modern phone, no app install required."`,
      `"If 40% of your helpdesk calls are topics that exist in video, Smart Search gets that call volume back."`,
    ],
    weakRepResponses: [
      `"Vbrick is a comprehensive enterprise video platform with robust features."`,
      `"You should replace SharePoint entirely with Vbrick."`,
      `"Let me send you our full feature comparison document."`,
    ],
    coachingNote: `Marcus responds to operational specifics, not platform vision. Smart Search is the hook — paint what a tech actually experiences searching from a phone in a parking lot. Never say "comprehensive" or "robust." Speak his language: fast, mobile, works in the field.`,
    topMistakes: [
      `Leading with platform capabilities instead of the field-tech on-the-job experience`,
      `Not asking how the current SharePoint situation is actually working day-to-day`,
      `Closing with "I'll send you a link" instead of asking for demo time`,
    ],
    topWinMoves: [
      `Paint the field scenario: "tech on a tower, needs the right procedure, has three minutes" — make it vivid`,
      `Name Smart Search and explain it searches inside what's spoken, not just filenames`,
      `Connect near-instant publish to a real operational pain he just described`,
    ],
    winningPathBeats: [
      {
        beat: 'Hook with the field scenario',
        goal: `Get Marcus to picture the tech-on-the-job problem`,
        idealLine: `"When a tech is in the field and needs to find a procedure fast — how does that actually work today?"`,
      },
      {
        beat: 'Expose the SharePoint gap',
        goal: `Surface that current tools don't search inside video content`,
        idealLine: `"Does SharePoint let them search inside the video itself — or just find the file by name?"`,
      },
      {
        beat: 'Introduce Smart Search + fast publish',
        goal: `Show the two capabilities that solve his core problem`,
        idealLine: `"Vbrick's Smart Search finds the right timestamp inside any video. And publish is near-instant — new procedure, live to every phone in minutes."`,
      },
      {
        beat: 'Ask for the call',
        goal: `Book a 20-minute demo focused on the mobile experience`,
        idealLine: `"I'd love to show you what it looks like on a phone — takes about 20 minutes. Would that be useful?"`,
      },
    ],
    track: 'easy',
  },

  'telco-retail-frontline': {
    id: 'telco-retail-frontline',
    title: 'Frontline Retail Enablement',
    subtitle: `Help T-Mobile get training to retail reps before device launches, not after`,
    estimatedMinutes: 4,
    defaultPersonaId: 'telco-tmobile-retail',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You are cold-calling Jamie Park, Director of Retail Learning & Enablement at T-Mobile. T-Mobile launches new devices and plans every few weeks. Jamie's team struggles to get training videos to frontline retail reps before launch day. Content is scattered across email, Teams, and an LMS that reps rarely log into. Your goal is to surface the launch-cadence gap, introduce Vbrick's fast-publish mobile library, and book a 20-minute call.`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: '2. Ask for help',
        hint: `"I work with retail-enablement teams on getting training to frontline reps fast — one quick question?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `"When a new device launches, how quickly can you get a training video in front of every rep?" Listen for LMS lag, scattered channels, or post-launch delivery.`,
      },
      {
        label: '4. Deliver the value prop',
        hint: `"Vbrick publishes to a mobile portal in minutes — no app install, works on any phone. Reps get it the day before launch, not the day after."`,
      },
      {
        label: '5. Handle the LMS objection',
        hint: `"Totally — keep the LMS for formal certifications. Vbrick handles the short, fast-turnaround videos reps actually watch in the break room before a launch."`,
      },
      {
        label: '6. Soft close',
        hint: `"I could walk you through the publish-to-phone flow in about 20 minutes — would that be worth your time?"`,
      },
    ],
    difficultyScore: 2,
    whyVbrickFits: `Vbrick's governed video CMS lets L&D teams publish a training video and have it live in a branded mobile portal within minutes — no app install for reps. Built-in completion reporting shows who has watched before launch day. Fast-moving retail enablement is a natural fit.`,
    repGoal: `Book a 20-minute call to show the publish-to-phone workflow and completion reporting`,
    desiredOutcome: `Jamie agrees to a 20-minute call and is open to a brief live demo`,
    openingContinuation: `Hi Jamie, this is [Your Name] with Vbrick. I work with retail L&D teams at telcos — quick question about your launch cadence?`,
    prospectTone: `Energetic and direct. Jamie moves fast and wants solutions that match her pace.`,
    likelyProspectResponses: [
      `Sure, what's up?`,
      `We push everything through our LMS — it's slow but it's what we have`,
      `Reps don't install new apps — how do they access it?`,
      `How fast can we actually publish something new?`,
      `Does it give us completion data so we know who's watched before launch?`,
      `What does the rep experience look like on a phone?`,
    ],
    strongRepResponses: [
      `"No app install — reps open a link, it's a branded mobile portal that works on any phone."`,
      `"Publish is near-instant. Upload, tag, hit publish — it's live on every rep's phone in minutes."`,
      `"Completion reporting is built in — you can see who watched before launch day and who hasn't."`,
      `"We play alongside the LMS — Vbrick handles fast-turnaround video; LMS handles the formal certifications."`,
    ],
    weakRepResponses: [
      `"You should really reconsider your entire LMS strategy."`,
      `"Vbrick is a comprehensive, robust enterprise video platform."`,
      `"Let me send you a 20-page white paper on video delivery."`,
    ],
    coachingNote: `Jamie's currency is speed. Every response should have a speed-or-mobile angle. The LMS objection is a gift — Vbrick is not competing with it, it's complementing it for fast-turnaround content. Never use the word "platform" with Jamie; use "tool" or just describe the action.`,
    topMistakes: [
      `Positioning Vbrick as an LMS replacement`,
      `Talking about enterprise governance before addressing launch speed`,
      `Closing with "I'll send you some info" instead of booking the call`,
    ],
    topWinMoves: [
      `Lead with "how fast can you get a video to every rep's phone right now?" to expose the lag`,
      `Name no-app-install immediately — it's a barrier Jamie hears about constantly`,
      `Connect completion reporting to launch-day readiness — that's her accountability metric`,
    ],
    winningPathBeats: [
      {
        beat: 'Hook on launch cadence',
        goal: `Get Jamie to describe the gap between content-ready and rep-ready`,
        idealLine: `"With launches every few weeks, how are you making sure reps have the training before they hit the floor?"`,
      },
      {
        beat: 'Surface the distribution problem',
        goal: `Confirm that getting video to reps fast is the real friction, not creating it`,
        idealLine: `"Is it more about creating the content faster, or actually getting it in front of every rep before launch day?"`,
      },
      {
        beat: 'Pitch speed and mobile',
        goal: `Connect fast publish and no-app-install mobile portal to her launch problem`,
        idealLine: `"Vbrick publishes in minutes to a mobile portal — no app install, no LMS login. Rep gets a link, watches in the break room."`,
      },
      {
        beat: 'Ask for the call',
        goal: `Book a 20-minute demo focused on publish-to-phone`,
        idealLine: `"I could walk you through the publish-to-phone flow in about 20 minutes — would that be worth your time?"`,
      },
    ],
    track: 'easy',
  },

  'telco-care-knowledge-ai': {
    id: 'telco-care-knowledge-ai',
    title: 'Contact-Center Knowledge → AI Deflection',
    subtitle: `Help Comcast surface video knowledge inside ServiceNow to cut handle time and deflect cases`,
    estimatedMinutes: 4,
    defaultPersonaId: 'telco-comcast-care',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You are cold-calling Diana Torres, Director of Contact-Center Knowledge at Comcast. Comcast's contact center runs on ServiceNow. Diana's team manages knowledge content for thousands of agents, but video training and how-to content is invisible inside ServiceNow — agents cannot find it mid-call, so handle time stays high and escalations accumulate. Vbrick is the only certified video app in the ServiceNow Store and powers Now Assist for case deflection. Your goal is to surface this fit and book a 20-minute call.`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: '2. Ask for help',
        hint: `"I work with contact-center knowledge teams on surfacing video content inside ServiceNow — one quick question?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `"When agents are on a live call and need a how-to video, how does that work today?" Listen for agents leaving ServiceNow, failed searches, or escalations.`,
      },
      {
        label: '4. Deliver the value prop',
        hint: `"Vbrick is the only certified video app in the ServiceNow Store — agents find and play training video without ever leaving the case view."`,
      },
      {
        label: '5. Handle the KM-strategy objection',
        hint: `"Totally — we're not replacing your KM strategy. We make the video your team already creates findable inside ServiceNow, and surface it through Now Assist."`,
      },
      {
        label: '6. Soft close',
        hint: `"I'd love to show you the ServiceNow integration in about 20 minutes — would that be useful for your team?"`,
      },
    ],
    difficultyScore: 3,
    whyVbrickFits: `Vbrick is the ONLY certified video app in the ServiceNow Store and powers Now Assist for case deflection and faster resolution. Agents find and play video knowledge without leaving the case view. Smart Search also lets agents query video content like a knowledge base, returning exact timestamps.`,
    repGoal: `Book a 20-minute call to demo the ServiceNow integration and Now Assist capability`,
    desiredOutcome: `Diana agrees to a call and is open to including her ServiceNow admin or KM lead`,
    openingContinuation: `Hi Diana, this is [Your Name] with Vbrick. We work with contact-center knowledge teams — quick question about your ServiceNow setup?`,
    prospectTone: `Analytical and measured. Diana asks smart follow-up questions and responds well to specifics and metrics.`,
    likelyProspectResponses: [
      `Sure, what's the question?`,
      `We have a pretty mature KM strategy already — what's the angle?`,
      `ServiceNow integration sounds complicated — how long does that take?`,
      `Does this work with Now Assist?`,
      `What's the difference between this and just putting videos in the knowledge base?`,
      `How does the AI surfacing work — is it automatic?`,
    ],
    strongRepResponses: [
      `"We're the only video app certified in the ServiceNow Store — plugs into your existing instance, no custom dev required."`,
      `"Yes, we power Now Assist — agents ask a question and the AI surfaces the right video clip, not just a text article."`,
      `"Smart Search reads inside the video — 'billing dispute process' returns the exact timestamp, not just the video title."`,
      `"The integration is typically live in days from the ServiceNow Store — your admin configures it directly."`,
    ],
    weakRepResponses: [
      `"Vbrick is a comprehensive enterprise video platform — we do everything."`,
      `"You should convert all your knowledge base articles to video going forward."`,
      `"Let me send you a white paper on AI-powered video knowledge."`,
    ],
    coachingNote: `Diana responds to metrics and platform specifics. The certified ServiceNow app is the anchor — name it early. Then bridge to handle time and deflection. If she asks about Now Assist, that is a buying signal — lean into it immediately. Avoid feature sprawl; stay focused on the ServiceNow and handle-time story.`,
    topMistakes: [
      `Not naming the ServiceNow Store certification early — it's the most credible thing you can say`,
      `Getting into AI features before confirming how agents currently find video content mid-call`,
      `Closing without asking to include her ServiceNow admin in the discovery call`,
    ],
    topWinMoves: [
      `Name "only certified video app in the ServiceNow Store" early and let her ask how that works`,
      `Tie Smart Search and Now Assist directly to handle time and deflection — her core metrics`,
      `Ask if she'd want to loop in her ServiceNow admin — it accelerates the evaluation`,
    ],
    winningPathBeats: [
      {
        beat: 'Hook on the video-in-ServiceNow gap',
        goal: `Get Diana to describe how agents find video content today`,
        idealLine: `"When agents are mid-call and need a how-to video — are they finding that inside ServiceNow, or leaving the platform to search?"`,
      },
      {
        beat: 'Land the ServiceNow certification',
        goal: `Establish credibility and differentiation with a provable fact`,
        idealLine: `"We're the only certified video app in the ServiceNow Store — so agents find and play video without ever leaving the case view."`,
      },
      {
        beat: 'Bridge to Now Assist and deflection',
        goal: `Connect AI surfacing to handle time and case deflection`,
        idealLine: `"We also power Now Assist — agents ask a question and the AI surfaces the right video clip automatically, which shortens handle time."`,
      },
      {
        beat: 'Ask for the call',
        goal: `Book a 20-minute demo; invite the ServiceNow admin`,
        idealLine: `"I'd love to show you the integration in about 20 minutes — would it make sense to include your ServiceNow admin?"`,
      },
    ],
    track: 'easy',
  },

  'telco-secure-comms-governance': {
    id: 'telco-secure-comms-governance',
    title: 'Secure, Governed Video for CPNI-Sensitive Communications',
    subtitle: `Help Lumen Technologies govern recorded video that touches customer data with RBAC, retention, and audit trails`,
    estimatedMinutes: 4,
    defaultPersonaId: 'telco-lumen-security',
    defaultAccent: 'general',
    scenarioContext: `CALL CONTEXT: You are cold-calling Kevin Walsh, Director of Information Security & Governance at Lumen Technologies. Lumen handles CPNI-regulated customer data. Kevin's concern: recorded all-hands and training sessions referencing customer data are stored in uncontrolled cloud tools with no RBAC, no retention policy, and no audit trail. Vbrick is FedRAMP-certified (the only enterprise video platform that is), SOC 2 Type II compliant, encrypts at rest and in transit, and offers fine-grained RBAC plus full audit logs. Your goal is to surface the compliance fit and book a 20-minute call.`,
    hardModeContext: '',
    cheatCard: [
      {
        label: '1. Greet + introduce yourself',
        hint: `They say "Hello?" — you introduce yourself: say your own first and last name in a warm, inquisitive tone ("Hi, this is [Your Name]?").`,
      },
      {
        label: '2. Ask for help',
        hint: `"I work with security and governance teams on governed video for sensitive communications — quick question?"`,
      },
      {
        label: '3. Qualify the pain',
        hint: `"When your team records a session that references customer data, what controls do you have on who can access that recording?" Listen for gaps in RBAC or audit trail.`,
      },
      {
        label: '4. Deliver the value prop',
        hint: `"Vbrick is FedRAMP-certified — the only enterprise video platform that is — plus SOC 2 Type II, RBAC to the individual video level, retention policies, and full audit logs."`,
      },
      {
        label: '5. Handle the FedRAMP objection',
        hint: `"That's a fair point — for commercial telcos, FedRAMP is about the rigor of the security program, not the customer type. Most of our commercial clients use it as a proxy for security depth."`,
      },
      {
        label: '6. Soft close',
        hint: `"I could send over our security overview, but I'd give you a lot more in a 20-minute call with our security team — would that be worth your time?"`,
      },
    ],
    difficultyScore: 3,
    whyVbrickFits: `Vbrick is the ONLY FedRAMP-certified enterprise video platform AND the only FedRAMP-certified eCDN. It is SOC 2 Type II compliant, encrypts data at rest and in transit, offers multi-layered RBAC to the individual video level, configurable retention policies, and full audit logs including delete events. For CPNI-sensitive communications, it is the most defensible video governance choice available.`,
    repGoal: `Book a 20-minute security-focused call, ideally including a member of Vbrick's security team`,
    desiredOutcome: `Kevin agrees to a 20-minute call and acknowledges Vbrick is worth running through his review process`,
    openingContinuation: `Hi Kevin, this is [Your Name] with Vbrick. I work with security and governance teams at telcos — quick question about how you govern recorded communications?`,
    prospectTone: `Measured and detail-oriented. Kevin warms up when certifications are named precisely and cools when claims are vague or unverifiable.`,
    likelyProspectResponses: [
      `Sure, go ahead`,
      `We've been burned before by vendors claiming compliance they couldn't actually prove`,
      `FedRAMP is for government agencies — how does that apply to a commercial telco?`,
      `What certifications do you actually hold — specifically?`,
      `How granular is the RBAC — per video or just per channel?`,
      `Do you have an audit log for every access event, including deletes?`,
    ],
    strongRepResponses: [
      `"FedRAMP-certified — the only enterprise video platform that is. It's a matter of public record, not a marketing claim."`,
      `"SOC 2 Type II, encryption at rest and in transit, RBAC to the individual video level, and full audit logs including deletes."`,
      `"RBAC is per video — you control exactly who has access to a specific recording, down to the individual user."`,
      `"Our security team can walk through the controls and answer your review questions directly — usually cuts the 90-day process down significantly."`,
    ],
    weakRepResponses: [
      `"We're the most secure video platform in the industry."`,
      `"CPNI probably doesn't apply to internal training video anyway."`,
      `"I can send you a compliance checklist document."`,
    ],
    coachingNote: `Kevin is won by precision, not enthusiasm. Every claim must have a specific certification or control behind it — no generalities. FedRAMP is your strongest card; play it early and explain why the rigor of the program matters for commercial telcos. Offer a call with the Vbrick security team, not just an account exec.`,
    topMistakes: [
      `Making vague security claims without naming specific certifications`,
      `Not connecting CPNI obligations explicitly to the video governance gap`,
      `Closing with "I'll send a security deck" instead of offering a security-team call`,
    ],
    topWinMoves: [
      `Name FedRAMP early and note it's a matter of public record — signals you can prove it`,
      `Be specific about RBAC granularity (per-video level) before he asks — answers his next question proactively`,
      `Offer a call with the Vbrick security team — it signals seriousness and accelerates his review process`,
    ],
    winningPathBeats: [
      {
        beat: 'Hook on the CPNI governance gap',
        goal: `Get Kevin to describe the access control problem on current recorded sessions`,
        idealLine: `"When a recorded all-hands or training session touches customer data — CPNI territory — what controls are on who can access that recording?"`,
      },
      {
        beat: 'Land FedRAMP as the anchor',
        goal: `Establish credibility with the most defensible, verifiable claim`,
        idealLine: `"Vbrick is the only FedRAMP-certified enterprise video platform. Public record. SOC 2 Type II on top of that."`,
      },
      {
        beat: 'Specify the controls',
        goal: `Answer the RBAC and audit-trail questions before he asks them`,
        idealLine: `"RBAC goes to the individual video level. Audit log covers every access and delete event. Retention policies are configurable per content category."`,
      },
      {
        beat: 'Ask for the call with the security team',
        goal: `Book a 20-minute call that includes Vbrick's security team`,
        idealLine: `"I'd love to set up 20 minutes with our security team — they can answer your review questions directly and usually cut the review timeline down."`,
      },
    ],
    track: 'easy',
  },
}

export function getScenarioById(id: string | null | undefined): SparringScenario | null {
  if (!id) return null
  return SPARRING_SCENARIOS[id] ?? null
}
