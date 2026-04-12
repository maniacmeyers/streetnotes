import type { CRMNote } from '@/lib/notes/schema'
import { parseName, parseEstimatedValue } from '@/lib/crm/push/stage-mapper'

interface NoteRow {
  id: string
  created_at: string
  structured_output: Record<string, unknown> | null
}

function extractCrmNote(so: Record<string, unknown> | null): CRMNote | null {
  if (!so) return null
  if ('crmNote' in so) return so.crmNote as CRMNote
  return so as unknown as CRMNote
}

function csvField(value: unknown): string {
  if (value === null || value === undefined) return ''

  let str: string
  if (Array.isArray(value)) {
    str = value.filter(Boolean).join(' / ')
  } else if (typeof value === 'number') {
    return String(value)
  } else if (value instanceof Date) {
    return value.toISOString().split('T')[0]
  } else {
    str = String(value)
  }

  // Strip NULL bytes
  str = str.replace(/\0/g, '')

  // Normalize line endings
  str = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // Truncate at Excel cell limit
  if (str.length > 32767) str = str.slice(0, 32764) + '...'

  // Quote if contains special chars
  if (str.includes('"') || str.includes('\n') || str.includes(',') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }

  return str
}

export const HUBSPOT_HEADERS = [
  'Email', 'First Name', 'Last Name', 'Company Name', 'Job Title',
  'Note Body', 'Note Date', 'Deal Name', 'Deal Stage', 'Deal Amount',
  'Close Date', 'Next Step', 'Next Step Due Date',
] as const

export const SALESFORCE_HEADERS = [
  'ActivityDate', 'Subject', 'Description', 'Status', 'Type', 'Priority',
  'Contact First Name', 'Contact Last Name', 'Contact Email',
  'Account Name', 'Opportunity Name', 'Stage', 'Amount', 'Close Date',
] as const

export function buildHubspotRows(notes: NoteRow[]): string[][] {
  return notes.map(note => {
    const crm = extractCrmNote(note.structured_output)
    if (!crm) {
      return ['', '', '', '', '', '', note.created_at.split('T')[0], '', '', '', '', '', '']
    }
    const { firstName, lastName } = crm.contactName ? parseName(crm.contactName) : { firstName: '', lastName: '' }
    const amount = crm.estimatedValue ? parseEstimatedValue(crm.estimatedValue) : null
    const noteBody = [
      ...(crm.meetingSummary ?? []),
      crm.opportunityNotes ?? '',
      ...(crm.painPoints ?? []).map(p => `Pain: ${p}`),
    ].filter(Boolean).join('\n')
    const firstStep = crm.nextSteps?.[0]

    return [
      '',  // Email — not extracted
      firstName,
      lastName,
      crm.company ?? '',
      crm.attendees?.[0]?.title ?? '',
      noteBody,
      note.created_at.split('T')[0],
      crm.company ? `${crm.company} Deal` : '',
      crm.dealStage ?? '',
      amount !== null ? String(amount) : '',
      crm.closeDate ?? '',
      firstStep?.task ?? '',
      firstStep?.dueDate ?? '',
    ]
  })
}

export function buildSalesforceRows(notes: NoteRow[]): string[][] {
  return notes.map(note => {
    const crm = extractCrmNote(note.structured_output)
    if (!crm) {
      return [note.created_at.split('T')[0], '', '', '', '', '', '', '', '', '', '', '', '', '']
    }
    const { firstName, lastName } = crm.contactName ? parseName(crm.contactName) : { firstName: '', lastName: '' }
    const amount = crm.estimatedValue ? parseEstimatedValue(crm.estimatedValue) : null
    const descriptionParts = [
      'Meeting Summary:',
      ...(crm.meetingSummary ?? []).map(s => `- ${s}`),
      '',
      crm.opportunityNotes ?? '',
      '',
      ...((crm.painPoints ?? []).length > 0 ? ['Pain Points:', ...(crm.painPoints ?? []).map(p => `- ${p}`)] : []),
      ...((crm.competitorsMentioned ?? []).length > 0 ? ['Competitors: ' + (crm.competitorsMentioned ?? []).join(', ')] : []),
    ]
    const description = descriptionParts.filter(s => s !== undefined).join('\n')
    const subject = `Meeting Notes - ${crm.contactName || 'Unknown'} - ${note.created_at.split('T')[0]}`

    return [
      note.created_at.split('T')[0],                         // ActivityDate
      subject,                                                 // Subject
      description,                                             // Description
      'Completed',                                             // Status
      'Call',                                                  // Type
      'Normal',                                                // Priority
      firstName,                                               // Contact First Name
      lastName,                                                // Contact Last Name
      '',                                                      // Contact Email — not extracted
      crm.company ?? '',                                       // Account Name
      crm.company ? `${crm.company} - Opportunity` : '',      // Opportunity Name
      crm.dealStage ?? '',                                     // Stage
      amount !== null ? String(amount) : '',                   // Amount
      crm.closeDate ?? '',                                     // Close Date
    ]
  })
}

export function toCsv(headers: readonly string[], rows: string[][]): string {
  const BOM = '\uFEFF'
  const head = headers.map(h => csvField(h)).join(',')
  const body = rows.map(row => row.map(cell => csvField(cell)).join(',')).join('\r\n')
  return BOM + head + '\r\n' + (body ? body + '\r\n' : '')
}
