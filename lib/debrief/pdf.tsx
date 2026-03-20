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
import type { DebriefStructuredOutput, BDRStructuredOutput, VbrickBDRStructuredOutput, DealSegment } from './types'

const LOGO_PATH = path.join(process.cwd(), 'public', 'streetnotes_logo.png')

/* ─── Palette ─── */
const C = {
  volt: '#00E676',
  voltDark: '#00C853',
  voltBg: '#E8F5E9',
  red: '#EF4444',
  redBg: '#FEF2F2',
  amber: '#F59E0B',
  amberBg: '#FFFBEB',
  blue: '#3B82F6',
  blueBg: '#EFF6FF',
  dark: '#111827',
  darkSoft: '#1F2937',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
}

function sentimentColor(s: string): string {
  if (s === 'positive') return C.volt
  if (s === 'negative') return C.red
  if (s === 'neutral') return C.blue
  return C.gray400
}

function priorityAccent(p: string): string {
  if (p === 'high') return C.red
  if (p === 'medium') return C.amber
  return C.gray300
}

function priorityBg(p: string): string {
  if (p === 'high') return C.redBg
  if (p === 'medium') return C.amberBg
  return C.gray100
}

function priorityColor(p: string): string {
  if (p === 'high') return C.red
  if (p === 'medium') return C.amber
  return C.gray400
}


/* ─── Styles ─── */
const s = StyleSheet.create({
  /* Pages */
  page: {
    paddingTop: 0,
    paddingBottom: 56,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.gray700,
    backgroundColor: C.white,
  },

  bodyPage: {
    paddingTop: 52,
    paddingBottom: 56,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.gray700,
    backgroundColor: C.white,
  },

  /* Top accent */
  topBar: {
    width: '100%',
    height: 5,
    backgroundColor: C.volt,
  },

  /* Header */
  header: {
    backgroundColor: C.dark,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 40,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },

  logo: { width: 110, height: 28 },

  metaCol: { alignItems: 'flex-end' },
  metaText: { fontSize: 8, color: C.gray400, marginBottom: 1 },

  docLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: C.volt,
    marginBottom: 8,
  },

  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 30,
    color: C.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },

  contactLine: {
    fontSize: 11,
    color: C.gray400,
    marginBottom: 16,
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
  },

  badgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  /* Section header bar (dark bg, white text, colored left accent) */
  sectionHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.darkSoft,
    marginHorizontal: 40,
    marginTop: 0,
  },

  sectionHeaderAccent: {
    width: 4,
    alignSelf: 'stretch',
  },

  sectionHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  /* Section divider line */
  sectionDivider: {
    height: 1,
    backgroundColor: C.gray200,
    marginHorizontal: 40,
  },

  /* Content area (40px horizontal padding) */
  sectionContent: {
    paddingHorizontal: 40,
    paddingTop: 14,
    paddingBottom: 16,
  },

  /* Opportunity Details: left accent bar wrapper */
  oppDetailsWrapper: {
    flexDirection: 'row',
    marginHorizontal: 40,
    marginTop: 0,
  },

  oppDetailsAccent: {
    width: 4,
    backgroundColor: C.volt,
  },

  oppDetailsBody: {
    flex: 1,
    paddingLeft: 16,
    paddingTop: 14,
    paddingBottom: 16,
    paddingRight: 0,
  },

  /* CRM field rows */
  fieldRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.gray200,
  },

  fieldLabel: {
    width: '28%',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: C.gray500,
    paddingTop: 1,
  },

  fieldValue: {
    width: '72%',
    fontSize: 10,
    color: C.gray900,
    fontFamily: 'Helvetica-Bold',
  },

  fieldValueEmpty: {
    width: '72%',
    fontSize: 10,
    color: C.gray300,
    fontStyle: 'italic',
  },

  /* Attendees */
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: C.gray50,
    borderRadius: 4,
  },

  attendeeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  attendeeName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: C.gray900,
  },

  attendeeDetail: {
    fontSize: 9,
    color: C.gray500,
  },

  attendeeRole: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: C.voltDark,
    backgroundColor: C.voltBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },

  /* Tasks */
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: C.white,
    borderRadius: 4,
    gap: 10,
  },

  taskLeftBorder: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
  },

  taskCheckbox: {
    width: 11,
    height: 11,
    borderWidth: 1.5,
    borderColor: C.gray300,
    borderRadius: 2,
    marginTop: 1,
  },

  taskText: {
    flex: 1,
    fontSize: 9,
    color: C.gray700,
    lineHeight: 1.4,
  },

  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  taskDate: {
    fontSize: 7,
    color: C.gray500,
  },

  taskPriority: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },

  /* Call summary */
  summaryBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 7,
    gap: 10,
  },

  bulletCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },

  bulletNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: C.volt,
  },

  summaryText: {
    flex: 1,
    fontSize: 9,
    color: C.gray700,
    lineHeight: 1.5,
    paddingTop: 2,
  },

  /* Notes box */
  notesWrapper: {
    flexDirection: 'row',
    marginHorizontal: 40,
    marginTop: 0,
  },

  notesAccent: {
    width: 4,
    backgroundColor: C.volt,
  },

  notesBody: {
    flex: 1,
    backgroundColor: C.gray50,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: C.gray200,
    padding: 14,
  },

  notesText: {
    fontSize: 9,
    color: C.gray700,
    lineHeight: 1.6,
  },

  /* Tags */
  tagsSection: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 4,
  },

  tagColumn: { flex: 1 },

  tagColumnLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: C.gray500,
    marginBottom: 8,
  },

  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },

  tag: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.3,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },

  /* Mind map */
  mapContainer: {
    marginHorizontal: 40,
    marginTop: 0,
    backgroundColor: C.dark,
    padding: 20,
  },

  mapCenter: {
    alignSelf: 'center',
    backgroundColor: '#0D1117',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 6,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.volt,
  },

  mapCenterName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: C.white,
    marginBottom: 3,
  },

  mapCenterStage: {
    fontSize: 9,
    color: C.volt,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },

  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  mapBranch: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 4,
  },

  mapBranchLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },

  mapBranchItem: {
    fontSize: 8,
    color: C.gray300,
    lineHeight: 1.4,
    marginBottom: 2,
    paddingLeft: 6,
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 40,
    right: 40,
    paddingTop: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  footerAccentLine: {
    height: 2,
    backgroundColor: '#66F0A3',
    marginBottom: 8,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLogo: { width: 55, height: 14 },
  footerText: { fontSize: 7, color: C.gray400 },

  /* Fixed header for body pages */
  bodyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: C.dark,
    paddingVertical: 10,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bodyHeaderLogo: { width: 80, height: 20 },

  bodyHeaderTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: C.gray400,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  /* CTA Page */
  ctaPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    backgroundColor: C.dark,
  },

  ctaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },

  ctaLogo: { width: 200, height: 50, marginBottom: 40 },
  ctaDivider: { width: '40%', height: 2, backgroundColor: C.volt, marginBottom: 32 },

  ctaHeadline: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: C.white,
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 12,
  },

  ctaSubline: {
    fontSize: 13,
    color: C.gray400,
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 36,
  },

  ctaUrlBox: {
    backgroundColor: C.volt,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 4,
  },

  ctaUrl: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: C.dark,
    letterSpacing: 1,
  },
})

