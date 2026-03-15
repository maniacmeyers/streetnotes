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
import type {
  DebriefStructuredOutput,
  DealSegment,
  BANTStatus,
  NextStepsStatus,
} from './types'

/* ─── Logo path (resolved at server render time) ─── */
const LOGO_PATH = path.join(process.cwd(), 'public', 'streetnotes_logo.png')

/* ─── Color palette ─── */
const VOLT = '#00E676'
const AMBER = '#FFB300'
const RED = '#FF5252'
const BLUE = '#448AFF'
const DARK = '#121212'
const WHITE = '#FFFFFF'
const TEXT_PRIMARY = '#1A1A1A'
const TEXT_SECONDARY = '#6B7280'
const GRAY_100 = '#F8F9FA'
const GRAY_200 = '#E5E7EB'
const GRAY_400 = '#9CA3AF'

/* ─── Helper: status colors ─── */
function bantDotColor(status: BANTStatus): string {
  if (status === 'confirmed') return VOLT
  if (status === 'implied') return AMBER
  return RED
}

function bantLabel(status: BANTStatus): string {
  if (status === 'confirmed') return 'Confirmed'
  if (status === 'implied') return 'Implied'
  return 'Not identified'
}

function nextStepsColor(status: NextStepsStatus): string {
  if (status === 'confirmed') return VOLT
  if (status === 'one-sided') return AMBER
  return RED
}

function nextStepsBgColor(status: NextStepsStatus): string {
  if (status === 'confirmed') return '#E8F5E9'
  if (status === 'one-sided') return '#FFF8E1'
  return '#FFEBEE'
}

function nextStepsLabel(status: NextStepsStatus): string {
  if (status === 'confirmed') return 'Mutual Next Steps Confirmed'
  if (status === 'one-sided') return 'One-Sided Next Steps'
  return 'No Next Steps Identified'
}

function sentimentColor(
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown'
): string {
  if (sentiment === 'positive') return VOLT
  if (sentiment === 'negative') return RED
  if (sentiment === 'neutral') return BLUE
  return TEXT_SECONDARY
}

function confidenceLabel(level: string): string {
  if (level === 'high') return 'HIGH'
  if (level === 'medium') return 'MEDIUM'
  return 'LOW'
}

function confidenceColor(level: string): string {
  if (level === 'high') return VOLT
  if (level === 'medium') return AMBER
  return RED
}

