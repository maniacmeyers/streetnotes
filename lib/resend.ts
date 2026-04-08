const NOTIFY_TO = 'jeff@forgetime.ai'

/**
 * Send an internal notification email via Resend.
 * Awaited so Vercel doesn't kill the request before delivery.
 * Logs errors but never throws — notifications must not break user flows.
 */
export async function sendNotification(subject: string, text: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping notification:', subject)
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'StreetNotes <notifications@streetnotes.ai>',
        to: NOTIFY_TO,
        subject,
        text,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`Resend notification failed (${res.status}):`, body)
    }
  } catch (err) {
    console.error('Resend notification error:', err)
  }
}

/**
 * Send an HTML email to a specific recipient via Resend.
 * Used for weekly practice summaries and other automated emails.
 */
export async function sendHTMLEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email to:', to)
    return
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'StreetNotes <notifications@streetnotes.ai>',
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.text()
      console.error(`Resend email failed (${res.status}):`, body)
    }
  } catch (err) {
    console.error('Resend email error:', err)
  }
}