/* ─── Reusable ─── */

function SectionHeader({
  title,
  accentColor,
  count,
}: {
  title: string
  accentColor: string
  count?: number
}) {
  return (
    <View style={s.sectionHeaderBar}>
      <View style={[s.sectionHeaderAccent, { backgroundColor: accentColor }]} />
      <Text style={s.sectionHeaderText}>
        {title}
        {count !== undefined ? ` (${count})` : ''}
      </Text>
    </View>
  )
}

function SectionDivider() {
  return <View style={s.sectionDivider} />
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <View style={s.footerAccentLine} />
      <View style={s.footerRow}>
        <Image src={LOGO_PATH} style={s.footerLogo} />
        <Text
          style={s.footerText}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
        <Text style={s.footerText}>Confidential</Text>
      </View>
    </View>
  )
}

function BodyPageHeader() {
  return (
    <View style={s.bodyHeader} fixed>
      <Image src={LOGO_PATH} style={s.bodyHeaderLogo} />
      <Text style={s.bodyHeaderTitle}>Deal Intelligence Report</Text>
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

  // Mind map branches
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
      color: C.blue,
      bg: '#1E293B',
      border: '#334155',
      items: d.attendees.map(
        (a) => `${a.name}${a.role !== 'Unknown' ? ` (${a.role})` : ''}`
      ),
    })
  }
  if (d.followUpTasks.length > 0) {
    mapBranches.push({
      label: 'Tasks',
      color: C.voltDark,
      bg: '#0D2818',
      border: '#145A32',
      items: d.followUpTasks.map((t) => t.task),
    })
  }
  if (d.painPoints.length > 0) {
    mapBranches.push({
      label: 'Pain Points',
      color: C.amber,
      bg: '#1C1405',
      border: '#4A3700',
      items: d.painPoints,
    })
  }
  if (d.risks.length > 0) {
    mapBranches.push({
      label: 'Risks',
      color: C.red,
      bg: '#1C0505',
      border: '#4A0E0E',
      items: d.risks,
    })
  }
  if (d.competitorsMentioned.length > 0) {
    mapBranches.push({
      label: 'Competitors',
      color: C.gray400,
      bg: '#1A1A1A',
      border: '#333333',
      items: d.competitorsMentioned,
    })
  }
  if (d.productsDiscussed.length > 0) {
    mapBranches.push({
      label: 'Products',
      color: C.voltDark,
      bg: '#0D2818',
      border: '#145A32',
      items: d.productsDiscussed,
    })
  }

  const hasAttendees =
    d.attendees.length > 0 && d.attendees[0].name !== 'Not mentioned'

  return (
    <Document>
      {/* ═══════════════════════════════════════════
          PAGE 1 — DEAL TEAR SHEET
          ═══════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.topBar} />

        {/* Dark header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <Image src={LOGO_PATH} style={s.logo} />
            <View style={s.metaCol}>
              <Text style={s.metaText}>{date}</Text>
              <Text style={s.metaText}>{email}</Text>
            </View>
          </View>

          <Text style={s.docLabel}>Deal Tear Sheet</Text>
          <Text style={s.companyName}>
            {snap.companyName !== 'Not mentioned'
              ? snap.companyName
              : 'Post-Call Summary'}
          </Text>
          {contactDisplay && (
            <Text style={s.contactLine}>{contactDisplay}</Text>
          )}

          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: C.volt }]}>
              <Text style={[s.badgeText, { color: C.dark }]}>
                {snap.dealStage}
              </Text>
            </View>
            {snap.estimatedValue !== 'Not mentioned' && (
              <View style={[s.badge, { backgroundColor: '#1E293B' }]}>
                <Text style={[s.badgeText, { color: C.white }]}>
                  {snap.estimatedValue}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Opportunity Details ── */}
        <SectionHeader title="Opportunity Details" accentColor={C.volt} />
        <View style={s.oppDetailsWrapper}>
          <View style={s.oppDetailsAccent} />
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
                    f.value === 'Not mentioned'
                      ? s.fieldValueEmpty
                      : s.fieldValue
                  }
                >
                  {f.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <SectionDivider />

        {/* ── Meeting Attendees ── */}
        {hasAttendees && (
          <View wrap={false}>
            <SectionHeader title="Meeting Attendees" accentColor={C.blue} />
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
                    <Text style={s.attendeeDetail}>{att.title}</Text>
                  )}
                  {att.role !== 'Unknown' && (
                    <Text style={s.attendeeRole}>{att.role}</Text>
                  )}
                </View>
              ))}
            </View>
            <SectionDivider />
          </View>
        )}

        {/* ── Follow-Up Tasks ── */}
        {d.followUpTasks.length > 0 && (
          <View wrap={false}>
            <SectionHeader
              title="Follow-Up Tasks"
              accentColor={C.amber}
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
                        },
                      ]}
                    >
                      {task.priority}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
            <SectionDivider />
          </View>
        )}

        {/* ── Call Summary ── */}
        {d.callSummary.filter((p) => p && p.trim()).length > 0 && (
          <View wrap={false}>
            <SectionHeader title="Call Summary" accentColor={C.volt} />
            <View style={s.sectionContent}>
              {d.callSummary
                .filter((p) => p && p.trim())
                .map((point, i) => (
                  <View key={i} style={s.summaryBullet} wrap={false}>
                    <View style={s.bulletCircle}>
                      <Text style={s.bulletNumber}>{i + 1}</Text>
                    </View>
                    <Text style={s.summaryText}>{point}</Text>
                  </View>
                ))}
            </View>
          </View>
        )}

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
            <SectionHeader title="Opportunity Notes" accentColor={C.volt} />
            <View style={s.notesWrapper}>
              <View style={s.notesAccent} />
              <View style={s.notesBody}>
                <Text style={s.notesText}>{d.opportunityNotes}</Text>
              </View>
            </View>
            <SectionDivider />
          </View>
        )}

        {/* ── Deal Map ── */}
        {mapBranches.length > 0 && (
          <View wrap={false}>
            <SectionHeader title="Deal Map" accentColor={C.volt} />
            <View style={s.mapContainer}>
              {/* Central node */}
              <View style={s.mapCenter}>
                <Text style={s.mapCenterName}>
                  {snap.companyName !== 'Not mentioned'
                    ? snap.companyName
                    : 'Deal'}
                </Text>
                <Text style={s.mapCenterStage}>{snap.dealStage}</Text>
              </View>

              {/* Branches as cards */}
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
                        {'\u2022'} {item}
                      </Text>
                    ))}
                    {branch.items.length > 4 && (
                      <Text
                        style={[s.mapBranchItem, { color: C.gray500, fontStyle: 'italic' }]}
                      >
                        +{branch.items.length - 4} more
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
            <SectionDivider />
          </View>
        )}

        {/* ── Pain Points + Risks ── */}
        {(d.painPoints.length > 0 || d.risks.length > 0) && (
          <View wrap={false}>
            <SectionHeader title="Signals" accentColor={C.red} />
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
                              color: C.blue,
                              backgroundColor: C.blueBg,
                              borderColor: '#BFDBFE',
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
                              color: C.red,
                              backgroundColor: C.redBg,
                              borderColor: '#FECACA',
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
            <SectionDivider />
          </View>
        )}

        {/* ── Competitors + Products ── */}
        {(d.competitorsMentioned.length > 0 ||
          d.productsDiscussed.length > 0) && (
          <View wrap={false}>
            <SectionHeader title="Landscape" accentColor={C.gray400} />
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
                              color: C.gray500,
                              backgroundColor: C.gray100,
                              borderColor: C.gray300,
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
                              color: C.voltDark,
                              backgroundColor: C.voltBg,
                              borderColor: '#A7F3D0',
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
      </Page>

      {/* ═══════════════════════════════════════════
          LAST PAGE — CTA
          ═══════════════════════════════════════════ */}
      <Page size="A4" style={s.ctaPage}>
        <View style={s.ctaContainer}>
          <Image src={LOGO_PATH} style={s.ctaLogo} />
          <View style={s.ctaDivider} />
          <Text style={s.ctaHeadline}>
            60 seconds of talking. Every CRM field filled.
          </Text>
          <Text style={s.ctaSubline}>
            No typing. No tab switching. No missed fields.{'\n'}
            Connect StreetNotes and this happens after every call.
          </Text>
          <View style={s.ctaUrlBox}>
            <Text style={s.ctaUrl}>streetnotes.ai</Text>
          </View>
        </View>

        <View style={[s.footer, { left: 40, right: 40, bottom: 18 }]}>
          <View style={[s.footerAccentLine, { backgroundColor: '#4D9E6A' }]} />
          <View style={s.footerRow}>
            <Image src={LOGO_PATH} style={s.footerLogo} />
            <Text
              style={[s.footerText, { color: C.gray400 }]}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
            <Text style={[s.footerText, { color: C.gray400 }]}>
              Confidential
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

/* ─── BDR Cold Call PDF ─── */

const PROSPECT_STATUS_LABELS: Record<string, string> = {
  'active-opportunity': 'Active Opportunity',
  'future-opportunity': 'Future Opportunity',
  'not-a-fit': 'Not a Fit',
  'needs-more-info': 'Needs More Info',
  'referred-elsewhere': 'Referred Elsewhere',
}

const DISPOSITION_LABELS: Record<string, string> = {
  connected: 'Connected',
  voicemail: 'Voicemail',
  gatekeeper: 'Gatekeeper',
  'no-answer': 'No Answer',
}

const STATUS_COLORS: Record<string, string> = {
  'active-opportunity': C.volt,
  'future-opportunity': C.blue,
  'not-a-fit': C.red,
  'needs-more-info': C.amber,
  'referred-elsewhere': '#8B5CF6',
}

interface BDRPDFProps {
  data: BDRStructuredOutput
  email: string
  date: string
}

export function BDRDebriefPDF({ data, email, date }: BDRPDFProps) {
  const d = data
  const statusLabel = PROSPECT_STATUS_LABELS[d.prospectStatus] || d.prospectStatus
  const statusColor = STATUS_COLORS[d.prospectStatus] || C.gray400
  const dispositionLabel = DISPOSITION_LABELS[d.callDisposition] || d.callDisposition

  return (
    <Document>
      {/* ═══════════════════════════════════════════
          PAGE 1 — COLD CALL ACTIVITY LOG
          ═══════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={s.topBar} />

        {/* Dark header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <Image src={LOGO_PATH} style={s.logo} />
            <View style={s.metaCol}>
              <Text style={s.metaText}>{date}</Text>
              <Text style={s.metaText}>{email}</Text>
            </View>
          </View>

          <Text style={s.docLabel}>Cold Call Log</Text>
          <Text style={s.companyName}>
            {d.contactSnapshot.company !== 'Not mentioned'
              ? d.contactSnapshot.company
              : d.contactSnapshot.name !== 'Not mentioned'
                ? d.contactSnapshot.name
                : 'Cold Call Summary'}
          </Text>
          {d.contactSnapshot.name !== 'Not mentioned' && d.contactSnapshot.company !== 'Not mentioned' && (
            <Text style={s.contactLine}>
              {d.contactSnapshot.name}
              {d.contactSnapshot.title !== 'Not mentioned' ? ` — ${d.contactSnapshot.title}` : ''}
            </Text>
          )}

          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: statusColor }]}>
              <Text style={[s.badgeText, { color: C.dark }]}>
                {statusLabel}
              </Text>
            </View>
            <View style={[s.badge, { backgroundColor: '#1E293B' }]}>
              <Text style={[s.badgeText, { color: C.white }]}>
                {dispositionLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Contact Details ── */}
        <SectionHeader title="Contact Details" accentColor={C.blue} />
        <View style={s.oppDetailsWrapper}>
          <View style={[s.oppDetailsAccent, { backgroundColor: C.blue }]} />
          <View style={s.oppDetailsBody}>
            {[
              { label: 'Name', value: d.contactSnapshot.name },
              { label: 'Title', value: d.contactSnapshot.title },
              { label: 'Company', value: d.contactSnapshot.company },
              { label: 'Direct Line', value: d.contactSnapshot.directLine },
              { label: 'Email', value: d.contactSnapshot.email },
              { label: 'Current Solution', value: d.currentSolution },
            ]
              .filter((f) => f.value !== 'Not mentioned')
              .map((f) => (
                <View key={f.label} style={s.fieldRow}>
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <Text style={s.fieldValue}>{f.value}</Text>
                </View>
              ))}
          </View>
        </View>

        <SectionDivider />

        {/* ── The Truth ── */}
        <SectionHeader title="The Truth" accentColor={C.volt} />
        <View style={s.notesWrapper}>
          <View style={s.notesAccent} />
          <View style={s.notesBody}>
            <Text style={s.notesText}>{d.theTruth}</Text>
          </View>
        </View>

        {d.prospectStatusDetail && (
          <View style={s.sectionContent}>
            <Text style={[s.tagColumnLabel, { marginBottom: 4 }]}>Status Detail</Text>
            <Text style={[s.notesText, { fontSize: 9, color: C.gray500 }]}>
              {d.prospectStatusDetail}
            </Text>
          </View>
        )}

        <SectionDivider />

        {/* ── Next Action ── */}
        <View wrap={false}>
          <SectionHeader title="Next Action" accentColor={C.volt} />
          <View style={s.sectionContent}>
            <View style={[s.attendeeCard, { backgroundColor: C.voltBg }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.attendeeName, { fontSize: 10, marginBottom: 3 }]}>
                  {d.nextAction.action}
                </Text>
                <Text style={[s.attendeeDetail, { fontSize: 8 }]}>
                  When: {d.nextAction.when}
                </Text>
              </View>
            </View>
          </View>
          <SectionDivider />
        </View>

        {/* ── Objections ── */}
        {d.objections.length > 0 && (
          <View wrap={false}>
            <SectionHeader title="Objections" accentColor={C.amber} count={d.objections.length} />
            <View style={s.sectionContent}>
              {d.objections.map((obj, i) => (
                <View key={i} style={s.summaryBullet} wrap={false}>
                  <View style={s.bulletCircle}>
                    <Text style={s.bulletNumber}>{i + 1}</Text>
                  </View>
                  <Text style={s.summaryText}>{obj}</Text>
                </View>
              ))}
            </View>
            <SectionDivider />
          </View>
        )}

        {/* ── Referral ── */}
        {d.referral && (
          <View wrap={false}>
            <SectionHeader title="Referral" accentColor="#8B5CF6" />
            <View style={s.sectionContent}>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Referred To</Text>
                <Text style={s.fieldValue}>{d.referral.referredTo}</Text>
              </View>
              <View style={[s.fieldRow, { borderBottomWidth: 0 }]}>
                <Text style={s.fieldLabel}>Reason</Text>
                <Text style={s.fieldValue}>{d.referral.reason}</Text>
              </View>
            </View>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ═══════════════════════════════════════════
          PAGE 2 — AE BRIEFING (conditional)
          ═══════════════════════════════════════════ */}
      {d.aeBriefing && (
        <Page size="A4" style={s.bodyPage}>
          <View style={s.bodyHeader} fixed>
            <Image src={LOGO_PATH} style={s.bodyHeaderLogo} />
            <Text style={s.bodyHeaderTitle}>AE Briefing</Text>
          </View>

          <SectionHeader title="AE Briefing" accentColor={C.volt} />
          <View style={s.notesWrapper}>
            <View style={s.notesAccent} />
            <View style={s.notesBody}>
              <Text style={[s.notesText, { fontSize: 10, lineHeight: 1.7 }]}>
                {d.aeBriefing}
              </Text>
            </View>
          </View>

          <PageFooter />
        </Page>
      )}

      {/* ═══════════════════════════════════════════
          LAST PAGE — CTA
          ═══════════════════════════════════════════ */}
      <Page size="A4" style={s.ctaPage}>
        <View style={s.ctaContainer}>
          <Image src={LOGO_PATH} style={s.ctaLogo} />
          <View style={s.ctaDivider} />
          <Text style={s.ctaHeadline}>
            30 seconds of talking. Every call logged.
          </Text>
          <Text style={s.ctaSubline}>
            No typing. No tab switching. No missed fields.{'\n'}
            Connect StreetNotes and this happens after every call.
          </Text>
          <View style={s.ctaUrlBox}>
            <Text style={s.ctaUrl}>streetnotes.ai</Text>
          </View>
        </View>

        <View style={[s.footer, { left: 40, right: 40, bottom: 18 }]}>
          <View style={[s.footerAccentLine, { backgroundColor: '#4D9E6A' }]} />
          <View style={s.footerRow}>
            <Image src={LOGO_PATH} style={s.footerLogo} />
            <Text
              style={[s.footerText, { color: C.gray400 }]}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
            <Text style={[s.footerText, { color: C.gray400 }]}>
              Confidential
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

/* ─── Vbrick BDR Cold Call PDF ─── */

const V = {
  cyan: '#7ed4f7',
  cyanDark: '#5BC0DE',
  cyanBg: '#E0F7FA',
  navy: '#1b3e6f',
  navyDark: '#0d1e3a',
  barTrack: '#1a2a4a',
}

function spinBarColor(score: number): string {
  if (score <= 3) return '#EF4444'
  if (score <= 6) return '#F59E0B'
  if (score <= 8) return V.cyan
  return '#00E676'
}

const vs = StyleSheet.create({
  topBar: { width: '100%', height: 5, backgroundColor: V.cyan },

  header: {
    backgroundColor: V.navy,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 40,
  },

  headerBrandText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: C.white,
  },

  docLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: V.cyan,
    marginBottom: 8,
  },

  companyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 30,
    color: C.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },

  sectionHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: V.navyDark,
    marginHorizontal: 40,
    marginTop: 0,
  },

  sectionHeaderAccent: {
    width: 4,
    alignSelf: 'stretch',
  },

  sectionHeaderText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  oppDetailsAccent: {
    width: 4,
    backgroundColor: V.cyan,
  },

  notesAccent: {
    width: 4,
    backgroundColor: V.cyan,
  },

  attendeeRole: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: V.cyanDark,
    backgroundColor: V.cyanBg,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },

  bulletNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: V.cyan,
  },

  bulletCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: V.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },

  footerAccentLine: {
    height: 2,
    backgroundColor: V.cyan,
    marginBottom: 8,
  },

  bodyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: V.navy,
    paddingVertical: 10,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bodyHeaderBrandText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.white,
  },

  /* SPIN stat card */
  spinContainer: {
    marginHorizontal: 40,
    marginTop: 0,
    backgroundColor: V.navyDark,
    padding: 16,
  },

  spinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },

  spinLetter: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: C.white,
    width: 16,
  },

  spinBarTrack: {
    width: 200,
    height: 6,
    borderRadius: 3,
    backgroundColor: V.barTrack,
  },

  spinBarFill: {
    height: 6,
    borderRadius: 3,
  },

  spinScore: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: C.white,
    width: 24,
    textAlign: 'right',
  },

  spinEvidence: {
    fontSize: 7,
    color: C.gray400,
    marginBottom: 10,
    marginLeft: 26,
  },

  spinDivider: {
    height: 1,
    backgroundColor: V.barTrack,
    marginVertical: 10,
  },

  spinCompositeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  spinCompositeLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: C.gray400,
  },

  spinCompositeScore: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
  },

  spinCoaching: {
    fontSize: 8,
    fontStyle: 'italic',
    color: C.gray300,
    marginTop: 10,
    lineHeight: 1.5,
  },

  /* CTA page */
  ctaPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    backgroundColor: V.navy,
  },

  ctaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },

  ctaBrandText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: C.white,
    marginBottom: 40,
  },

  ctaDivider: {
    width: '40%',
    height: 2,
    backgroundColor: V.cyan,
    marginBottom: 32,
  },

  ctaHeadline: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: C.white,
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 12,
  },

  ctaSubline: {
    fontSize: 13,
    color: C.gray400,
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 36,
  },

  ctaUrlBox: {
    backgroundColor: V.cyan,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 4,
  },

  ctaUrl: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: V.navy,
    letterSpacing: 1,
  },

  ctaSmallFooter: {
    fontSize: 8,
    color: C.gray400,
    marginTop: 24,
  },
})

