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

// Vbrick product context injected into AI prompts
export const VBRICK_PRODUCT_CONTEXT = `The BDR sells Vbrick, an enterprise video platform. Core products: live streaming, video on demand (VOD), video content management, AI-powered video search, eCDN. Primary competitors: Panopto, Kaltura, Microsoft Stream, Brightcove, Qumu.`
