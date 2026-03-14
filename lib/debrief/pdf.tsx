import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { DebriefStructuredOutput } from './types'

/* ─── Color palette ─── */
const VOLT = '#00E676'
const DARK = '#121212'
const RED = '#FF5252'
const YELLOW = '#FFD600'
const BLUE = '#448AFF'
const GRAY_300 = '#D1D5DB'
const GRAY_500 = '#6B7280'
const GRAY_700 = '#374151'

/* ─── Styles ─── */
const s = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: GRAY_700,
  },
  // Cover
  coverHeader: {
    backgroundColor: DARK,
    padding: 24,
    marginHorizontal: -40,
    marginTop: -40,
    marginBottom: 30,
  },
  coverBrand: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    letterSpacing: 3,
    color: VOLT,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  coverTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  coverSubtitle: {
    fontSize: 10,
    color: GRAY_500,
    marginTop: 6,
  },
  // Deal score
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  scoreBadge: {
    width: 56,
    height: 56,
    borderWidth: 3,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNum: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: '#000000',
  },
  scoreLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 2,
    color: GRAY_500,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  scoreRationale: {
    fontSize: 9,
    color: GRAY_500,
    fontStyle: 'italic',
    flex: 1,
  },
  // Snapshot
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    marginBottom: 20,
  },
  snapshotItem: {
    width: '48%',
    marginBottom: 10,
  },
  snapshotLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 1.5,
    color: GRAY_500,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  snapshotValue: {
    fontSize: 11,
    color: GRAY_700,
  },
  snapshotNotMentioned: {
    fontSize: 11,
    color: GRAY_300,
    fontStyle: 'italic',
  },
  // Sections
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: DARK,
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: DARK,
    paddingBottom: 4,
    marginBottom: 10,
    marginTop: 20,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: GRAY_300,
    marginVertical: 12,
  },
  // Summary
  summary: {
    fontSize: 10,
    lineHeight: 1.6,
    color: GRAY_700,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  // List items
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 6,
  },
  listBullet: {
    fontFamily: 'Helvetica-Bold',
    color: VOLT,
    fontSize: 10,
    width: 12,
  },
  listText: {
    fontSize: 10,
    color: GRAY_700,
    flex: 1,
    lineHeight: 1.4,
  },
  // Table
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: GRAY_300,
    paddingVertical: 6,
  },
  tableHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1,
    color: GRAY_500,
    textTransform: 'uppercase',
  },
  tableCell: {
    fontSize: 9,
    color: GRAY_700,
    lineHeight: 1.3,
  },
  // Tags
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    textTransform: 'uppercase',
  },
  tagGreen: {
    color: VOLT,
    borderColor: VOLT,
  },
  tagRed: {
    color: RED,
    borderColor: RED,
  },
  tagGray: {
    color: GRAY_500,
    borderColor: GRAY_300,
  },
  // Stakeholders
  stakeholderCard: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
    alignItems: 'center',
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: GRAY_500,
  },
  // Mind map
  mmCentral: {
    backgroundColor: DARK,
    borderWidth: 2.5,
    borderColor: VOLT,
    borderRadius: 4,
    padding: 14,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  mmCompanyText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },
  mmScorePill: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  mmScoreText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: '#000000',
  },
  mmBranch: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  mmBranchLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  mmItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
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
  // CTA page
  ctaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  ctaHeadline: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: DARK,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  ctaSubline: {
    fontSize: 14,
    color: GRAY_500,
    textAlign: 'center',
    marginBottom: 24,
  },
  ctaUrl: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: VOLT,
    textAlign: 'center',
    letterSpacing: 2,
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
        {/* Header bar */}
        <View style={s.coverHeader}>
          <Text style={s.coverBrand}>StreetNotes.ai</Text>
          <Text style={s.coverTitle}>Post-Call Brain Dump</Text>
          <Text style={s.coverSubtitle}>
            Generated for {email} on {date}
          </Text>
        </View>

        {/* Deal Score */}
        <View style={s.scoreContainer}>
          <View>
            <View
              style={[
                s.scoreBadge,
                { backgroundColor: scoreColor(d.dealScore) },
              ]}
            >
              <Text style={s.scoreNum}>{d.dealScore}</Text>
            </View>
            <Text style={s.scoreLabel}>Deal Score</Text>
          </View>
          <Text style={s.scoreRationale}>{d.dealScoreRationale}</Text>
        </View>

        {/* Deal Snapshot */}
        <Text style={s.sectionTitle}>Deal Snapshot</Text>
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
        <Text style={s.sectionTitle}>Summary</Text>
        <Text style={s.summary}>{d.summary}</Text>

        {/* Key Takeaways */}
        {d.keyTakeaways.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Key Takeaways</Text>
            {d.keyTakeaways.map((t, i) => (
              <View key={i} style={s.listItem}>
                <Text style={s.listBullet}>{i + 1}.</Text>
                <Text style={s.listText}>{t}</Text>
              </View>
            ))}
          </>
        )}

        <View style={s.footer}>
          <Text>
            Page 1 of {totalPages} — streetnotes.ai
          </Text>
          <Text>Confidential</Text>
        </View>
      </Page>

      {/* ── PAGE 2: OBJECTIONS + NEXT STEPS ── */}
      <Page size="A4" style={s.page}>
        {/* Objections */}
        {d.objections.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Objections</Text>
            {/* Table header */}
            <View style={[s.tableRow, { borderBottomWidth: 2 }]}>
              <Text style={[s.tableHeader, { width: '40%' }]}>Objection</Text>
              <Text style={[s.tableHeader, { width: '40%' }]}>
                Rep Response
              </Text>
              <Text style={[s.tableHeader, { width: '20%' }]}>Status</Text>
            </View>
            {d.objections.map((obj, i) => (
              <View key={i} style={s.tableRow}>
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
          </>
        )}

        {/* Next Steps */}
        {d.nextSteps.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Next Steps</Text>
            <View style={[s.tableRow, { borderBottomWidth: 2 }]}>
              <Text style={[s.tableHeader, { width: '50%' }]}>Action</Text>
              <Text style={[s.tableHeader, { width: '25%' }]}>Owner</Text>
              <Text style={[s.tableHeader, { width: '25%' }]}>Due</Text>
            </View>
            {d.nextSteps.map((step, i) => (
              <View key={i} style={s.tableRow}>
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
          </>
        )}

        <View style={s.footer}>
          <Text>
            Page 2 of {totalPages} — streetnotes.ai
          </Text>
          <Text>Confidential</Text>
        </View>
      </Page>

      {/* ── PAGE 3: STAKEHOLDERS + SIGNALS ── */}
      <Page size="A4" style={s.page}>
        {/* Decision Makers */}
        {d.decisionMakers.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Decision Makers</Text>
            {d.decisionMakers.map((dm, i) => (
              <View key={i} style={s.stakeholderCard}>
                <View
                  style={[
                    s.sentimentDot,
                    { backgroundColor: sentimentColor(dm.sentiment) },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      s.tableCell,
                      { fontFamily: 'Helvetica-Bold', fontSize: 10 },
                    ]}
                  >
                    {dm.name}
                  </Text>
                  <Text style={[s.tableCell, { color: GRAY_500 }]}>
                    {dm.role} — {dm.sentiment}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Buying Signals */}
        {d.buyingSignals.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Buying Signals</Text>
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
            <Text style={s.sectionTitle}>Risks</Text>
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
            <Text style={s.sectionTitle}>Competitors Mentioned</Text>
            <View style={s.tagRow}>
              {d.competitorsMentioned.map((comp, i) => (
                <Text key={i} style={[s.tag, s.tagGray]}>
                  {comp}
                </Text>
              ))}
            </View>
          </>
        )}

        <View style={s.footer}>
          <Text>
            Page 3 of {totalPages} — streetnotes.ai
          </Text>
          <Text>Confidential</Text>
        </View>
      </Page>

      {/* ── PAGE 4: DEAL MIND MAP ── */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Deal Mind Map</Text>

        {/* Central node */}
        <View style={s.mmCentral}>
          <Text style={s.mmCompanyText}>
            {d.dealSnapshot.companyName || 'Deal'}
          </Text>
          <View
            style={[
              s.mmScorePill,
              { backgroundColor: scoreColor(d.dealScore) },
            ]}
          >
            <Text style={s.mmScoreText}>{d.dealScore}</Text>
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

        <View style={s.footer}>
          <Text>
            Page 4 of {totalPages} — streetnotes.ai
          </Text>
          <Text>Confidential</Text>
        </View>
      </Page>

      {/* ── PAGE 5: CTA ── */}
      <Page size="A4" style={s.page}>
        <View style={s.ctaContainer}>
          <Text style={s.ctaHeadline}>
            Now imagine this pushed{'\n'}straight to your CRM.
          </Text>
          <Text style={s.ctaSubline}>
            That&apos;s StreetNotes. Every call. Every field. No typing.
          </Text>
          <View style={s.hr} />
          <Text style={s.ctaUrl}>streetnotes.ai</Text>
        </View>

        <View style={s.footer}>
          <Text>
            Page 5 of {totalPages} — streetnotes.ai
          </Text>
          <Text>Confidential</Text>
        </View>
      </Page>
    </Document>
  )
}
