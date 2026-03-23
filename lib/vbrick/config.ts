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
    primaryNavy: '#1b3e6f',
    secondaryBlue: '#4570b3',
    accentCyan: '#7ed4f7',
    darkNavy: '#061222',
    darkSoft: '#0d1e3a',
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray700: '#374151',
    gray900: '#111827',
    red: '#EF4444',
    redBg: '#FEF2F2',
    amber: '#F59E0B',
    amberBg: '#FFFBEB',
    blue: '#3B82F6',
    blueBg: '#EFF6FF',
  },

  font: 'Inter',

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

  bdrNames: ['Dylan', 'Kara'] as string[],
  bdrEmails: ['dylan.fawsitt@vbrick.com', 'kara.pryor@vbrick.com'] as string[],

  coachingPrompts: [
    "Who'd you talk to?",
    "What's actually going on at this account?",
    "Did you uncover the truth?",
    "What's their current solution?",
    "What happens if they do nothing?",
    "Is there a real opportunity here?",
  ],
}

// Vbrick product context injected into AI prompts
export const VBRICK_PRODUCT_CONTEXT = `The BDR sells Vbrick, an enterprise video platform. Core products: live streaming, video on demand (VOD), video content management, AI-powered video search, eCDN. Primary competitors: Panopto, Kaltura, Microsoft Stream, Brightcove, Qumu.`