function segmentLabel(seg: DealSegment): string {
  if (seg === 'smb') return 'SMB'
  if (seg === 'mid-market') return 'Mid-Market'
  if (seg === 'enterprise') return 'Enterprise'
  return 'Partner / Channel'
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  /* ─── Page 1: One-Pager ─── */
  page1: {
    paddingTop: 0,
    paddingBottom: 50,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: TEXT_PRIMARY,
    backgroundColor: WHITE,
  },

  topAccent: {
    width: '100%',
    height: 4,
    backgroundColor: VOLT,
  },

  darkHeader: {
    backgroundColor: DARK,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },

  darkHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  headerLogo: {
    width: 100,
    height: 25,
  },

  headerMeta: {
    alignItems: 'flex-end',
  },

  headerMetaText: {
    fontSize: 8,
    color: GRAY_400,
  },

  patternName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: WHITE,
    textAlign: 'center',
    marginBottom: 8,
  },

  patternDescription: {
    fontSize: 13,
    color: GRAY_400,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.5,
    paddingHorizontal: 20,
  },

  segmentBadge: {
    position: 'absolute',
    bottom: 12,
    right: 24,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: GRAY_400,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },

  /* ─── Next Steps Banner ─── */
  nextStepsBanner: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },

  nextStepsStatusLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  nextStepsAction: {
    fontSize: 9,
    color: TEXT_PRIMARY,
    lineHeight: 1.5,
    marginBottom: 2,
    paddingLeft: 8,
  },

  recoveryScript: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    lineHeight: 1.5,
    marginTop: 6,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: AMBER,
  },

  /* ─── BANT Row ─── */
  bantRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 4,
  },

  bantItem: {
    flex: 1,
    alignItems: 'center',
  },

  bantLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: TEXT_SECONDARY,
    marginBottom: 6,
  },

  bantDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },

  bantStatus: {
    fontSize: 7,
    color: TEXT_SECONDARY,
  },

  /* ─── Top 3 Actions ─── */
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  actionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: VOLT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  actionNumberText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: DARK,
  },

  actionText: {
    fontSize: 10,
    color: TEXT_PRIMARY,
    flex: 1,
    lineHeight: 1.5,
    paddingTop: 2,
  },

  /* ─── Buyer Psychology Highlight ─── */
  psychRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },

  psychBox: {
    flex: 1,
    padding: 12,
    backgroundColor: GRAY_100,
    borderRadius: 4,
  },

  psychBoxLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  psychQuote: {
    fontSize: 9,
    fontStyle: 'italic',
    color: TEXT_PRIMARY,
    lineHeight: 1.5,
    borderLeftWidth: 2,
    paddingLeft: 8,
    marginBottom: 4,
  },

  psychDetail: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    lineHeight: 1.4,
    paddingLeft: 10,
  },

  /* ─── Body Page ─── */
  bodyPage: {
    paddingTop: 48,
    paddingBottom: 50,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: TEXT_PRIMARY,
    backgroundColor: WHITE,
  },

  /* ─── Fixed Header (body pages) ─── */
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK,
    paddingVertical: 10,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fixedHeaderLogo: {
    width: 80,
    height: 20,
  },

  fixedHeaderTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: TEXT_SECONDARY,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  /* ─── Footer ─── */
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    borderTopWidth: 1,
    borderTopColor: GRAY_200,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLogo: {
    width: 50,
    height: 12,
  },

  footerText: {
    fontSize: 7,
    color: TEXT_SECONDARY,
  },

  /* ─── Section Headers ─── */
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 24,
  },

  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 0.6,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
  },

  /* ─── Commitment Language ─── */
  commitmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 8,
  },

  commitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    marginTop: 3,
  },

  commitQuote: {
    fontSize: 9,
    fontStyle: 'italic',
    color: TEXT_PRIMARY,
    flex: 1,
    lineHeight: 1.5,
    borderLeftWidth: 2,
    paddingLeft: 8,
  },

  commitSignificance: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    paddingLeft: 24,
    marginBottom: 4,
    lineHeight: 1.4,
  },

  fillerMeaning: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    paddingLeft: 24,
    marginBottom: 2,
    lineHeight: 1.4,
  },

  recoveryMove: {
    fontSize: 8,
    color: TEXT_PRIMARY,
    paddingLeft: 24,
    marginBottom: 8,
    lineHeight: 1.4,
  },

  /* ─── Objection Cards ─── */
  objectionCard: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
  },

  objectionSurface: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },

  objectionLabel: {
    fontSize: 8,
    color: TEXT_SECONDARY,
    marginBottom: 2,
  },

  objectionBody: {
    fontSize: 9,
    color: TEXT_PRIMARY,
    lineHeight: 1.5,
    marginBottom: 4,
  },

  objectionEvidence: {
    fontSize: 9,
    fontStyle: 'italic',
    color: TEXT_PRIMARY,
    lineHeight: 1.4,
    marginBottom: 4,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: GRAY_200,
  },

  objectionRecovery: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: TEXT_PRIMARY,
    lineHeight: 1.5,
  },

  /* ─── Stakeholder Table ─── */
  tableContainer: {
    paddingHorizontal: 24,
  },

  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: GRAY_100,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: GRAY_200,
  },

  tableHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 1.5,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
    alignItems: 'center',
  },

  tableRowAlt: {
    backgroundColor: GRAY_100,
  },

  tableCell: {
    fontSize: 9,
    color: TEXT_PRIMARY,
    lineHeight: 1.4,
  },

  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* ─── Page 3: Deal Reference ─── */
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  snapshotItem: {
    width: '33.33%',
    paddingVertical: 10,
    paddingRight: 12,
  },

  snapshotLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 1.5,
    color: TEXT_SECONDARY,
    textTransform: 'uppercase',
    marginBottom: 3,
  },

  snapshotValue: {
    fontSize: 11,
    color: TEXT_PRIMARY,
    fontFamily: 'Helvetica-Bold',
  },

  snapshotNotMentioned: {
    fontSize: 11,
    color: GRAY_400,
    fontStyle: 'italic',
  },

  summaryItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingHorizontal: 24,
  },

  summaryNumber: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_SECONDARY,
    width: 18,
  },

  summaryText: {
    fontSize: 10,
    color: TEXT_PRIMARY,
    flex: 1,
    lineHeight: 1.5,
  },

  /* ─── Tags ─── */
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 8,
  },

  tag: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },

  tagGreen: {
    color: VOLT,
    backgroundColor: '#E8F5E9',
  },

  tagRed: {
    color: RED,
    backgroundColor: '#FFEBEE',
  },

  tagGray: {
    color: TEXT_SECONDARY,
    backgroundColor: GRAY_100,
  },

  /* ─── Page 4: CTA ─── */
  ctaPage: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    backgroundColor: DARK,
  },

  ctaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },

  ctaLogo: {
    width: 200,
    height: 50,
    marginBottom: 40,
  },

  ctaDivider: {
    width: '40%',
    height: 2,
    backgroundColor: VOLT,
    marginBottom: 32,
  },

  ctaHeadline: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: WHITE,
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: 12,
  },

  ctaSubline: {
    fontSize: 13,
    color: GRAY_400,
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 36,
  },

  ctaUrlContainer: {
    backgroundColor: VOLT,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 4,
  },

  ctaUrl: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: DARK,
    letterSpacing: 1,
  },
})

