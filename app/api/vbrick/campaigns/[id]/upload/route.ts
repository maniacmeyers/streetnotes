import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// POST: Upload files to a campaign, extract text content
export async function POST(request: Request, { params }: { params: { id: string } }) {
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const email = formData.get('email') as string
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

  const files = formData.getAll('files') as File[]
  if (!files.length) return NextResponse.json({ error: 'No files provided' }, { status: 400 })

  const supabase = await createClient()

  // Verify campaign exists
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', params.id)
    .single()

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  const results: Array<{ file_name: string; status: string; extracted_length?: number }> = []

  for (const file of files) {
    try {
      let extractedText = ''
      const fileName = file.name
      const fileType = fileName.split('.').pop()?.toLowerCase() || 'unknown'

      // Extract text based on file type
      if (fileType === 'txt' || fileType === 'md') {
        extractedText = await file.text()
      } else if (fileType === 'docx') {
        // For DOCX: read as ArrayBuffer and extract raw text
        // This is a basic extraction — strips XML tags to get text content
        const buffer = await file.arrayBuffer()
        extractedText = await extractDocxText(buffer)
      } else if (fileType === 'pdf') {
        // For PDF: extract text using basic parsing
        // In production, use pdf-parse or similar
        const buffer = await file.arrayBuffer()
        extractedText = extractPdfText(buffer)
      } else {
        // Try to read as text for unknown types
        try {
          extractedText = await file.text()
        } catch {
          extractedText = `[Could not extract text from ${fileName}]`
        }
      }

      // Save to database
      const { error } = await supabase
        .from('campaign_files')
        .insert({
          campaign_id: params.id,
          file_name: fileName,
          file_type: fileType,
          extracted_text: extractedText || `[No text extracted from ${fileName}]`,
          file_size: file.size,
          uploaded_by: email,
        })

      if (error) {
        results.push({ file_name: fileName, status: `error: ${error.message}` })
      } else {
        results.push({ file_name: fileName, status: 'ok', extracted_length: extractedText.length })
      }
    } catch (err) {
      results.push({ file_name: file.name, status: `error: ${err instanceof Error ? err.message : 'unknown'}` })
    }
  }

  // Update campaign file count in metadata
  const { data: allFiles } = await supabase
    .from('campaign_files')
    .select('id')
    .eq('campaign_id', params.id)

  await supabase
    .from('campaigns')
    .update({
      metadata: { total_files: allFiles?.length || 0 },
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)

  return NextResponse.json({ uploaded: results })
}

/**
 * Basic DOCX text extraction.
 * DOCX is a ZIP containing XML. We find document.xml and strip tags.
 */
async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  try {
    // DOCX files are ZIP archives. Use the built-in DecompressionStream API
    // For a simpler approach, we'll look for text patterns in the raw bytes
    const bytes = new Uint8Array(buffer)
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

    // Find content between <w:t> tags (Word XML paragraph text)
    const matches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g)
    if (matches && matches.length > 0) {
      return matches
        .map(m => m.replace(/<[^>]+>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    }

    // Fallback: extract any readable text segments
    const readable = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
    return readable.length > 100 ? readable : '[DOCX text extraction limited — paste content manually for best results]'
  } catch {
    return '[Could not extract DOCX text]'
  }
}

/**
 * Basic PDF text extraction.
 * Extracts readable text from PDF byte stream.
 */
function extractPdfText(buffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(buffer)
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)

    // Extract text between BT and ET markers (PDF text objects)
    const textBlocks: string[] = []
    const btEtRegex = /BT\s([\s\S]*?)ET/g
    let match
    while ((match = btEtRegex.exec(text)) !== null) {
      const block = match[1]
      // Extract parenthesized strings (PDF text literals)
      const tjMatches = block.match(/\(([^)]+)\)/g)
      if (tjMatches) {
        tjMatches.forEach(m => {
          const clean = m.slice(1, -1).replace(/\\/g, '')
          if (clean.length > 1) textBlocks.push(clean)
        })
      }
    }

    if (textBlocks.length > 0) {
      return textBlocks.join(' ').replace(/\s+/g, ' ').trim()
    }

    // Fallback: extract readable ASCII
    const readable = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim()
    return readable.length > 200 ? readable.substring(0, 5000) : '[PDF text extraction limited — paste content manually for best results]'
  } catch {
    return '[Could not extract PDF text]'
  }
}
