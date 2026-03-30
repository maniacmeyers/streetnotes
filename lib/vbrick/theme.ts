/**
 * Neumorphic Design System tokens for the VBRICK Command Center.
 * All new neumorphic components reference these tokens.
 */

export const neuTheme = {
  colors: {
    bg: '#e0e5ec',
    bgLight: '#edf0f5',
    highlight: '#ffffff',
    shadow: '#a3b1c6',
    accent: {
      primary: '#6366f1',
      hover: '#818cf8',
      muted: '#a5b4fc',
    },
    text: {
      heading: '#2d3436',
      body: '#44475a',
      muted: '#636e72',
      subtle: '#b2bec3',
    },
    score: {
      red: '#dc2626',
      amber: '#d97706',
      cyan: '#0891b2',
      green: '#16a34a',
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#6366f1',
    },
  },

  shadows: {
    raised: '6px 6px 12px #a3b1c6, -6px -6px 12px #ffffff',
    raisedSm: '3px 3px 6px #a3b1c6, -3px -3px 6px #ffffff',
    raisedHover: '8px 8px 16px #a3b1c6, -8px -8px 16px #ffffff',
    inset: 'inset 4px 4px 8px #a3b1c6, inset -4px -4px 8px #ffffff',
    insetSm: 'inset 2px 2px 4px #a3b1c6, inset -2px -2px 4px #ffffff',
    pressed: 'inset 2px 2px 5px #a3b1c6, inset -2px -2px 5px #ffffff',
  },

  transitions: {
    default: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  easing: {
    default: [0.4, 0, 0.2, 1] as const,
  },

  radii: {
    sm: '12px',
    md: '16px',
    lg: '20px',
    xl: '28px',
    full: '9999px',
  },

  spacing: {
    sidebar: 288,
    header: 80,
  },
} as const

export type NeuTheme = typeof neuTheme
