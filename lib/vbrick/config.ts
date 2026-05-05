export const VBRICK_ALLOWED_EMAILS = [
  'jeff@forgetime.ai',
  'jeff@careermaniacs.com',
]

export function isVbrickUser(email: string): boolean {
  const clean = email.toLowerCase().trim()
  return clean.endsWith('@vbrick.com') || VBRICK_ALLOWED_EMAILS.includes(clean)
}

export const VBRICK_CONFIG = {
  productName: 'Vbrick Command Center',
  emailDomain: 'vbrick.com',
  defaultSegment: 'bdr-cold-call' as const,
  enableSPIN: true,
  rateLimitDisabled: true,

  brand: {
    // Neumorphic design system colors
    bg: '#e0e5ec',
    highlight: '#ffffff',
    shadow: '#a3b1c6',
    accent: '#6366f1',
    accentHover: '#818cf8',
    heading: '#2d3436',
    body: '#44475a',
    muted: '#636e72',
    subtle: '#b2bec3',
    // Score colors (adjusted for light bg)
    red: '#dc2626',
    amber: '#d97706',
    cyan: '#0891b2',
    green: '#16a34a',
    // Legacy (for anything still referencing old values)
    primaryNavy: '#6366f1',
    secondaryBlue: '#818cf8',
    accentCyan: '#6366f1',
    darkNavy: '#e0e5ec',
    darkSoft: '#e0e5ec',
    white: '#2d3436',
    gray50: '#e0e5ec',
    gray100: '#e0e5ec',
    gray200: '#b2bec3',
    gray300: '#a3b1c6',
    gray400: '#636e72',
    gray500: '#636e72',
    gray700: '#44475a',
    gray900: '#2d3436',
    redBg: '#fef2f2',
    amberBg: '#fffbeb',
    blue: '#6366f1',
    blueBg: '#eef2ff',
  },

  font: 'General Sans',

  product: {
    name: 'Vbrick',
    description: 'Enterprise video platform',
    coreProducts: ['Live streaming', 'Video on demand (VOD)', 'Video content management', 'AI-powered video search', 'eCDN'],
    competitors: ['Panopto', 'Kaltura', 'Microsoft Stream', 'Brightcove', 'Qumu'],
  },

  spinWeights: {
    situation: 1,
    problem: 1.5,
    implication: 2,
    needPayoff: 2.5,
  },

  bdrNames: ['Butcher', 'Kara'] as string[],
  bdrEmails: ['dylan.fawsitt@vbrick.com', 'kara.pryor@vbrick.com'] as string[],
  bdrDisplayNames: {
    'dylan.fawsitt@vbrick.com': 'Butcher',
    'kara.pryor@vbrick.com': 'Kara',
  } as Record<string, string>,

  // Head-to-head practice counter floor. Practices before this timestamp
  // do not count toward the leaderboard — keeps the competition fair when
  // older test/seed practice sessions exist in the database.
  leaderboardStartDate: '2026-05-04T00:00:00Z',

  // K26 (ServiceNow Knowledge 26 in Las Vegas, May 5–8 2026). Within this
  // window, the debrief flow defaults to event-conversation mode instead
  // of cold-call mode. After it expires, behavior reverts automatically;
  // the constant is left in place for future events — bump the dates and
  // it kicks back in.
  eventModeWindow: { start: '2026-05-05', end: '2026-05-08' },

  coachingPrompts: [
    "Who'd you talk to?",
    "What's actually going on at this account?",
    "Did you uncover the truth?",
    "What's their current solution?",
    "What happens if they do nothing?",
    "Is there a real opportunity here?",
  ],
}

export function isVbrickBdr(email: string): boolean {
  const clean = email.toLowerCase().trim()
  return VBRICK_CONFIG.bdrEmails.includes(clean)
}

// True when today's date falls inside the active event window. Compared
// at day granularity in UTC so a BDR debriefing late at night doesn't
// flip modes mid-shift.
export function isInEventWindow(now: Date = new Date()): boolean {
  const today = now.toISOString().split('T')[0]
  const { start, end } = VBRICK_CONFIG.eventModeWindow
  return today >= start && today <= end
}

// Mode the debrief flow should request from the structure endpoint when
// the BDR taps record. Today: 'event-conversation' during the K26 window,
// 'bdr-cold-call' otherwise.
export type DebriefMode = 'bdr-cold-call' | 'event-conversation'

export function activeDebriefMode(now: Date = new Date()): DebriefMode {
  return isInEventWindow(now) ? 'event-conversation' : 'bdr-cold-call'
}

// Vbrick product context injected into AI prompts
export const VBRICK_PRODUCT_CONTEXT = `The BDR sells Vbrick, an enterprise video platform. Core products: live streaming, video on demand (VOD), video content management, AI-powered video search, eCDN. Primary competitors: Panopto, Kaltura, Microsoft Stream, Brightcove, Qumu.`
