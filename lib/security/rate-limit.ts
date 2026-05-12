type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateWindow = new Map<string, RateLimitEntry>()

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateWindow.get(key)

  if (!entry || now > entry.resetAt) {
    rateWindow.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  entry.count += 1
  return entry.count > limit
}
