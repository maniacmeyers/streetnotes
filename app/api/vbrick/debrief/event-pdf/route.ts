import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createAdminClient } from '@/lib/supabase/admin'
import { VbrickEventDebriefPDF } from '@/lib/vbrick/debrief/event-pdf'
import type { EventConversationOutput } from '@/lib/debrief/types'
import React from 'react'

export const runtime = 'nodejs'
export const maxDuration = 15

/**
 * VBrick K26 event-conversation PDF endpoint.
 *
 * Mirrors /api/vbrick/debrief/pdf but renders the event-shape layout
 * for sessions whose structured_output.mode === 'vbrick-event-conversation'.
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

  const structured = session.structured_output as unknown as EventConversationOutput
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  try {
    const pdfElement = React.createElement(VbrickEventDebriefPDF, {
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
    const company = (structured.contactSnapshot?.company || 'k26')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="vbrick-k26-${company}-${dateSlug}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('VBrick K26 event PDF generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
