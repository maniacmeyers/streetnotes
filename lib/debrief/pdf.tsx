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
import type { DebriefStructuredOutput } from './types'

/* ─── Logo path (resolved at server render time) ─── */
const LOGO_PATH = path.join(process.cwd(), 'public', 'streetnotes_logo.png')

/* ─── Color palette ─── */
const VOLT = '#00E676'
const VOLT_DIM = '#004D25'
const DARK = '#121212'
const DARK_3 = '#222222'
const WHITE = '#FFFFFF'
const RED = '#FF5252'
const YELLOW = '#FFD600'
const BLUE = '#448AFF'
const GRAY_100 = '#F3F4F6'
const GRAY_200 = '#E5E7EB'
const GRAY_300 = '#D1D5DB'
const GRAY_500 = '#6B7280'
const GRAY_600 = '#4B5563'
const GRAY_700 = '#374151'
const GRAY_800 = '#1F2937'

/* ─── Styles ─── */
const s = StyleSheet.create({
  /* Page */
  page: {
    paddingTop: 0,
    paddingBottom: 50,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: GRAY_700,
    backgroundColor: WHITE,
  },
  pageContent: {
    paddingHorizontal: 40,
  },

  /* ─── Cover Header ─── */
  coverHeader: {
    backgroundColor: DARK,
    paddingVertical: 32,
    paddingHorizontal: 40,
    marginBottom: 28,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 160,
    height: 40,
  },
  coverTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coverAccentBar: {
    width: 4,
    height: 36,
    backgroundColor: VOLT,
    borderRadius: 2,
  },
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: WHITE,
    letterSpacing: 1,
  },
  coverMeta: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: DARK_3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverMetaText: {
    fontSize: 9,
    color: GRAY_500,
  },

  /* ─── Page Header (non-cover pages) ─── */
  pageHeader: {
    backgroundColor: DARK,
    paddingVertical: 12,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageHeaderLogo: {
    width: 100,
    height: 25,
  },
  pageHeaderTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: GRAY_500,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  /* ─── Deal Score ─── */
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 40,
  },
  scoreBadgeOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreBadgeInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNum: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
  },
  scoreLabelGroup: {
    flex: 1,
  },
  scoreLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: GRAY_800,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  scoreRationale: {
    fontSize: 9,
    color: GRAY_500,
    lineHeight: 1.5,
  },

  /* ─── Snapshot ─── */
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  snapshotItem: {
    width: '50%',
    paddingVertical: 10,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
  },
  snapshotLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 1.5,
    color: GRAY_500,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  snapshotValue: {
    fontSize: 11,
    color: GRAY_800,
    fontFamily: 'Helvetica-Bold',
  },
  snapshotNotMentioned: {
    fontSize: 11,
    color: GRAY_300,
    fontStyle: 'italic',
  },

  /* ─── Sections ─── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 40,
  },
  sectionAccent: {
    width: 3,
    height: 14,
    backgroundColor: VOLT,
    borderRadius: 1.5,
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: DARK,
    textTransform: 'uppercase',
  },

  /* ─── Summary ─── */
  summary: {
    fontSize: 10,
    lineHeight: 1.7,
    color: GRAY_600,
    paddingHorizontal: 40,
    marginBottom: 16,
    paddingLeft: 51,
  },

  /* ─── List items ─── */
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 40,
    paddingLeft: 51,
  },
  listBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: VOLT_DIM,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  listBulletText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: VOLT,
  },
  listText: {
    fontSize: 10,
    color: GRAY_700,
    flex: 1,
    lineHeight: 1.5,
    paddingTop: 2,
  },

  /* ─── Table ─── */
  tableContainer: {
    paddingHorizontal: 40,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: GRAY_100,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: GRAY_300,
  },
  tableHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 1.5,
    color: GRAY_500,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    fontSize: 9,
    color: GRAY_700,
    lineHeight: 1.4,
  },

  /* ─── Tags ─── */
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 40,
    paddingLeft: 51,
    marginTop: 4,
  },
  tag: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 3,
    textTransform: 'uppercase',
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
    color: GRAY_600,
    backgroundColor: GRAY_100,
  },

  /* ─── Stakeholder Cards ─── */
  stakeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 40,
    paddingLeft: 51,
    gap: 10,
  },
  sentimentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stakeholderName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: GRAY_800,
  },
  stakeholderDetail: {
    fontSize: 9,
    color: GRAY_500,
  },

  /* ─── Mind Map ─── */
  mmCentral: {
    backgroundColor: DARK,
    borderWidth: 2.5,
    borderColor: VOLT,
    borderRadius: 6,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 40,
    marginBottom: 20,
  },
  mmCompanyText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: WHITE,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  mmScorePill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mmScoreInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: DARK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mmScoreText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: WHITE,
  },
  mmBranch: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 6,
    marginBottom: 12,
    marginHorizontal: 40,
  },
  mmBranchLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  mmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  mmDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  mmItemText: {
    fontSize: 9,
    color: GRAY_700,
    flex: 1,
    lineHeight: 1.3,
  },

  /* ─── CTA Page ─── */
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
    width: 60,
    height: 3,
    backgroundColor: VOLT,
    borderRadius: 1.5,
    marginBottom: 32,
  },
  ctaHeadline: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: WHITE,
    textAlign: 'center',
    lineHeight: 1.4,
    marginBottom: 12,
  },
  ctaSubline: {
    fontSize: 13,
    color: GRAY_500,
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

  /* ─── Footer ─── */
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: GRAY_500,
  },
  footerAccent: {
    width: 30,
    height: 2,
    backgroundColor: VOLT,
    borderRadius: 1,
  },
})

