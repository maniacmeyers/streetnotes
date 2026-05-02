import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createAdminClient } from '@/lib/supabase/admin'
import { VbrickDebriefPDF } from '@/lib/vbrick/debrief/pdf'
import type { VbrickBDRStructuredOutput } from '@/lib/debrief/types'
import React from 'react'

export const runtime = 'nodejs'
export const maxDuration = 15

/**
 * VBrick BDR-shape PDF endpoint.
 *
 * The public /api/debrief/pdf renders DebriefPDF, which expects the
 * aesthetic-vertical shape (dealSegment, dealSnapshot, attendees…).
 * VBrick stores BDR shape (mode, contactSnapshot, theTruth, spin…), so
 * the public PDF came out blank for VBrick sessions.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  const supabase = createAdminClient()
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

  const structured = session.structured_output as unknown as VbrickBDRStructuredOutput
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  try {
    const pdfElement = React.createElement(VbrickDebriefPDF, {
      data: structured,
      email: session.email,
      date,
    })

    const buffer = await renderToBuffer(
      pdfElement as unknown as React.ReactElement
    )

    await supabase
      .from('debrief_sessions')
      .update({ pdf_generated: true })
      .eq('id', sessionId)

    const dateSlug = new Date().toISOString().split('T')[0]

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="vbrick-debrief-${dateSlug}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('VBrick PDF generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
