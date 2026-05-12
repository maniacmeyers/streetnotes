export function waitForElement(
  selector: string,
  { timeoutMs = 3000 }: { timeoutMs?: number } = {},
): Promise<Element | null> {
  if (typeof document === 'undefined') return Promise.resolve(null)

  const existing = document.querySelector(selector)
  if (existing) return Promise.resolve(existing)

  return new Promise((resolve) => {
    let settled = false
    const finish = (value: Element | null) => {
      if (settled) return
      settled = true
      observer.disconnect()
      clearTimeout(timeoutId)
      resolve(value)
    }

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el) finish(el)
    })
    observer.observe(document.body, { childList: true, subtree: true })

    const timeoutId = window.setTimeout(() => finish(null), timeoutMs)
  })
}
