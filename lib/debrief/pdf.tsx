/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import path from 'path'
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { DebriefStructuredOutput, DealSegment } from './types'

const LOGO_PATH = path.join(process.cwd(), 'public', 'fieldglow', 'brand', 'logo.png')

/* ─── Field Glow palette ───
   Source: components/fieldglow/styles.css. Treat as a hard boundary. */
const C = {
  paper: '#F2EBDF',
  paper2: '#EBE3D5',
  cream: '#FAF6EE',
  white: '#FFFFFF',
  ink: '#1A1410',
  ink2: '#3D332A',
  mute: '#7A6F62',
  muteSoft: '#9C9085',
  line: '#D4C7B2',
  lineSoft: '#E7DDC9',
  gilt: '#A8855A',
  giltDeep: '#8B6B40',
  giltSoft: '#EAD9BD',
  blush: '#D4A28A',
  blushSoft: '#F5E2D5',
}

/* Sentiment + priority kept inside the Field Glow palette. No red/green/blue. */
function sentimentColor(s: string): string {
  if (s === 'positive') return C.gilt
  if (s === 'negative') return C.ink
  if (s === 'neutral') return C.mute
  return C.muteSoft
}

function priorityAccent(p: string): string {
  if (p === 'high') return C.giltDeep
  if (p === 'medium') return C.gilt
  return C.line
}

function priorityBg(p: string): string {
  if (p === 'high') return C.giltSoft
  if (p === 'medium') return C.blushSoft
  return C.paper2
}