function VbrickSectionHeader({
  title,
  accentColor,
  count,
}: {
  title: string
  accentColor: string
  count?: number
}) {
  return (
    <View style={vs.sectionHeaderBar}>
      <View style={[vs.sectionHeaderAccent, { backgroundColor: accentColor }]} />
      <Text style={vs.sectionHeaderText}>
        {title}
        {count !== undefined ? ` (${count})` : ''}
      </Text>
    </View>
  )
}

function VbrickPageFooter() {
  return (
    <View style={s.footer} fixed>
      <View style={vs.footerAccentLine} />
      <View style={s.footerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 7, color: C.gray400 }}>Powered by</Text>
          <Image src={LOGO_PATH} style={s.footerLogo} />
        </View>
        <Text
          style={s.footerText}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
        />
        <Text style={s.footerText}>Confidential — Vbrick Internal</Text>
      </View>
    </View>
  )
}

function VbrickBodyPageHeader() {
  return (
    <View style={vs.bodyHeader} fixed>
      <Text style={vs.bodyHeaderBrandText}>Vbrick Command Center</Text>
      <Text style={[s.bodyHeaderTitle, { color: C.gray400 }]}>Call Intelligence Report</Text>
    </View>
  )
}

const VBRICK_STATUS_COLORS: Record<string, string> = {
  'active-opportunity': V.cyan,
  'future-opportunity': C.blue,
  'not-a-fit': C.red,
  'needs-more-info': C.amber,
  'referred-elsewhere': '#8B5CF6',
}

