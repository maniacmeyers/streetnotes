import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { DebriefPDF, BDRDebriefPDF, VbrickBDRDebriefPDF } from '@/lib/debrief/pdf'
import type { DebriefOutput } from '@/lib/debrief/types'
import { isBDROutput, isVbrickBDROutput } from '@/lib/debrief/types'
import React from 'react'

export const runtime = 'nodejs'
export const maxDuration = 15

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: session, error } = await supabase
    .from('debrief_sessions')
    .select('email, structured_output')
    .eq('id', sessionId)
    .single()

  if (error || !session || !session.structured_output) {
    return NextResponse.json(
      { error: 'Session not found or results not ready' },
      { status: 404 }
    )
  }

  const structured = session.structured_output as unknown as DebriefOutput
  const isVbrick = session.email.endsWith('@vbrick.com')
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  try {
    let pdfElement: React.ReactElement

    if (isVbrickBDROutput(structured)) {
      pdfElement = React.createElement(VbrickBDRDebriefPDF, {
        data: structured,
        email: session.email,
        date,
      })
    } else if (isBDROutput(structured)) {
      pdfElement = React.createElement(BDRDebriefPDF, {
        data: structured,
        email: session.email,
        date,
      })
    } else {
      pdfElement = React.createElement(DebriefPDF, {
        data: structured,
        email: session.email,
        date,
        dealSegment: structured.dealSegment || 'smb',
      })
    }

    const buffer = await renderToBuffer(
      pdfElement as unknown as React.ReactElement
    )

    // Mark PDF as generated
    await supabase
      .from('debrief_sessions')
      .update({ pdf_generated: true })
      .eq('id', sessionId)

    const dateSlug = new Date().toISOString().split('T')[0]
    const filePrefix = isVbrick
      ? 'vbrick-command-center'
      : isBDROutput(structured) ? 'cold-call' : 'debrief'
    const filenameBase = isVbrick ? 'vbrick-command-center' : 'streetnotes'

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filenameBase}-${filePrefix}-${dateSlug}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
