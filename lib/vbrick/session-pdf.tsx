/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

const V = {
  darkNavy: '#061222',
  softNavy: '#0d1e3a',
  cyan: '#7ed4f7',
  white: '#FFFFFF',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  red: '#EF4444',
  amber: '#F59E0B',
  green: '#22C55E',
}

const s = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: V.white,
    backgroundColor: V.darkNavy,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(126,212,247,0.2)',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: V.cyan,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 8,
    color: V.gray500,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: V.softNavy,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: V.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 7,
    color: V.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: V.cyan,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 16,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  callName: {
    flex: 2,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: V.white,
  },
  callCompany: {
    flex: 2,
    fontSize: 9,
    color: V.gray400,
  },
  callDisp: {
    flex: 1,
    fontSize: 8,
    color: V.gray400,
  },
  callSpin: {
    width: 40,
    textAlign: 'right',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: V.gray500,
  },
})

function spinColor(score: number): string {
  if (score <= 3) return V.red
  if (score <= 6) return V.amber
  if (score <= 8) return V.cyan
  return V.green
}

interface SessionPDFProps {
  bdrName: string
  date: string
  duration: string
  totalCalls: number
  connectedCount: number
  appointmentsCount: number
  convRate: number
  apptRate: number
  averageSpin: number
  bestSpin: number
  bestSpinContact: string
  calls: Array<{
    contactName: string
    company: string
    disposition: string
    prospectStatus: string
    spinScore: number | null
  }>
}

export function VbrickSessionPDF({
  bdrName,
  date,
  duration,
  totalCalls,
  connectedCount,
  appointmentsCount,
  convRate,
  apptRate,
  averageSpin,
  bestSpin,
  bestSpinContact,
  calls,
}: SessionPDFProps) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>VBRICK COMMAND CENTER</Text>
            <Text style={{ ...s.subtitle, marginTop: 2 }}>Session Report</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 9, color: V.white }}>{bdrName}</Text>
            <Text style={{ ...s.subtitle, marginTop: 2 }}>{date} | {duration}</Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{totalCalls}</Text>
            <Text style={s.statLabel}>Total Calls</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{connectedCount}</Text>
            <Text style={s.statLabel}>Connected</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{appointmentsCount}</Text>
            <Text style={s.statLabel}>Appointments</Text>
          </View>
        </View>

        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <Text style={s.statValue}>{convRate}%</Text>
            <Text style={s.statLabel}>Answer to Conversation</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statValue}>{apptRate}%</Text>
            <Text style={s.statLabel}>Conversation to Appt</Text>
          </View>
          <View style={s.statBox}>
            <Text style={{ ...s.statValue, color: spinColor(averageSpin) }}>
              {averageSpin.toFixed(1)}
            </Text>
            <Text style={s.statLabel}>Avg SPIN</Text>
          </View>
        </View>

        {/* Best SPIN */}
        {bestSpin > 0 && (
          <View style={{ alignItems: 'center', marginBottom: 16, padding: 12, backgroundColor: V.softNavy, borderRadius: 8 }}>
            <Text style={{ fontSize: 7, color: V.gray400, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
              Best SPIN
            </Text>
            <Text style={{ fontSize: 28, fontFamily: 'Helvetica-Bold', color: V.green }}>
              {bestSpin.toFixed(1)}
            </Text>
            {bestSpinContact && (
              <Text style={{ fontSize: 8, color: V.gray400, marginTop: 2 }}>{bestSpinContact}</Text>
            )}
          </View>
        )}

        {/* Call Breakdown */}
        <Text style={s.sectionTitle}>Call Breakdown</Text>
        <View style={{ ...s.callRow, borderBottomColor: 'rgba(126,212,247,0.15)', borderBottomWidth: 1 }}>
          <Text style={{ ...s.callName, fontSize: 7, color: V.gray500 }}>Contact</Text>
          <Text style={{ ...s.callCompany, fontSize: 7, color: V.gray500 }}>Company</Text>
          <Text style={{ ...s.callDisp, fontSize: 7, color: V.gray500 }}>Disposition</Text>
          <Text style={{ ...s.callSpin, fontSize: 7, color: V.gray500 }}>SPIN</Text>
        </View>
        {calls.map((call, i) => (
          <View key={i} style={s.callRow}>
            <Text style={s.callName}>{call.contactName}</Text>
            <Text style={s.callCompany}>{call.company}</Text>
            <Text style={s.callDisp}>{call.disposition}</Text>
            <Text style={{ ...s.callSpin, color: call.spinScore ? spinColor(call.spinScore) : V.gray500 }}>
              {call.spinScore ? call.spinScore.toFixed(1) : '—'}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer}>
          <Text>Confidential — Vbrick Internal</Text>
          <Text>Powered by StreetNotes.ai</Text>
        </View>
      </Page>
    </Document>
  )
}