function priorityColor(p: string): string {
  if (p === 'high') return C.giltDeep
  if (p === 'medium') return C.ink2
  return C.mute
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  /* Pages — cream "paper" so the editorial tone reads through */
  page: {
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.ink2,
    backgroundColor: C.cream,
  },

  bodyPage: {
    paddingTop: 64,
    paddingBottom: 60,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.ink2,
    backgroundColor: C.cream,
  },

  /* ── Cover page ── */

  /* Top gilt hairline (the only chrome above the masthead) */
  topGiltRule: {
    width: '100%',
    height: 1.5,
    backgroundColor: C.gilt,
  },

  /* Masthead — WHITE band so the bronze logo always renders cleanly */
  masthead: {
    backgroundColor: C.white,
    paddingTop: 26,
    paddingBottom: 22,
    paddingHorizontal: 48,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },

  mastheadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: { width: 132, height: 50 },

  mastheadMetaCol: { alignItems: 'flex-end' },

  mastheadMetaLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: C.mute,
    marginBottom: 3,
  },

  mastheadMetaText: {
    fontSize: 9,
    color: C.ink2,
    marginBottom: 1,
  },

  /* Hero — editorial "issue" title block on paper */
  hero: {
    backgroundColor: C.paper,
    paddingTop: 40,
    paddingBottom: 36,
    paddingHorizontal: 48,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  eyebrowRule: {
    width: 36,
    height: 1,
    backgroundColor: C.gilt,
    marginRight: 12,
  },

  eyebrowText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    color: C.ink2,
  },

  companyName: {
    fontFamily: 'Times-Roman',
    fontSize: 38,
    color: C.ink,
    letterSpacing: -1,
    lineHeight: 1.05,
    marginBottom: 10,
  },

  contactLine: {
    fontFamily: 'Times-Italic',
    fontSize: 13,
    color: C.ink2,
    marginBottom: 22,
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },

  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },

  badgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },

  /* ── Section header — gilt rule + tracked uppercase, no dark bar ── */
  sectionHeaderWrap: {
    marginHorizontal: 48,
    marginTop: 28,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionHeaderRule: {
    width: 28,
    height: 1,
    backgroundColor: C.gilt,
    marginRight: 12,
  },

  sectionHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: C.ink,
  },

  sectionHeaderCount: {
    fontFamily: 'Times-Italic',
    fontSize: 10,
    color: C.gilt,
    marginLeft: 8,
  },

  /* Section divider — three-dot asterism */
  asterismRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 4,
  },

  asterismDot: {
    fontFamily: 'Times-Italic',
    fontSize: 9,
    color: C.gilt,
    letterSpacing: 8,
  },

  /* Content area */
  sectionContent: {
    paddingHorizontal: 48,
  },

  /* ── Opportunity Details ── */
  oppDetailsBody: {
    paddingHorizontal: 48,
  },

  fieldRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.lineSoft,
  },

  fieldLabel: {
    width: '32%',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.mute,
    paddingTop: 2,
  },

  fieldValue: {
    width: '68%',
    fontFamily: 'Times-Roman',
    fontSize: 12,
    color: C.ink,
    lineHeight: 1.3,
  },

  fieldValueEmpty: {
    width: '68%',
    fontFamily: 'Times-Italic',
    fontSize: 11,
    color: C.muteSoft,
  },

  /* ── Attendees — paper card with hairline rule ── */
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 6,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
  },

  attendeeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  attendeeName: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    color: C.ink,
  },

  attendeeDetail: {
    fontFamily: 'Times-Italic',
    fontSize: 10,
    color: C.ink2,
  },

  attendeeRole: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: C.giltDeep,
    backgroundColor: C.giltSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: C.gilt,
  },

  /* ── Tasks — editorial check-line ── */
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 0,
    marginBottom: 4,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: C.lineSoft,
    gap: 12,
  },

  taskLeftBorder: {
    width: 2,
    alignSelf: 'stretch',
  },

  taskCheckbox: {
    width: 11,
    height: 11,
    borderWidth: 1,
    borderColor: C.gilt,
    marginTop: 3,
  },

  taskText: {
    flex: 1,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: C.ink,
    lineHeight: 1.45,
  },

  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },

  taskDate: {
    fontFamily: 'Times-Italic',
    fontSize: 8,
    color: C.mute,
  },

  taskPriority: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 0.5,
  },

  /* ── Call summary — numbered folio (italic gilt) ── */
  summaryBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 14,
  },

  bulletFolio: {
    width: 26,
    alignItems: 'center',
    paddingTop: 0,
  },

  bulletNumber: {
    fontFamily: 'Times-Italic',
    fontSize: 22,
    color: C.gilt,
    lineHeight: 1,
  },

  summaryText: {
    flex: 1,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: C.ink,
    lineHeight: 1.55,
    paddingTop: 5,
  },

  /* ── Notes box ── */
  notesBody: {
    marginHorizontal: 48,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 18,
    paddingHorizontal: 22,
  },

  notesText: {
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: C.ink,
    lineHeight: 1.6,
  },

  /* ── Tags ── */
  tagsSection: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 2,
  },

  tagColumn: { flex: 1 },

  tagColumnLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.mute,
    marginBottom: 10,
  },

  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },

  tag: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 0.5,
  },

  /* ── Deal map — cream paper, gilt center, warm tinted branches ── */
  mapContainer: {
    marginHorizontal: 48,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    paddingTop: 26,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },

  mapCenter: {
    alignSelf: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.gilt,
  },

  mapCenterName: {
    fontFamily: 'Times-Roman',
    fontSize: 15,
    color: C.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  mapCenterStage: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: C.giltDeep,
  },

  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  mapBranch: {
    width: '48.5%',
    borderWidth: 0.75,
    padding: 12,
    marginBottom: 0,
  },

  mapBranchLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  mapBranchItem: {
    fontFamily: 'Times-Roman',
    fontSize: 9,
    color: C.ink2,
    lineHeight: 1.45,
    marginBottom: 2,
  },

  mapBranchMore: {
    fontFamily: 'Times-Italic',
    fontSize: 8,
    color: C.mute,
    marginTop: 4,
  },

  /* ── Footer ── */
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 48,
    borderTopWidth: 1,
    borderTopColor: C.line,
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  footerGiltRule: {
    width: 36,
    height: 1,
    backgroundColor: C.gilt,
    marginBottom: 8,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLogo: { width: 70, height: 27 },

  footerMetaCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  footerText: {
    fontSize: 7,
    color: C.mute,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },

  /* ── Fixed body-page header ── */
  bodyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    paddingVertical: 12,
    paddingHorizontal: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },

  bodyHeaderLogo: { width: 88, height: 33 },

  bodyHeaderTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: C.mute,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
  },

  /* ── CTA page — cream/white editorial closing spread ── */
  ctaPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    backgroundColor: C.white,
  },

  ctaTopGilt: {
    width: '100%',
    height: 1.5,
    backgroundColor: C.gilt,
  },

  ctaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingTop: 90,
    paddingBottom: 90,
  },

  ctaLogo: { width: 240, height: 90, marginBottom: 32 },

  ctaEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  ctaEyebrowRule: {
    width: 32,
    height: 1,
    backgroundColor: C.gilt,
    marginHorizontal: 12,
  },

  ctaEyebrowText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    color: C.ink2,
  },

  ctaHeadline: {
    fontFamily: 'Times-Italic',
    fontSize: 26,
    color: C.ink,
    textAlign: 'center',
    lineHeight: 1.25,
    marginBottom: 18,
    letterSpacing: -0.4,
    paddingHorizontal: 20,
  },

  ctaSubline: {
    fontFamily: 'Times-Roman',
    fontSize: 12,
    color: C.ink2,
    textAlign: 'center',
    lineHeight: 1.7,
    marginBottom: 36,
    paddingHorizontal: 30,
  },

  ctaUrlBox: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.gilt,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },

  ctaUrl: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.giltDeep,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
})

