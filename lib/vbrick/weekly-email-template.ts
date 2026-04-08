interface WeeklySummaryData {
  name: string
  sessionsThisWeek: number
  sessionsLastWeek: number
  bestScoreThisWeek: number | null
  currentStreak: number
  xpEarned: number
  xpTotal: number
  levelName: string
  level: number
  coachingTip: string
  dashboardUrl: string
}

export function buildWeeklySummaryHTML(data: WeeklySummaryData): string {
  const delta = data.sessionsThisWeek - data.sessionsLastWeek
  const deltaText = delta > 0 ? `+${delta} from last week` : delta < 0 ? `${delta} from last week` : 'same as last week'
  const deltaColor = delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#9ca3af'

  const streakEmoji = data.currentStreak > 0 ? '🔥' : ''
  const scoreDisplay = data.bestScoreThisWeek !== null ? data.bestScoreThisWeek.toFixed(1) : '—'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#061222;padding:24px 32px;text-align:center;">
            <p style="margin:0;color:#00E676;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:monospace;">Story Vault</p>
            <p style="margin:8px 0 0;color:#ffffff;font-size:20px;font-weight:700;">Weekly Practice Summary</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:24px 32px 16px;">
            <p style="margin:0;font-size:16px;color:#1f2937;">Hey ${data.name},</p>
            <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">Here's how your practice week went.</p>
          </td>
        </tr>

        <!-- Stats Grid -->
        <tr>
          <td style="padding:0 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding:12px;background:#f9fafb;border-radius:8px;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Sessions</p>
                  <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#1f2937;">${data.sessionsThisWeek}</p>
                  <p style="margin:2px 0 0;font-size:12px;color:${deltaColor};">${deltaText}</p>
                </td>
                <td width="8"></td>
                <td width="50%" style="padding:12px;background:#f9fafb;border-radius:8px;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Best Score</p>
                  <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#6366f1;">${scoreDisplay}</p>
                  <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">this week</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:12px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="33%" style="padding:12px;background:#f9fafb;border-radius:8px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Streak</p>
                  <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:${data.currentStreak > 0 ? '#f97316' : '#9ca3af'};">${streakEmoji} ${data.currentStreak}</p>
                </td>
                <td width="4"></td>
                <td width="33%" style="padding:12px;background:#f9fafb;border-radius:8px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">XP Earned</p>
                  <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#6366f1;">+${data.xpEarned}</p>
                </td>
                <td width="4"></td>
                <td width="33%" style="padding:12px;background:#f9fafb;border-radius:8px;text-align:center;">
                  <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Level</p>
                  <p style="margin:4px 0 0;font-size:22px;font-weight:800;color:#1f2937;">Lv.${data.level}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Coaching Tip -->
        <tr>
          <td style="padding:24px 32px 0;">
            <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-size:11px;color:#16a34a;text-transform:uppercase;letter-spacing:1px;font-weight:600;">This Week's Focus</p>
              <p style="margin:8px 0 0;font-size:14px;color:#1f2937;line-height:1.5;">${data.coachingTip}</p>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 32px;" align="center">
            <a href="${data.dashboardUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;">
              Continue Practicing
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">Powered by StreetNotes.ai</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`
}
