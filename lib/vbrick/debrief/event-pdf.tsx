import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { EventConversationOutput } from '@/lib/debrief/types'

/* ─── Palette (mirrors the BDR PDF for visual consistency) ─── */
const C = {
  indigo: '#6366f1',
  indigoDark: '#4338ca',
  indigoBg: '#EEF2FF',
  red: '#dc2626',
  amber: '#d97706',
  amberBg: '#FFFBEB',
  green: '#16a34a',
  greenBg: '#ECFDF5',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
}

function temperatureColor(t: string): string {
  if (t === 'hot') return C.red
  if (t === 'warm') return C.amber
  if (t === 'cold') return C.gray500
  return C.gray400 // not-a-fit
}

function temperatureBg(t: string): string {
  if (t === 'hot') return '#FEE2E2'
  if (t === 'warm') return C.amberBg
  if (t === 'cold') return C.gray100
  return C.gray100
}

function sentimentColor(s: string): string {
  if (s === 'positive') return C.green
  if (s === 'negative') return C.red
  return C.gray500
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.white,
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.gray900,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: C.indigo,
    marginBottom: 18,
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
  },
  brandSub: {
    fontSize: 8,
    color: C.gray500,
    marginTop: 2,
  },
  meta: {
    fontSize: 8,
    color: C.gray500,
    textAlign: 'right',
  },
  metaBold: {
    fontFamily: 'Helvetica-Bold',
    color: C.gray700,
  },
  // Hero strip
  heroRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  contactBlock: {
    flex: 1,
    backgroundColor: C.gray50,
    borderRadius: 6,
    padding: 12,
  },
  contactName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: C.gray900,
  },
  contactSub: {
    fontSize: 9,
    color: C.gray500,
    marginTop: 2,
  },
  contactPair: {
    flexDirection: 'row',
    marginTop: 4,
    fontSize: 9,
  },
  contactKey: {
    color: C.gray500,
    width: 60,
  },
  contactVal: {
    color: C.gray700,
  },
  // Status row
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  // ServiceNow modules
  modulesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  modulePill: {
    backgroundColor: C.indigoBg,
    color: C.indigoDark,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  // Section
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  body: {
    fontSize: 10,
    color: C.gray900,
    lineHeight: 1.5,
  },
  // Two-column row
  twoCol: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  colHalf: {
    flex: 1,
  },
  // Next action
  nextAction: {
    backgroundColor: C.indigoBg,
    borderLeftWidth: 3,
    borderLeftColor: C.indigo,
    padding: 10,
    borderRadius: 4,
  },
  nextActionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.indigo,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  nextActionText: {
    fontSize: 11,
    color: C.gray900,
    fontFamily: 'Helvetica-Bold',
  },
  nextActionWhen: {
    fontSize: 9,
    color: C.gray500,
    marginTop: 2,
  },
  // Bullet
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 10,
    color: C.indigo,
    fontFamily: 'Helvetica-Bold',
  },
  // CI mention
  ciRow: {
    flexDirection: 'row',
    backgroundColor: C.gray50,
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    gap: 8,
  },
  ciDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  ciCompetitor: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.gray900,
  },
  ciQuote: {
    fontSize: 9,
    color: C.gray700,
    fontStyle: 'italic',
    marginTop: 2,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.gray200,
    fontSize: 7,
    color: C.gray400,
    textAlign: 'center',
  },
})

interface VbrickEventDebriefPDFProps {
  data: EventConversationOutput
  email: string
  date: string
}

