const keyFor = (email: string) => `vbrick:tour-seen:${email.toLowerCase()}`

export function hasSeenTour(email: string): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(keyFor(email)) === '1'
  } catch {
    return true
  }
}

export function markTourSeen(email: string | null): void {
  if (typeof window === 'undefined' || !email) return
  try {
    window.localStorage.setItem(keyFor(email), '1')
  } catch {}
}
