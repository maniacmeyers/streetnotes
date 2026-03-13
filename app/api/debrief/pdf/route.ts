import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { DebriefPDF } from '@/lib/debrief/pdf'
import type { DebriefStructuredOutput } from '@/lib/debrief/types'
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

  const structured = session.structured_output as unknown as DebriefStructuredOutput
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  try {
    const buffer = await renderToBuffer(
      React.createElement(DebriefPDF, {
        data: structured,
        email: session.email,
        date,
      })
    )

    // Mark PDF as generated
    await supabase
      .from('debrief_sessions')
      .update({ pdf_generated: true })
      .eq('id', sessionId)

    const dateSlug = new Date().toISOString().split('T')[0]

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="streetnotes-debrief-${dateSlug}.pdf"`,
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