/* ─── Reusable ─── */

function SectionHeader({
  title,
  count,
}: {
  title: string
  count?: number
}) {
  return (
    <View style={s.sectionHeaderWrap}>
      <View style={s.sectionHeaderRule} />
      <Text style={s.sectionHeaderText}>{title}</Text>
      {count !== undefined && (
        <Text style={s.sectionHeaderCount}>· {count}</Text>
      )}
    </View>
  )
}

function Asterism() {
  return (
    <View style={s.asterismRow}>
      <Text style={s.asterismDot}>{'⁂'}</Text>
    </View>
  )
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <View style={s.footerGiltRule} />
      <View style={s.footerRow}>
        <Image src={LOGO_PATH} style={s.footerLogo} />
        <View style={s.footerMetaCol}>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
          <Text style={s.footerText}>Confidential</Text>
        </View>
      </View>
    </View>
  )
}

function BodyPageHeader() {
  return (
    <View style={s.bodyHeader} fixed>
      <Image src={LOGO_PATH} style={s.bodyHeaderLogo} />
      <Text style={s.bodyHeaderTitle}>The Field Brief · Volume I</Text>
    </View>
  )
}

/* ─── Props ─── */
interface PDFProps {
  data: DebriefStructuredOutput
  email: string
  date: string
  dealSegment: DealSegment
}