function scoreColor(score: number): string {
  if (score >= 7) return VOLT
  if (score >= 4) return YELLOW
  return RED
}

function sentimentColor(
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown'
): string {
  if (sentiment === 'positive') return VOLT
  if (sentiment === 'negative') return RED
  if (sentiment === 'neutral') return BLUE
  return GRAY_500
}

/* ─── Reusable Components ─── */

function SectionHeading({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionAccent} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  )
}

function PageFooter({ page, total }: { page: number; total: number }) {
  return (
    <View style={s.footer}>
      <Text style={s.footerText}>
        Page {page} of {total}
      </Text>
      <View style={s.footerAccent} />
      <Text style={s.footerText}>streetnotes.ai  |  Confidential</Text>
    </View>
  )
}

function InnerPageHeader() {
  return (
    <View style={s.pageHeader}>
      <Image src={LOGO_PATH} style={s.pageHeaderLogo} />
      <Text style={s.pageHeaderTitle}>Post-Call Brain Dump</Text>
    </View>
  )
}

interface PDFProps {
  data: DebriefStructuredOutput
  email: string
  date: string
}

export function DebriefPDF({ data, email, date }: PDFProps) {
  const d = data
  const totalPages = 5

  return (
    <Document>
      {/* ── PAGE 1: COVER + SNAPSHOT ── */}
      <Page size="A4" style={s.page}>
        {/* Cover Header with Logo */}
        <View style={s.coverHeader}>
          <View style={s.logoRow}>
            <Image src={LOGO_PATH} style={s.logo} />
          </View>
          <View style={s.coverTitleRow}>
            <View style={s.coverAccentBar} />
            <Text style={s.coverTitle}>Post-Call Brain Dump</Text>
          </View>
          <View style={s.coverMeta}>
            <Text style={s.coverMetaText}>{email}</Text>
            <Text style={s.coverMetaText}>{date}</Text>
          </View>
        </View>

        {/* Deal Score */}
        <View style={s.scoreContainer}>
          <View style={[s.scoreBadgeOuter, { backgroundColor: scoreColor(d.dealScore) }]}>
            <View style={s.scoreBadgeInner}>
              <Text style={[s.scoreNum, { color: scoreColor(d.dealScore) }]}>
                {d.dealScore}
              </Text>
            </View>
          </View>
          <View style={s.scoreLabelGroup}>
            <Text style={s.scoreLabel}>Deal Score</Text>
            <Text style={s.scoreRationale}>{d.dealScoreRationale}</Text>
          </View>
        </View>

        {/* Deal Snapshot */}
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

        {/* Summary */}
        <SectionHeading title="Summary" />
        <Text style={s.summary}>{d.summary}</Text>

        {/* Key Takeaways */}
        {d.keyTakeaways.length > 0 && (
          <>
            <SectionHeading title="Key Takeaways" />
            {d.keyTakeaways.map((t, i) => (
              <View key={i} style={s.listItem}>
                <View style={s.listBullet}>
                  <Text style={s.listBulletText}>{i + 1}</Text>
                </View>
                <Text style={s.listText}>{t}</Text>
              </View>
            ))}
          </>
        )}

        <PageFooter page={1} total={totalPages} />
      </Page>

      {/* ── PAGE 2: OBJECTIONS + NEXT STEPS ── */}
      <Page size="A4" style={s.page}>
        <InnerPageHeader />

        {/* Objections */}
        {d.objections.length > 0 && (
          <>
            <SectionHeading title="Objections" />
            <View style={s.tableContainer}>
              <View style={s.tableHeaderRow}>
                <Text style={[s.tableHeader, { width: '40%' }]}>Objection</Text>
                <Text style={[s.tableHeader, { width: '40%' }]}>Rep Response</Text>
                <Text style={[s.tableHeader, { width: '20%' }]}>Status</Text>
              </View>
              {d.objections.map((obj, i) => (
                <View
                  key={i}
                  style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
                >
                  <Text style={[s.tableCell, { width: '40%' }]}>
                    {obj.objection}
                  </Text>
                  <Text style={[s.tableCell, { width: '40%' }]}>
                    {obj.response || 'Not addressed'}
                  </Text>
                  <Text
                    style={[
                      s.tableCell,
                      {
                        width: '20%',
                        color: obj.resolved ? VOLT : RED,
                        fontFamily: 'Helvetica-Bold',
                      },
                    ]}
                  >
                    {obj.resolved ? 'Resolved' : 'Open'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Next Steps */}
        {d.nextSteps.length > 0 && (
          <>
            <SectionHeading title="Next Steps" />
            <View style={s.tableContainer}>
              <View style={s.tableHeaderRow}>
                <Text style={[s.tableHeader, { width: '50%' }]}>Action</Text>
                <Text style={[s.tableHeader, { width: '25%' }]}>Owner</Text>
                <Text style={[s.tableHeader, { width: '25%' }]}>Due</Text>
              </View>
              {d.nextSteps.map((step, i) => (
                <View
                  key={i}
                  style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
                >
                  <Text style={[s.tableCell, { width: '50%' }]}>
                    {step.action}
                  </Text>
                  <Text
                    style={[
                      s.tableCell,
                      {
                        width: '25%',
                        fontFamily: 'Helvetica-Bold',
                        color:
                          step.owner === 'rep'
                            ? VOLT
                            : step.owner === 'prospect'
                              ? BLUE
                              : GRAY_500,
                      },
                    ]}
                  >
                    {step.owner === 'rep'
                      ? 'You'
                      : step.owner === 'prospect'
                        ? 'Prospect'
                        : 'Other'}
                  </Text>
                  <Text style={[s.tableCell, { width: '25%' }]}>
                    {step.dueDate}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <PageFooter page={2} total={totalPages} />
      </Page>

      {/* ── PAGE 3: STAKEHOLDERS + SIGNALS ── */}
      <Page size="A4" style={s.page}>
        <InnerPageHeader />

        {/* Decision Makers */}
        {d.decisionMakers.length > 0 && (
          <>
            <SectionHeading title="Decision Makers" />
            {d.decisionMakers.map((dm, i) => (
              <View key={i} style={s.stakeholderCard}>
                <View
                  style={[
                    s.sentimentDot,
                    { backgroundColor: sentimentColor(dm.sentiment) },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.stakeholderName}>{dm.name}</Text>
                  <Text style={s.stakeholderDetail}>
                    {dm.role}  ·  {dm.sentiment}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Buying Signals */}
        {d.buyingSignals.length > 0 && (
          <>
            <SectionHeading title="Buying Signals" />
            <View style={s.tagRow}>
              {d.buyingSignals.map((sig, i) => (
                <Text key={i} style={[s.tag, s.tagGreen]}>
                  {sig}
                </Text>
              ))}
            </View>
          </>
        )}

        {/* Risks */}
        {d.risks.length > 0 && (
          <>
            <SectionHeading title="Risks" />
            <View style={s.tagRow}>
              {d.risks.map((risk, i) => (
                <Text key={i} style={[s.tag, s.tagRed]}>
                  {risk}
                </Text>
              ))}
            </View>
          </>
        )}

        {/* Competitors */}
        {d.competitorsMentioned.length > 0 && (
          <>
            <SectionHeading title="Competitors Mentioned" />
            <View style={s.tagRow}>
              {d.competitorsMentioned.map((comp, i) => (
                <Text key={i} style={[s.tag, s.tagGray]}>
                  {comp}
                </Text>
              ))}
            </View>
          </>
        )}

        <PageFooter page={3} total={totalPages} />
      </Page>

      {/* ── PAGE 4: DEAL MIND MAP ── */}
      <Page size="A4" style={s.page}>
        <InnerPageHeader />

        <SectionHeading title="Deal Mind Map" />

        {/* Central node */}
        <View style={s.mmCentral}>
          <Text style={s.mmCompanyText}>
            {d.dealSnapshot.companyName || 'Deal'}
          </Text>
          <View
            style={[s.mmScorePill, { backgroundColor: scoreColor(d.dealScore) }]}
          >
            <View style={s.mmScoreInner}>
              <Text style={s.mmScoreText}>{d.dealScore}</Text>
            </View>
          </View>
        </View>

        {/* Branches */}
        {d.nextSteps.length > 0 && (
          <View style={[s.mmBranch, { borderLeftColor: VOLT }]}>
            <Text style={[s.mmBranchLabel, { color: VOLT }]}>Next Steps</Text>
            {d.nextSteps.map((step, i) => (
              <View key={i} style={s.mmItem}>
                <View style={[s.mmDot, { backgroundColor: VOLT }]} />
                <Text style={s.mmItemText}>{step.action}</Text>
              </View>
            ))}
          </View>
        )}

        {d.objections.length > 0 && (
          <View style={[s.mmBranch, { borderLeftColor: RED }]}>
            <Text style={[s.mmBranchLabel, { color: RED }]}>Objections</Text>
            {d.objections.map((obj, i) => (
              <View key={i} style={s.mmItem}>
                <View style={[s.mmDot, { backgroundColor: RED }]} />
                <Text style={s.mmItemText}>
                  {obj.objection}
                  {obj.resolved ? ' (Resolved)' : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {d.decisionMakers.length > 0 && (
          <View style={[s.mmBranch, { borderLeftColor: BLUE }]}>
            <Text style={[s.mmBranchLabel, { color: BLUE }]}>Stakeholders</Text>
            {d.decisionMakers.map((dm, i) => (
              <View key={i} style={s.mmItem}>
                <View style={[s.mmDot, { backgroundColor: BLUE }]} />
                <Text style={s.mmItemText}>
                  {dm.name} — {dm.role}
                </Text>
              </View>
            ))}
          </View>
        )}

        {d.buyingSignals.length > 0 && (
          <View style={[s.mmBranch, { borderLeftColor: VOLT }]}>
            <Text style={[s.mmBranchLabel, { color: VOLT }]}>
              Buying Signals
            </Text>
            {d.buyingSignals.map((sig, i) => (
              <View key={i} style={s.mmItem}>
                <View style={[s.mmDot, { backgroundColor: VOLT }]} />
                <Text style={s.mmItemText}>{sig}</Text>
              </View>
            ))}
          </View>
        )}

        {d.risks.length > 0 && (
          <View style={[s.mmBranch, { borderLeftColor: RED }]}>
            <Text style={[s.mmBranchLabel, { color: RED }]}>Risks</Text>
            {d.risks.map((risk, i) => (
              <View key={i} style={s.mmItem}>
                <View style={[s.mmDot, { backgroundColor: RED }]} />
                <Text style={s.mmItemText}>{risk}</Text>
              </View>
            ))}
          </View>
        )}

        {d.competitorsMentioned.length > 0 && (
          <View style={[s.mmBranch, { borderLeftColor: GRAY_500 }]}>
            <Text style={[s.mmBranchLabel, { color: GRAY_500 }]}>
              Competitors
            </Text>
            {d.competitorsMentioned.map((comp, i) => (
              <View key={i} style={s.mmItem}>
                <View style={[s.mmDot, { backgroundColor: GRAY_500 }]} />
                <Text style={s.mmItemText}>{comp}</Text>
              </View>
            ))}
          </View>
        )}

        <PageFooter page={4} total={totalPages} />
      </Page>

      {/* ── PAGE 5: CTA ── */}
      <Page size="A4" style={s.ctaPage}>
        <View style={s.ctaContainer}>
          <Image src={LOGO_PATH} style={s.ctaLogo} />
          <View style={s.ctaDivider} />
          <Text style={s.ctaHeadline}>
            Now imagine this pushed{'\n'}straight to your CRM.
          </Text>
          <Text style={s.ctaSubline}>
            Every call. Every field. No typing.{'\n'}That&apos;s StreetNotes.
          </Text>
          <View style={s.ctaUrlContainer}>
            <Text style={s.ctaUrl}>streetnotes.ai</Text>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={[s.footerText, { color: GRAY_600 }]}>
            Page 5 of {totalPages}
          </Text>
          <View style={s.footerAccent} />
          <Text style={[s.footerText, { color: GRAY_600 }]}>
            streetnotes.ai  |  Confidential
          </Text>
        </View>
      </Page>
    </Document>
  )
}
