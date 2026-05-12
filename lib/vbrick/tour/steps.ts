export type VbrickRoute =
  | '/vbrick/dashboard'
  | '/vbrick/dashboard/stories'
  | '/vbrick/dashboard/campaigns'
  | '/vbrick/dashboard/playbook'
  | '/vbrick/dashboard/sparring'

export type TourStep = {
  id: string
  route: VbrickRoute
  target?: string
  title: string
  body: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    route: '/vbrick/dashboard',
    title: 'Welcome to vbrick Command Center.',
    body: 'This is your BDR practice hub. 90 seconds to walk through it.',
  },
  {
    id: 'intention',
    route: '/vbrick/dashboard',
    target: '[data-tour="intention"]',
    title: 'Set your intention.',
    body: "Pick what you're working on today. Drives what shows up below.",
    position: 'bottom',
  },
  {
    id: 'quick-start',
    route: '/vbrick/dashboard',
    target: '[data-tour="quick-start"]',
    title: 'Quick Start.',
    body: 'Debrief a call, draft a story, or jump straight into sparring.',
    position: 'bottom',
  },
  {
    id: 'debrief',
    route: '/vbrick/dashboard',
    target: '[data-tour="debrief"]',
    title: 'Drop in a call.',
    body: 'Talk for 60 seconds after a meeting. We turn it into CRM fields plus coachable moments.',
    position: 'bottom',
  },
  {
    id: 'performance',
    route: '/vbrick/dashboard',
    target: '[data-tour="performance"]',
    title: 'Your numbers.',
    body: 'Calls, stories drafted, sparring reps. Updates live.',
    position: 'top',
  },
  {
    id: 'leaderboard',
    route: '/vbrick/dashboard',
    target: '[data-tour="leaderboard"]',
    title: 'Where you rank.',
    body: 'vs. the rest of the vbrick BDR team.',
    position: 'top',
  },
  {
    id: 'story-vault',
    route: '/vbrick/dashboard/stories',
    target: '[data-tour="story-vault"]',
    title: 'Your story vault.',
    body: 'Elevator pitches, Feel-Felt-Found, ABT customer stories. Drafted, scored, reusable.',
    position: 'bottom',
  },
  {
    id: 'story-practice',
    route: '/vbrick/dashboard/stories',
    target: '[data-tour="story-practice"]',
    title: 'Practice out loud.',
    body: 'Record yourself. Get scored. Share the challenge with a teammate.',
    position: 'top',
  },
  {
    id: 'campaigns',
    route: '/vbrick/dashboard/campaigns',
    target: '[data-tour="campaigns"]',
    title: 'Outbound campaigns.',
    body: "What you're running this week. Sequences, targets, results.",
    position: 'bottom',
  },
  {
    id: 'playbook-content',
    route: '/vbrick/dashboard/playbook',
    target: '[data-tour="playbook-content"]',
    title: 'The vbrick playbook.',
    body: 'Talk tracks, objection handling, qualification questions. The stuff that works.',
    position: 'bottom',
  },
  {
    id: 'playbook-frameworks',
    route: '/vbrick/dashboard/playbook',
    target: '[data-tour="playbook-frameworks"]',
    title: 'Frameworks on demand.',
    body: 'PAS, ABT, Feel-Felt-Found. Pulled up when you need them.',
    position: 'top',
  },
  {
    id: 'sparring-scenarios',
    route: '/vbrick/dashboard/sparring',
    target: '[data-tour="sparring-scenarios"]',
    title: 'Live sparring.',
    body: 'AI plays a prospect. You handle the call. Real-time.',
    position: 'bottom',
  },
  {
    id: 'sparring-pick',
    route: '/vbrick/dashboard/sparring',
    target: '[data-tour="sparring-pick"]',
    title: 'Pick your fight.',
    body: 'Cold call, discovery, objection drill, referral ask. Start anywhere.',
    position: 'top',
  },
  {
    id: 'done',
    route: '/vbrick/dashboard',
    title: "You're set.",
    body: "Replay this tour anytime from the 'Take the tour' button up top.",
  },
]
