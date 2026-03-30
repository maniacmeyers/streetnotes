// Score colors adjusted for light neumorphic background (#e0e5ec)
// Using darker/more saturated shades for contrast

export function scoreColor(score: number): string {
  if (score <= 3) return '#dc2626'   // red-600
  if (score <= 6) return '#d97706'   // amber-600
  if (score <= 8) return '#6366f1'   // indigo (accent)
  return '#16a34a'                    // green-600
}

export function scoreColorClass(score: number): string {
  if (score <= 3) return 'text-red-600'
  if (score <= 6) return 'text-amber-600'
  if (score <= 8) return 'text-indigo-500'
  return 'text-green-600'
}

// For stat bars: determine color based on value/max ratio mapped to 0-10 scale
export function ratioScoreColor(value: number, max: number): string {
  const normalized = max > 0 ? (value / max) * 10 : 0
  return scoreColor(normalized)
}

export function ratioScoreColorClass(value: number, max: number): string {
  const normalized = max > 0 ? (value / max) * 10 : 0
  return scoreColorClass(normalized)
}