interface VbrickBDRPDFProps {
  data: VbrickBDRStructuredOutput
  email: string
  date: string
}

export function VbrickBDRDebriefPDF({ data, email, date }: VbrickBDRPDFProps) {
  const d = data
  const statusLabel = PROSPECT_STATUS_LABELS[d.prospectStatus] || d.prospectStatus
  const statusColor = VBRICK_STATUS_COLORS[d.prospectStatus] || C.gray400
  const dispositionLabel = DISPOSITION_LABELS[d.callDisposition] || d.callDisposition
  const spin = d.spin

  const spinDimensions: Array<{
    letter: string
    detail: { score: number; evidence: string[]; missed: string }
  }> = [
    { letter: 'S', detail: spin.situation },
    { letter: 'P', detail: spin.problem },
    { letter: 'I', detail: spin.implication },
    { letter: 'N', detail: spin.needPayoff },
  ]

  return (
    <Document>
      {/* ═══════════════════════════════════════════
          PAGE 1 — COLD CALL ACTIVITY LOG
          ═══════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <View style={vs.topBar} />

        {/* Dark header */}
        <View style={vs.header}>
          <View style={s.headerRow}>
            <Text style={vs.headerBrandText}>Vbrick Command Center</Text>
            <View style={s.metaCol}>
              <Text style={s.metaText}>{date}</Text>
              <Text style={s.metaText}>{email}</Text>
            </View>
          </View>

          <Text style={vs.docLabel}>Cold Call Log</Text>
          <Text style={vs.companyName}>
            {d.contactSnapshot.company !== 'Not mentioned'
              ? d.contactSnapshot.company
              : d.contactSnapshot.name !== 'Not mentioned'
                ? d.contactSnapshot.name
                : 'Cold Call Summary'}
          </Text>
          {d.contactSnapshot.name !== 'Not mentioned' && d.contactSnapshot.company !== 'Not mentioned' && (
            <Text style={s.contactLine}>
              {d.contactSnapshot.name}
              {d.contactSnapshot.title !== 'Not mentioned' ? ` — ${d.contactSnapshot.title}` : ''}
            </Text>
          )}

          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: statusColor }]}>
              <Text style={[s.badgeText, { color: V.navy }]}>
                {statusLabel}
              </Text>
            </View>
            <View style={[s.badge, { backgroundColor: '#1E293B' }]}>
              <Text style={[s.badgeText, { color: C.white }]}>
                {dispositionLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Contact Details ── */}
        <VbrickSectionHeader title="Contact Details" accentColor={C.blue} />
        <View style={s.oppDetailsWrapper}>
          <View style={[s.oppDetailsAccent, { backgroundColor: C.blue }]} />
          <View style={s.oppDetailsBody}>
            {[
              { label: 'Name', value: d.contactSnapshot.name },
              { label: 'Title', value: d.contactSnapshot.title },
              { label: 'Company', value: d.contactSnapshot.company },
              { label: 'Direct Line', value: d.contactSnapshot.directLine },
              { label: 'Email', value: d.contactSnapshot.email },
              { label: 'Current Solution', value: d.currentSolution },
            ]
              .filter((f) => f.value !== 'Not mentioned')
              .map((f) => (
                <View key={f.label} style={s.fieldRow}>
                  <Text style={s.fieldLabel}>{f.label}</Text>
                  <Text style={s.fieldValue}>{f.value}</Text>
                </View>
              ))}
          </View>
        </View>

        <SectionDivider />

        {/* ── The Truth ── */}
        <VbrickSectionHeader title="The Truth" accentColor={V.cyan} />
        <View style={s.notesWrapper}>
          <View style={vs.notesAccent} />
          <View style={s.notesBody}>
            <Text style={s.notesText}>{d.theTruth}</Text>
          </View>
        </View>

        {d.prospectStatusDetail && (
          <View style={s.sectionContent}>
            <Text style={[s.tagColumnLabel, { marginBottom: 4 }]}>Status Detail</Text>
            <Text style={[s.notesText, { fontSize: 9, color: C.gray500 }]}>
              {d.prospectStatusDetail}
            </Text>
          </View>
        )}

        <SectionDivider />

        {/* ── SPIN Call Performance ── */}
        <View wrap={false}>
          <VbrickSectionHeader title="Call Performance" accentColor={V.cyan} />
          <View style={vs.spinContainer}>
            {spinDimensions.map(({ letter, detail }) => (
              <View key={letter}>
                <View style={vs.spinRow}>
                  <Text style={vs.spinLetter}>{letter}</Text>
                  <View style={vs.spinBarTrack}>
                    <View
                      style={[
                        vs.spinBarFill,
                        {
                          width: `${Math.min(Math.max(detail.score, 0), 10) * 10}%`,
                          backgroundColor: spinBarColor(detail.score),
                        },
                      ]}
                    />
                  </View>
                  <Text style={vs.spinScore}>{detail.score}</Text>
                </View>
                <Text style={vs.spinEvidence}>
                  {detail.evidence.length > 0
                    ? detail.evidence[0]
                    : detail.missed}
                </Text>
              </View>
            ))}

            <View style={vs.spinDivider} />

            <View style={vs.spinCompositeRow}>
              <Text style={vs.spinCompositeLabel}>Composite</Text>
              <Text
                style={[
                  vs.spinCompositeScore,
                  { color: spinBarColor(spin.composite) },
                ]}
              >
                {spin.composite}
              </Text>
            </View>

            {spin.coachingNote && (
              <Text style={vs.spinCoaching}>{spin.coachingNote}</Text>
            )}
          </View>
        </View>

        <SectionDivider />

        {/* ── Next Action ── */}
        <View wrap={false}>
          <VbrickSectionHeader title="Next Action" accentColor={V.cyan} />
          <View style={s.sectionContent}>
            <View style={[s.attendeeCard, { backgroundColor: V.cyanBg }]}>
              <View style={{ flex: 1 }}>
                <Text style={[s.attendeeName, { fontSize: 10, marginBottom: 3 }]}>
                  {d.nextAction.action}
                </Text>
                <Text style={[s.attendeeDetail, { fontSize: 8 }]}>
                  When: {d.nextAction.when}
                </Text>
              </View>
            </View>
          </View>
          <SectionDivider />
        </View>

        {/* ── Objections ── */}
        {d.objections.length > 0 && (
          <View wrap={false}>
            <VbrickSectionHeader title="Objections" accentColor={C.amber} count={d.objections.length} />
            <View style={s.sectionContent}>
              {d.objections.map((obj, i) => (
                <View key={i} style={s.summaryBullet} wrap={false}>
                  <View style={vs.bulletCircle}>
                    <Text style={vs.bulletNumber}>{i + 1}</Text>
                  </View>
                  <Text style={s.summaryText}>{obj}</Text>
                </View>
              ))}
            </View>
            <SectionDivider />
          </View>
        )}

        {/* ── Referral ── */}
        {d.referral && (
          <View wrap={false}>
            <VbrickSectionHeader title="Referral" accentColor="#8B5CF6" />
            <View style={s.sectionContent}>
              <View style={s.fieldRow}>
                <Text style={s.fieldLabel}>Referred To</Text>
                <Text style={s.fieldValue}>{d.referral.referredTo}</Text>
              </View>
              <View style={[s.fieldRow, { borderBottomWidth: 0 }]}>
                <Text style={s.fieldLabel}>Reason</Text>
                <Text style={s.fieldValue}>{d.referral.reason}</Text>
              </View>
            </View>
          </View>
        )}

        <VbrickPageFooter />
      </Page>

      {/* ═══════════════════════════════════════════
          PAGE 2 — AE BRIEFING (conditional)
          ═══════════════════════════════════════════ */}
      {d.aeBriefing && (
        <Page size="A4" style={s.bodyPage}>
          <VbrickBodyPageHeader />

          <VbrickSectionHeader title="AE Briefing" accentColor={V.cyan} />
          <View style={s.notesWrapper}>
            <View style={vs.notesAccent} />
            <View style={s.notesBody}>
              <Text style={[s.notesText, { fontSize: 10, lineHeight: 1.7 }]}>
                {d.aeBriefing}
              </Text>
            </View>
          </View>

          <VbrickPageFooter />
        </Page>
      )}

      {/* ═══════════════════════════════════════════
          LAST PAGE — CTA
          ═══════════════════════════════════════════ */}
      <Page size="A4" style={vs.ctaPage}>
        <View style={vs.ctaContainer}>
          <Text style={vs.ctaBrandText}>Vbrick Command Center</Text>
          <View style={vs.ctaDivider} />
          <Text style={vs.ctaHeadline}>
            Debrief every call. Get better every week.
          </Text>
          <Text style={vs.ctaSubline}>
            AI-powered call intelligence for the Vbrick sales team.
          </Text>
          <View style={vs.ctaUrlBox}>
            <Text style={vs.ctaUrl}>Vbrick Command Center</Text>
          </View>
          <Text style={vs.ctaSmallFooter}>Powered by StreetNotes.ai</Text>
        </View>

        <View style={[s.footer, { left: 40, right: 40, bottom: 18 }]}>
          <View style={[vs.footerAccentLine, { backgroundColor: V.cyanDark }]} />
          <View style={s.footerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 7, color: C.gray400 }}>Powered by</Text>
              <Image src={LOGO_PATH} style={s.footerLogo} />
            </View>
            <Text
              style={[s.footerText, { color: C.gray400 }]}
              render={({ pageNumber, totalPages }) =>
                `Page ${pageNumber} of ${totalPages}`
              }
            />
            <Text style={[s.footerText, { color: C.gray400 }]}>
              Confidential — Vbrick Internal
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