/* ─── Reusable Components ─── */

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  )
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <Image src={LOGO_PATH} style={s.footerLogo} />
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
      <Text style={s.footerText}>Confidential</Text>
    </View>
  )
}

function BodyHeader() {
  return (
    <View style={s.fixedHeader} fixed>
      <Image src={LOGO_PATH} style={s.fixedHeaderLogo} />
      <Text style={s.fixedHeaderTitle}>Deal Intelligence Report</Text>
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

/* ─── Main Component ─── */
export function DebriefPDF({ data, email, date, dealSegment }: PDFProps) {
  const d = data
  const pattern = d.dealPattern
  const gap = pattern.gapAnalysis
  const mutual = d.mutualNextSteps
  const commit = d.commitmentAnalysis

  // Grab first real commitment and first filler for page 1 highlight
  const firstCommitment = commit.realCommitments[0] ?? null
  const firstFiller = commit.fillerSignals[0] ?? null

  // Top 3 recommended actions (cap at 3)
  const topActions = pattern.recommendedActions.slice(0, 3)

  return (
    <Document>
      {/* ══════════════════════════════════════════════════
          PAGE 1 — THE ONE-PAGER
          ══════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page1}>
        {/* Volt green accent bar */}
        <View style={s.topAccent} />

        {/* Dark header block */}
        <View style={s.darkHeader}>
          <View style={s.darkHeaderTopRow}>
            <Image src={LOGO_PATH} style={s.headerLogo} />
            <View style={s.headerMeta}>
              <Text style={s.headerMetaText}>{date}</Text>
              <Text style={s.headerMetaText}>{email}</Text>
            </View>
          </View>

          {/* Pattern name + description */}
          <Text style={s.patternName}>{pattern.name}</Text>
          <Text style={s.patternDescription}>{pattern.description}</Text>

          {/* Segment badge */}
          <Text style={s.segmentBadge}>{segmentLabel(dealSegment)}</Text>
        </View>

        {/* Mutual Next Steps Banner */}
        <View
          style={[
            s.nextStepsBanner,
            { backgroundColor: nextStepsBgColor(mutual.status) },
          ]}
        >
          <Text
            style={[
              s.nextStepsStatusLabel,
              { color: nextStepsColor(mutual.status) },
            ]}
          >
            {nextStepsLabel(mutual.status)}
          </Text>

          {mutual.repActions.map((a, i) => (
            <Text key={`rep-${i}`} style={s.nextStepsAction}>
              You: {a.action}{a.dueDate ? ` (by ${a.dueDate})` : ''}
            </Text>
          ))}
          {mutual.prospectActions.map((a, i) => (
            <Text key={`prospect-${i}`} style={s.nextStepsAction}>
              Them: {a.action}{a.dueDate ? ` (by ${a.dueDate})` : ''}
            </Text>
          ))}

          {mutual.recoveryScript && (
            <Text style={s.recoveryScript}>
              Recovery: {mutual.recoveryScript}
            </Text>
          )}
        </View>

        {/* BANT Gap Row */}
        <View style={s.bantRow}>
          {(
            [
              { label: 'Budget', status: gap.budget },
              { label: 'Authority', status: gap.authority },
              { label: 'Need', status: gap.need },
              { label: 'Timeline', status: gap.timeline },
            ] as Array<{ label: string; status: BANTStatus }>
          ).map((item) => (
            <View key={item.label} style={s.bantItem}>
              <Text style={s.bantLabel}>{item.label}</Text>
              <View
                style={[s.bantDot, { backgroundColor: bantDotColor(item.status) }]}
              />
              <Text style={s.bantStatus}>{bantLabel(item.status)}</Text>
            </View>
          ))}
        </View>

        {/* Top 3 Actions */}
        {topActions.length > 0 && (
          <View wrap={false}>
            <SectionHeading title="Recommended Actions" />
            <View style={s.actionsContainer}>
              {topActions.map((action, i) => (
                <View key={i} style={s.actionItem}>
                  <View style={s.actionNumber}>
                    <Text style={s.actionNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={s.actionText}>{action}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Buyer Psychology Highlight */}
        {(firstCommitment || firstFiller) && (
          <View style={s.psychRow} wrap={false}>
            {firstCommitment && (
              <View style={[s.psychBox, { borderTopWidth: 3, borderTopColor: VOLT }]}>
                <Text style={[s.psychBoxLabel, { color: VOLT }]}>
                  Strongest Signal
                </Text>
                <Text style={[s.psychQuote, { borderLeftColor: VOLT }]}>
                  &ldquo;{firstCommitment.quote}&rdquo;
                </Text>
                <Text style={s.psychDetail}>
                  {firstCommitment.significance}
                </Text>
              </View>
            )}
            {firstFiller && (
              <View style={[s.psychBox, { borderTopWidth: 3, borderTopColor: AMBER }]}>
                <Text style={[s.psychBoxLabel, { color: AMBER }]}>
                  Watch This
                </Text>
                <Text style={[s.psychQuote, { borderLeftColor: AMBER }]}>
                  &ldquo;{firstFiller.quote}&rdquo;
                </Text>
                <Text style={s.psychDetail}>
                  {firstFiller.recoveryMove}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Page 1 Footer */}
        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 2 — FULL INTELLIGENCE
          ══════════════════════════════════════════════════ */}
      <Page size="A4" style={s.bodyPage}>
        <BodyHeader />
        <PageFooter />

        {/* Commitment Language */}
        {(commit.realCommitments.length > 0 || commit.fillerSignals.length > 0) && (
          <View wrap={false}>
            <SectionHeading title="Commitment Language" />

            {/* Real commitments */}
            {commit.realCommitments.map((c, i) => (
              <View key={`rc-${i}`}>
                <View style={s.commitmentItem}>
                  <View style={[s.commitDot, { backgroundColor: VOLT }]} />
                  <Text style={[s.commitQuote, { borderLeftColor: VOLT }]}>
                    &ldquo;{c.quote}&rdquo;
                  </Text>
                </View>
                <Text style={s.commitSignificance}>{c.significance}</Text>
              </View>
            ))}

            {/* Filler signals */}
            {commit.fillerSignals.map((f, i) => (
              <View key={`fs-${i}`}>
                <View style={s.commitmentItem}>
                  <View style={[s.commitDot, { backgroundColor: AMBER }]} />
                  <Text style={[s.commitQuote, { borderLeftColor: AMBER }]}>
                    &ldquo;{f.quote}&rdquo;
                  </Text>
                </View>
                <Text style={s.fillerMeaning}>{f.meaning}</Text>
                <Text style={s.recoveryMove}>
                  {'\u2192'} {f.recoveryMove}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Objection Diagnostics */}
        {d.objectionDiagnostics.length > 0 && (
          <View wrap={false}>
            <SectionHeading title="Objection Diagnostics" />
            {d.objectionDiagnostics.map((obj, i) => (
              <View key={i} style={s.objectionCard}>
                <Text style={s.objectionSurface}>{obj.surfaceObjection}</Text>

                <Text style={s.objectionLabel}>Real blocker:</Text>
                <Text style={s.objectionBody}>{obj.realBlocker}</Text>

                {obj.evidence.length > 0 && (
                  <View>
                    <Text style={s.objectionLabel}>Evidence:</Text>
                    {obj.evidence.map((ev, j) => (
                      <Text key={j} style={s.objectionEvidence}>
                        &ldquo;{ev}&rdquo;
                      </Text>
                    ))}
                  </View>
                )}

                <Text style={s.objectionLabel}>Recovery play:</Text>
                <Text style={s.objectionRecovery}>{obj.recoveryPlay}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stakeholders Table */}
        {d.decisionMakers.length > 0 && (
          <View wrap={false}>
            <SectionHeading title="Stakeholders" />
            <View style={s.tableContainer}>
              <View style={s.tableHeaderRow}>
                <Text style={[s.tableHeader, { width: '35%' }]}>Name</Text>
                <Text style={[s.tableHeader, { width: '40%' }]}>Role</Text>
                <Text style={[s.tableHeader, { width: '25%' }]}>Sentiment</Text>
              </View>
              {d.decisionMakers.map((dm, i) => (
                <View
                  key={i}
                  style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
                >
                  <Text style={[s.tableCell, { width: '35%', fontFamily: 'Helvetica-Bold' }]}>
                    {dm.name}
                  </Text>
                  <Text style={[s.tableCell, { width: '40%' }]}>
                    {dm.role}
                  </Text>
                  <View
                    style={{
                      width: '25%',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <View
                      style={[
                        s.sentimentDot,
                        { backgroundColor: sentimentColor(dm.sentiment) },
                      ]}
                    />
                    <Text style={s.tableCell}>{dm.sentiment}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 3 — DEAL REFERENCE
          ══════════════════════════════════════════════════ */}
      <Page size="A4" style={s.bodyPage}>
        <BodyHeader />
        <PageFooter />

        {/* Deal Snapshot — 2x3 Grid */}
        <View wrap={false}>
          <SectionHeading title="Deal Snapshot" />
          <View style={s.snapshotGrid}>
            {[
              { label: 'Company', value: d.dealSnapshot.companyName },
              { label: 'Contact', value: d.dealSnapshot.contactName },
              { label: 'Title', value: d.dealSnapshot.contactTitle },
              { label: 'Stage', value: d.dealSnapshot.dealStage },
              { label: 'Est. Value', value: d.dealSnapshot.estimatedValue },
              { label: 'Timeline', value: d.dealSnapshot.timeline },
            ].map((field) => (
              <View key={field.label} style={s.snapshotItem}>
                <Text style={s.snapshotLabel}>{field.label}</Text>
                <Text
                  style={
                    field.value === 'Not mentioned'
                      ? s.snapshotNotMentioned
                      : s.snapshotValue
                  }
                >
                  {field.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Confidence */}
        <View wrap={false} style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: TEXT_SECONDARY, letterSpacing: 1, textTransform: 'uppercase' }}>
              Overall Confidence:
            </Text>
            <View style={{
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 4,
              backgroundColor: confidenceColor(d.overallConfidence),
            }}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 8, color: DARK }}>
                {confidenceLabel(d.overallConfidence)}
              </Text>
            </View>
          </View>
        </View>

        {/* Call Summary */}
        {d.callSummary.length > 0 && (
          <View wrap={false}>
            <SectionHeading title="Call Summary" />
            {d.callSummary.map((point, i) => (
              <View key={i} style={s.summaryItem}>
                <Text style={s.summaryNumber}>{i + 1}.</Text>
                <Text style={s.summaryText}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Buying Signals */}
        {d.buyingSignals.length > 0 && (
          <View wrap={false}>
            <SectionHeading title="Buying Signals" />
            <View style={s.tagRow}>
              {d.buyingSignals.map((sig, i) => (
                <Text key={i} style={[s.tag, s.tagGreen]}>
                  {sig}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Risks */}
        {d.risks.length > 0 && (
          <View wrap={false}>
            <SectionHeading title="Risks" />
            <View style={s.tagRow}>
              {d.risks.map((risk, i) => (
                <Text key={i} style={[s.tag, s.tagRed]}>
                  {risk}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Competitors */}
        {d.competitorsMentioned.length > 0 && (
          <View wrap={false}>
            <SectionHeading title="Competitors Mentioned" />
            <View style={s.tagRow}>
              {d.competitorsMentioned.map((comp, i) => (
                <Text key={i} style={[s.tag, s.tagGray]}>
                  {comp}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>

      {/* ══════════════════════════════════════════════════
          PAGE 4 — CTA
          ══════════════════════════════════════════════════ */}
      <Page size="A4" style={s.ctaPage}>
        <View style={s.ctaContainer}>
          <Image src={LOGO_PATH} style={s.ctaLogo} />
          <View style={s.ctaDivider} />
          <Text style={s.ctaHeadline}>
            Pattern recognition. Buyer psychology. Gap analysis.
          </Text>
          <Text style={s.ctaSubline}>
            On every call. Straight to your CRM.
          </Text>
          <View style={s.ctaUrlContainer}>
            <Text style={s.ctaUrl}>streetnotes.ai</Text>
          </View>
        </View>

        <View style={[s.footer, { borderTopColor: '#2A2A2A' }]}>
          <Image src={LOGO_PATH} style={s.footerLogo} />
          <Text
            style={[s.footerText, { color: TEXT_SECONDARY }]}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
          <Text style={[s.footerText, { color: TEXT_SECONDARY }]}>Confidential</Text>
        </View>
      </Page>
    </Document>
  )
}