export function VbrickEventDebriefPDF({ data, email, date }: VbrickEventDebriefPDFProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Vbrick · K26 Event Debrief</Text>
            <Text style={styles.brandSub}>ServiceNow Knowledge 26 · Las Vegas · powered by StreetNotes.ai</Text>
          </View>
          <View>
            <Text style={styles.meta}>
              <Text style={styles.metaBold}>{email}</Text>
            </Text>
            <Text style={styles.meta}>{date}</Text>
          </View>
        </View>

        {/* Contact block */}
        <View style={styles.heroRow}>
          <View style={styles.contactBlock}>
            <Text style={styles.contactName}>
              {data.contactSnapshot?.name || 'Unknown contact'}
            </Text>
            <Text style={styles.contactSub}>
              {[data.contactSnapshot?.title, data.contactSnapshot?.company].filter(Boolean).join(' · ') || 'No company / title'}
            </Text>
            {data.contactSnapshot?.email && data.contactSnapshot.email !== 'Not mentioned' && (
              <View style={styles.contactPair}>
                <Text style={styles.contactKey}>Email</Text>
                <Text style={styles.contactVal}>{data.contactSnapshot.email}</Text>
              </View>
            )}
            <View style={styles.contactPair}>
              <Text style={styles.contactKey}>Badge</Text>
              <Text style={styles.contactVal}>{data.badgeCollected ? 'Collected ✓' : 'Not collected'}</Text>
            </View>
          </View>
        </View>

        {/* Status pills */}
        <View style={styles.statusRow}>
          <Text style={[styles.statusPill, { backgroundColor: C.indigoBg, color: C.indigoDark }]}>
            {String(data.engagementType || '').replace(/-/g, ' ')}
          </Text>
          <Text style={[styles.statusPill, { backgroundColor: C.gray100, color: C.gray700 }]}>
            Demo: {data.demoWatched || 'none'}
          </Text>
          <Text style={[
            styles.statusPill,
            { backgroundColor: temperatureBg(data.temperature), color: temperatureColor(data.temperature) },
          ]}>
            {String(data.temperature || '').replace(/-/g, ' ')}
          </Text>
        </View>

        {/* ServiceNow stack */}
        {Array.isArray(data.servicenowModules) && data.servicenowModules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ServiceNow Stack</Text>
            <View style={styles.modulesRow}>
              {data.servicenowModules.map((m, i) => (
                <Text key={i} style={styles.modulePill}>{m}</Text>
              ))}
            </View>
          </View>
        )}

        {/* The Truth */}
        {data.theTruth && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Truth</Text>
            <Text style={styles.body}>{data.theTruth}</Text>
          </View>
        )}

        {/* Demo + Current Solution side-by-side */}
        {(data.currentSolution && data.currentSolution !== 'Not mentioned') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Solution</Text>
            <Text style={styles.body}>{data.currentSolution}</Text>
          </View>
        )}

        {/* Objections */}
        {Array.isArray(data.objections) && data.objections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Objections</Text>
            {data.objections.map((o, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.body, { flex: 1 }]}>{o}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Followup commitment */}
        {data.followupCommitment && data.followupCommitment !== 'Not mentioned' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Followup Commitment</Text>
            <Text style={styles.body}>{data.followupCommitment}</Text>
          </View>
        )}

        {/* Next Action */}
        {data.nextAction?.action && (
          <View style={styles.section}>
            <View style={styles.nextAction}>
              <Text style={styles.nextActionLabel}>Next Action</Text>
              <Text style={styles.nextActionText}>{data.nextAction.action}</Text>
              {data.nextAction.when && (
                <Text style={styles.nextActionWhen}>When: {data.nextAction.when}</Text>
              )}
            </View>
          </View>
        )}

        {/* AE Briefing */}
        {data.aeBriefing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AE Briefing</Text>
            <Text style={styles.body}>{data.aeBriefing}</Text>
          </View>
        )}

        {/* CI Mentions */}
        {Array.isArray(data.ciMentions) && data.ciMentions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Competitive Mentions</Text>
            {data.ciMentions.map((m, i) => (
              <View key={i} style={styles.ciRow}>
                <View style={[styles.ciDot, { backgroundColor: sentimentColor(m.sentiment) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ciCompetitor}>{m.competitorName}</Text>
                  <Text style={styles.ciQuote}>&ldquo;{m.contextQuote}&rdquo;</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          Vbrick K26 Event Debrief · powered by StreetNotes.ai
        </Text>
      </Page>
    </Document>
  )
}