/* ─── Main ─── */
export function DebriefPDF({ data, email, date }: PDFProps) {
  const d = data
  const snap = d.dealSnapshot
  const primary = d.attendees[0]
  const contactDisplay =
    primary && primary.name !== 'Not mentioned'
      ? `${primary.name}${primary.title !== 'Not mentioned' ? ` — ${primary.title}` : ''}`
      : null

  interface MapBranch {
    label: string
    color: string
    bg: string
    border: string
    items: string[]
  }

  const mapBranches: MapBranch[] = []

  if (d.attendees.length > 0 && d.attendees[0].name !== 'Not mentioned') {
    mapBranches.push({
      label: 'Attendees',
      color: C.ink,
      bg: C.cream,
      border: C.line,
      items: d.attendees.map(
        (a) => `${a.name}${a.role !== 'Unknown' ? ` (${a.role})` : ''}`
      ),
    })
  }
  if (d.followUpTasks.length > 0) {
    mapBranches.push({
      label: 'Tasks',
      color: C.giltDeep,
      bg: C.giltSoft,
      border: C.gilt,
      items: d.followUpTasks.map((t) => t.task),
    })
  }
  if (d.painPoints.length > 0) {
    mapBranches.push({
      label: 'Pain Points',
      color: C.ink2,
      bg: C.blushSoft,
      border: C.blush,
      items: d.painPoints,
    })
  }
  if (d.risks.length > 0) {
    mapBranches.push({
      label: 'Risks',
      color: C.ink,
      bg: C.paper2,
      border: C.mute,
      items: d.risks,
    })
  }
  if (d.competitorsMentioned.length > 0) {
    mapBranches.push({
      label: 'Competitors',
      color: C.mute,
      bg: C.cream,
      border: C.line,
      items: d.competitorsMentioned,
    })
  }
  if (d.productsDiscussed.length > 0) {
    mapBranches.push({
      label: 'Products',
      color: C.giltDeep,
      bg: C.cream,
      border: C.gilt,
      items: d.productsDiscussed,
    })
  }

  const hasAttendees =
    d.attendees.length > 0 && d.attendees[0].name !== 'Not mentioned'

  return (
    <Document>
      {/* ═══════════════════════════════════════════
          PAGE 1 — COVER · DEAL TEAR SHEET
          ═══════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.topGiltRule} />

        {/* WHITE masthead so the bronze logo renders cleanly */}
        <View style={s.masthead}>
          <View style={s.mastheadRow}>
            <Image src={LOGO_PATH} style={s.logo} />
            <View style={s.mastheadMetaCol}>
              <Text style={s.mastheadMetaLabel}>Field Brief</Text>
              <Text style={s.mastheadMetaText}>{date}</Text>
              <Text style={s.mastheadMetaText}>{email}</Text>
            </View>
          </View>
        </View>

        {/* Hero — editorial paper block */}
        <View style={s.hero}>
          <View style={s.eyebrowRow}>
            <View style={s.eyebrowRule} />
            <Text style={s.eyebrowText}>Deal Tear Sheet</Text>
          </View>

          <Text style={s.companyName}>
            {snap.companyName !== 'Not mentioned'
              ? snap.companyName
              : 'Post-Call Summary'}
          </Text>

          {contactDisplay && (
            <Text style={s.contactLine}>{contactDisplay}</Text>
          )}

          <View style={s.badgeRow}>
            <View
              style={[
                s.badge,
                { backgroundColor: C.ink, borderColor: C.ink },
              ]}
            >
              <Text style={[s.badgeText, { color: C.cream }]}>
                {snap.dealStage}
              </Text>
            </View>
            {snap.estimatedValue !== 'Not mentioned' && (
              <View
                style={[
                  s.badge,
                  { backgroundColor: C.cream, borderColor: C.gilt },
                ]}
              >
                <Text style={[s.badgeText, { color: C.giltDeep }]}>
                  {snap.estimatedValue}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Opportunity Details ── */}
        <SectionHeader title="Opportunity Details" />
        <View style={s.oppDetailsBody}>
          {[
            { label: 'Account', value: snap.companyName },
            { label: 'Deal Stage', value: snap.dealStage },
            { label: 'Amount', value: snap.estimatedValue },
            { label: 'Close Date', value: snap.closeDate },
            { label: 'Next Step', value: snap.nextStep },
          ].map((f) => (
            <View key={f.label} style={s.fieldRow}>
              <Text style={s.fieldLabel}>{f.label}</Text>
              <Text
                style={
                  f.value === 'Not mentioned' || f.value === 'Not specified'
                    ? s.fieldValueEmpty
                    : s.fieldValue
                }
              >
                {f.value}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Meeting Attendees ── */}
        {hasAttendees && (
          <View wrap={false}>
            <SectionHeader title="Meeting Attendees" />
            <View style={s.sectionContent}>
              {d.attendees.map((att, i) => (
                <View key={i} style={s.attendeeCard}>
                  <View
                    style={[
                      s.attendeeDot,
                      { backgroundColor: sentimentColor(att.sentiment) },
                    ]}
                  />
                  <Text style={s.attendeeName}>{att.name}</Text>
                  {att.title !== 'Not mentioned' && (
                    <Text style={s.attendeeDetail}>· {att.title}</Text>
                  )}
                  {att.role !== 'Unknown' && (
                    <Text style={s.attendeeRole}>{att.role}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Follow-Up Tasks ── */}
        {d.followUpTasks.length > 0 && (
          <View wrap={false}>
            <SectionHeader
              title="Follow-Up Tasks"
              count={d.followUpTasks.length}
            />
            <View style={s.sectionContent}>
              {d.followUpTasks.map((task, i) => (
                <View key={i} style={s.taskCard}>
                  <View
                    style={[
                      s.taskLeftBorder,
                      { backgroundColor: priorityAccent(task.priority) },
                    ]}
                  />
                  <View style={s.taskCheckbox} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.taskText}>{task.task}</Text>
                    <View style={s.taskMeta}>
                      {task.dueDate !== 'Not specified' && (
                        <Text style={s.taskDate}>{task.dueDate}</Text>
                      )}
                      <Text
                        style={[
                          s.taskPriority,
                          {
                            color: priorityColor(task.priority),
                            backgroundColor: priorityBg(task.priority),
                            borderColor: priorityAccent(task.priority),
                          },
                        ]}
                      >
                        {task.priority}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Call Summary ── */}
        {d.callSummary.filter((p) => p && p.trim()).length > 0 && (
          <View wrap={false}>
            <SectionHeader title="Call Summary" />
            <View style={s.sectionContent}>
              {d.callSummary
                .filter((p) => p && p.trim())
                .map((point, i) => (
                  <View key={i} style={s.summaryBullet} wrap={false}>
                    <View style={s.bulletFolio}>
                      <Text style={s.bulletNumber}>{i + 1}</Text>
                    </View>
                    <Text style={s.summaryText}>{point}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        <Asterism />
        <PageFooter />
      </Page>

      {/* ═══════════════════════════════════════════
          PAGE 2 — DEAL INTELLIGENCE
          ═══════════════════════════════════════════ */}
      <Page size="A4" style={s.bodyPage}>
        <BodyPageHeader />
        <PageFooter />

        {/* ── Opportunity Notes ── */}
        {d.opportunityNotes && (
          <View wrap={false}>
            <SectionHeader title="Opportunity Notes" />
            <View style={s.notesBody}>
              <Text style={s.notesText}>{d.opportunityNotes}</Text>
            </View>
          </View>
        )}

        {/* ── Deal Map ── */}
        {mapBranches.length > 0 && (
          <View wrap={false}>
            <SectionHeader title="Deal Map" />
            <View style={s.mapContainer}>
              <View style={s.mapCenter}>
                <Text style={s.mapCenterName}>
                  {snap.companyName !== 'Not mentioned'
                    ? snap.companyName
                    : 'Deal'}
                </Text>
                <Text style={s.mapCenterStage}>{snap.dealStage}</Text>
              </View>

              <View style={s.mapGrid}>
                {mapBranches.map((branch) => (
                  <View
                    key={branch.label}
                    style={[
                      s.mapBranch,
                      {
                        backgroundColor: branch.bg,
                        borderColor: branch.border,
                      },
                    ]}
                  >
                    <Text
                      style={[s.mapBranchLabel, { color: branch.color }]}
                    >
                      {branch.label}
                    </Text>
                    {branch.items.slice(0, 4).map((item, i) => (
                      <Text key={i} style={s.mapBranchItem}>
                        {'—'} {item}
                      </Text>
                    ))}
                    {branch.items.length > 4 && (
                      <Text style={s.mapBranchMore}>
                        + {branch.items.length - 4} more
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* ── Pain Points + Risks ── */}
        {(d.painPoints.length > 0 || d.risks.length > 0) && (
          <View wrap={false}>
            <SectionHeader title="Signals" />
            <View style={s.sectionContent}>
              <View style={s.tagsSection}>
                {d.painPoints.length > 0 && (
                  <View style={s.tagColumn}>
                    <Text style={s.tagColumnLabel}>Pain Points</Text>
                    <View style={s.tagWrap}>
                      {d.painPoints.map((p, i) => (
                        <Text
                          key={i}
                          style={[
                            s.tag,
                            {
                              color: C.ink2,
                              backgroundColor: C.blushSoft,
                              borderColor: C.blush,
                            },
                          ]}
                        >
                          {p}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {d.risks.length > 0 && (
                  <View style={s.tagColumn}>
                    <Text style={s.tagColumnLabel}>Risks</Text>
                    <View style={s.tagWrap}>
                      {d.risks.map((r, i) => (
                        <Text
                          key={i}
                          style={[
                            s.tag,
                            {
                              color: C.ink,
                              backgroundColor: C.paper,
                              borderColor: C.mute,
                            },
                          ]}
                        >
                          {r}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ── Competitors + Products ── */}
        {(d.competitorsMentioned.length > 0 ||
          d.productsDiscussed.length > 0) && (
          <View wrap={false}>
            <SectionHeader title="Landscape" />
            <View style={s.sectionContent}>
              <View style={s.tagsSection}>
                {d.competitorsMentioned.length > 0 && (
                  <View style={s.tagColumn}>
                    <Text style={s.tagColumnLabel}>Competitors</Text>
                    <View style={s.tagWrap}>
                      {d.competitorsMentioned.map((c, i) => (
                        <Text
                          key={i}
                          style={[
                            s.tag,
                            {
                              color: C.mute,
                              backgroundColor: C.cream,
                              borderColor: C.line,
                            },
                          ]}
                        >
                          {c}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
                {d.productsDiscussed.length > 0 && (
                  <View style={s.tagColumn}>
                    <Text style={s.tagColumnLabel}>Products Discussed</Text>
                    <View style={s.tagWrap}>
                      {d.productsDiscussed.map((p, i) => (
                        <Text
                          key={i}
                          style={[
                            s.tag,
                            {
                              color: C.giltDeep,
                              backgroundColor: C.giltSoft,
                              borderColor: C.gilt,
                            },
                          ]}
                        >
                          {p}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <Asterism />
      </Page>

      {/* ═══════════════════════════════════════════
          LAST PAGE — CTA (white background, gilt accents)
          ═══════════════════════════════════════════ */}
      <Page size="A4" style={s.ctaPage}>
        <View style={s.ctaTopGilt} />

        <View style={s.ctaContainer}>
          <Image src={LOGO_PATH} style={s.ctaLogo} />

          <View style={s.ctaEyebrowRow}>
            <View style={s.ctaEyebrowRule} />
            <Text style={s.ctaEyebrowText}>Field Intelligence</Text>
            <View style={s.ctaEyebrowRule} />
          </View>

          <Text style={s.ctaHeadline}>
            Sixty seconds of voice.{'\n'}Every field, filled.
          </Text>

          <Text style={s.ctaSubline}>
            No typing. No tab-switching. No missed fields.{'\n'}
            Field Glow captures what the day gives you,{'\n'}
            and returns it as the record you needed.
          </Text>

          <View style={s.ctaUrlBox}>
            <Text style={s.ctaUrl}>fieldglow.app</Text>
          </View>
        </View>

        <View style={s.footer}>
          <View style={s.footerGiltRule} />
          <View style={s.footerRow}>
            <Image src={LOGO_PATH} style={s.footerLogo} />
            <View style={s.footerMetaCol}>
              <Text
                style={s.footerText}
                render={({ pageNumber, totalPages }) =>
                  `Page ${pageNumber} / ${totalPages}`
                }
              />
              <Text style={s.footerText}>Confidential</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
