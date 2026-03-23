export function scoreColor(score: number): string {
  if (score <= 3) return '#EF4444'   // red
  if (score <= 6) return '#F59E0B'   // amber
  if (score <= 8) return '#7ed4f7'   // cyan
  return '#22C55E'                    // green
}

export function scoreColorClass(score: number): string {
  if (score <= 3) return 'text-red-500'
  if (score <= 6) return 'text-amber-500'
  if (score <= 8) return 'text-[#7ed4f7]'
  return 'text-green-500'
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
