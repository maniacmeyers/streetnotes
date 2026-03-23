export interface ColumnMapping {
  name: string
  title: string
  company: string
  phone: string
  notes: string
}

export interface QueueContact {
  contactName: string
  contactTitle: string
  company: string
  phone: string
  salesforceNotes: string
}

export const DEFAULT_IMPORT_MAPPING: ColumnMapping = {
  name: 'Name',
  title: 'Title',
  company: 'Company',
  phone: 'Phone',
  notes: 'Notes',
}

export const DEFAULT_EXPORT_MAPPING = {
  date: 'Date',
  contactName: 'Contact Name',
  title: 'Title',
  company: 'Company',
  phone: 'Phone',
  callDisposition: 'Call Disposition',
  prospectStatus: 'Prospect Status',
  prospectStatusDetail: 'Prospect Status Detail',
  currentSolution: 'Current Solution',
  theTruth: 'The Truth',
  spinComposite: 'SPIN Composite Score',
  nextAction: 'Next Action',
  nextActionWhen: 'Next Action When',
  aeBriefing: 'AE Briefing',
  objections: 'Objections',
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

export function parseCallListCSV(
  csvText: string,
  mapping: ColumnMapping = DEFAULT_IMPORT_MAPPING
): QueueContact[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const headerMap = new Map<string, number>()
  headers.forEach((h, i) => headerMap.set(h.toLowerCase().trim(), i))

  const getIndex = (field: string) => {
    const lower = field.toLowerCase().trim()
    // Try exact match first
    if (headerMap.has(lower)) return headerMap.get(lower)!
    // Try partial match
    for (const [key, idx] of headerMap) {
      if (key.includes(lower) || lower.includes(key)) return idx
    }
    return -1
  }

  const nameIdx = getIndex(mapping.name)
  const titleIdx = getIndex(mapping.title)
  const companyIdx = getIndex(mapping.company)
  const phoneIdx = getIndex(mapping.phone)
  const notesIdx = getIndex(mapping.notes)

  if (nameIdx === -1 && companyIdx === -1) {
    return []
  }

  const contacts: QueueContact[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.every(v => !v)) continue

    const name = nameIdx >= 0 ? values[nameIdx] || '' : ''
    const company = companyIdx >= 0 ? values[companyIdx] || '' : ''

    if (!name && !company) continue

    contacts.push({
      contactName: name,
      contactTitle: titleIdx >= 0 ? values[titleIdx] || '' : '',
      company,
      phone: phoneIdx >= 0 ? values[phoneIdx] || '' : '',
      salesforceNotes: notesIdx >= 0 ? values[notesIdx] || '' : '',
    })
  }

  return contacts
}

export interface SessionCall {
  date: string
  contactName: string
  title: string
  company: string
  phone: string
  callDisposition: string
  prospectStatus: string
  prospectStatusDetail: string
  currentSolution: string
  theTruth: string
  spinComposite: string
  nextAction: string
  nextActionWhen: string
  aeBriefing: string
  objections: string
}

function escapeCSVField(value: string): string {
  if (!value) return ''
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateActivityCSV(calls: SessionCall[]): string {
  const headers = Object.values(DEFAULT_EXPORT_MAPPING)
  const rows = calls.map(call =>
    [
      call.date,
      call.contactName,
      call.title,
      call.company,
      call.phone,
      call.callDisposition,
      call.prospectStatus,
      call.prospectStatusDetail,
      call.currentSolution,
      call.theTruth,
      call.spinComposite,
      call.nextAction,
      call.nextActionWhen,
      call.aeBriefing,
      call.objections,
    ].map(escapeCSVField).join(',')
  )

  return [headers.join(','), ...rows].join('\n')
}
