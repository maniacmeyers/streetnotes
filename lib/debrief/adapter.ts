import type { CRMNote } from '@/lib/notes/schema'
import type { DebriefStructuredOutput } from '@/lib/debrief/types'

const NOT_MENTIONED = 'Not mentioned'

function text(value: string | undefined | null, fallback = NOT_MENTIONED): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

function arr(values: string[] | undefined): string[] {
  return values?.filter(Boolean) ?? []
}

export function crmNoteToDebriefOutput(note: CRMNote): DebriefStructuredOutput {
  const primary = note.attendees?.[0]
  const nextStep = note.nextSteps?.[0]?.task

  return {
    dealSegment: note.dealSegment ?? 'injector-check-in',
    dealSnapshot: {
      companyName: text(note.company),
      dealStage: text(note.aestheticDealStage ?? note.dealStage),
      estimatedValue: text(note.estimatedValue),
      closeDate: text(note.closeDate ?? note.buyingWindow),
      nextStep: text(nextStep, 'No next step captured'),
    },
    attendees:
      note.attendees && note.attendees.length > 0
        ? note.attendees.map((att) => ({
            name: text(att.name),
            title: text(att.title),
            role: att.role ?? 'Unknown',
            sentiment: att.sentiment ?? 'unknown',
          }))
        : [
            {
              name: text(note.contactName),
              title: text(primary?.title),
              role: primary?.role ?? 'Unknown',
              sentiment: primary?.sentiment ?? 'unknown',
            },
          ],
    callSummary: note.meetingSummary ?? [],
    followUpTasks:
      note.nextSteps?.map((step) => ({
        task: step.task,
        owner: step.owner,
        dueDate: step.dueDate ?? 'Not specified',
        priority: step.priority,
      })) ?? [],
    opportunityNotes: text(note.opportunityNotes, ''),
    competitorsMentioned: arr(note.competitorsMentioned),
    productsDiscussed: arr(note.productsDiscussed),
    painPoints: arr(note.painPoints),
    risks: arr(note.risks),
    ciMentions: note.ciMentions ?? [],
  }
}

export function debriefOutputToCRMNote(output: DebriefStructuredOutput): CRMNote {
  const primary = output.attendees[0]

  return {
    contactName:
      primary?.name && primary.name !== NOT_MENTIONED ? primary.name : undefined,
    contactNameConfidence: primary?.name && primary.name !== NOT_MENTIONED ? 'high' : undefined,
    company:
      output.dealSnapshot.companyName !== NOT_MENTIONED
        ? output.dealSnapshot.companyName
        : undefined,
    companyConfidence:
      output.dealSnapshot.companyName !== NOT_MENTIONED ? 'high' : undefined,
    dealStage: undefined,
    aestheticDealStage:
      output.dealSnapshot.dealStage !== NOT_MENTIONED
        ? (output.dealSnapshot.dealStage as CRMNote['aestheticDealStage'])
        : undefined,
    estimatedValue:
      output.dealSnapshot.estimatedValue !== NOT_MENTIONED
        ? output.dealSnapshot.estimatedValue
        : undefined,
    estimatedValueConfidence:
      output.dealSnapshot.estimatedValue !== NOT_MENTIONED ? 'high' : undefined,
    closeDate:
      output.dealSnapshot.closeDate !== NOT_MENTIONED
        ? output.dealSnapshot.closeDate
        : undefined,
    closeDateConfidence:
      output.dealSnapshot.closeDate !== NOT_MENTIONED ? 'medium' : undefined,
    dealSegment: output.dealSegment,
    meetingSummary: output.callSummary,
    nextSteps: output.followUpTasks.map((task) => ({
      task: task.task,
      owner: task.owner,
      dueDate: task.dueDate !== 'Not specified' ? task.dueDate : undefined,
      priority: task.priority,
      confidence: 'high',
    })),
    opportunityNotes: output.opportunityNotes || undefined,
    competitorsMentioned: output.competitorsMentioned,
    productsDiscussed: output.productsDiscussed,
    painPoints: output.painPoints,
    risks: output.risks,
    ciMentions: output.ciMentions,
    attendees: output.attendees.map((att) => ({
      name: att.name !== NOT_MENTIONED ? att.name : undefined,
      title: att.title !== NOT_MENTIONED ? att.title : undefined,
      role: att.role as NonNullable<CRMNote['attendees']>[number]['role'],
      sentiment: att.sentiment,
      confidence: 'high',
    })),
  }
}
