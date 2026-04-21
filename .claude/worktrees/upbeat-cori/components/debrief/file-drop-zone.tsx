'use client'

import { useState, useRef, useCallback, type DragEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FaUpload, FaSpinner } from 'react-icons/fa'

interface FileDropZoneProps {
  onFileText: (text: string) => void
  disabled?: boolean
}

const ACCEPTED_EXTENSIONS = ['.txt', '.vtt', '.srt']
const ALL_LISTED_EXTENSIONS = ['.txt', '.vtt', '.srt', '.docx', '.pdf']

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return ''
  return filename.slice(dot).toLowerCase()
}

/**
 * Strip VTT formatting: remove WEBVTT header, timestamp lines, cue IDs, blank lines.
 * Keep only the spoken dialogue text.
 */
function parseVTT(raw: string): string {
  const lines = raw.split(/\r?\n/)
  const output: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    // Skip WEBVTT header and any metadata lines at the top
    if (trimmed === 'WEBVTT' || trimmed.startsWith('WEBVTT ')) continue
    // Skip NOTE blocks
    if (trimmed.startsWith('NOTE')) continue
    // Skip timestamp lines (00:01:23.456 --> 00:01:25.789)
    if (/^\d{2}:\d{2}:\d{2}\.\d{3}\s*-->/.test(trimmed)) continue
    // Skip numeric cue identifiers (standalone numbers)
    if (/^\d+$/.test(trimmed)) continue
    // Skip empty lines
    if (trimmed === '') continue
    // Strip inline VTT tags like <v Speaker> or <c.colorCCC>
    const cleaned = trimmed.replace(/<[^>]+>/g, '').trim()
    if (cleaned) output.push(cleaned)
  }

  return output.join('\n')
}

/**
 * Strip SRT formatting: remove numeric cue IDs, timestamp lines, blank lines.
 * Keep only the spoken dialogue text.
 */
function parseSRT(raw: string): string {
  const lines = raw.split(/\r?\n/)
  const output: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    // Skip numeric cue identifiers
    if (/^\d+$/.test(trimmed)) continue
    // Skip timestamp lines (00:01:23,456 --> 00:01:25,789)
    if (/^\d{2}:\d{2}:\d{2},\d{3}\s*-->/.test(trimmed)) continue
    // Skip empty lines
    if (trimmed === '') continue
    // Strip HTML-like formatting tags
    const cleaned = trimmed.replace(/<[^>]+>/g, '').trim()
    if (cleaned) output.push(cleaned)
  }

  return output.join('\n')
}

export default function FileDropZone({ onFileText, disabled }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    async (file: File) => {
      setError(null)
      setIsProcessing(true)

      try {
        const ext = getExtension(file.name)

        if (ext === '.docx' || ext === '.pdf') {
          setError(
            'Word docs and PDFs can\'t be read directly in the browser. Copy the text from your file and use the paste option below.'
          )
          setIsProcessing(false)
          return
        }

        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
          setError(
            `Unsupported file type "${ext}". Accepted formats: ${ALL_LISTED_EXTENSIONS.join(', ')}`
          )
          setIsProcessing(false)
          return
        }

        const text = await file.text()

        if (!text.trim()) {
          setError('File appears to be empty.')
          setIsProcessing(false)
          return
        }

        let parsed: string
        if (ext === '.vtt') {
          parsed = parseVTT(text)
        } else if (ext === '.srt') {
          parsed = parseSRT(text)
        } else {
          parsed = text.trim()
        }

        if (!parsed.trim()) {
          setError('No readable text found after parsing the file.')
          setIsProcessing(false)
          return
        }

        onFileText(parsed)
      } catch {
        setError('Failed to read the file. Try the paste option instead.')
      } finally {
        setIsProcessing(false)
      }
    },
    [onFileText]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        processFile(files[0])
      }
    },
    [processFile]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        processFile(files[0])
      }
      // Reset so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [processFile]
  )

  const handlePasteSubmit = useCallback(() => {
    if (pasteText.trim().length < 50) return
    onFileText(pasteText.trim())
  }, [pasteText, onFileText])

  const canSubmitPaste = pasteText.trim().length >= 50

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-dashed border-2 p-8 sm:p-10 flex flex-col items-center justify-center gap-3
          transition-all duration-200 cursor-pointer min-h-[180px]
          ${isDragOver
            ? 'border-[#7ed4f7] bg-[#7ed4f7]/5'
            : 'border-white/20 hover:border-white/40'
          }
          ${disabled || isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <FaSpinner className="text-[#7ed4f7] text-2xl animate-spin" />
            <p className="font-mono text-sm text-white/60">Reading file...</p>
          </div>
        ) : (
          <>
            <FaUpload className={`text-2xl transition-colors ${isDragOver ? 'text-[#7ed4f7]' : 'text-white/40'}`} />
            <div className="text-center">
              <p className="text-white text-sm font-medium">
                Drop your transcript file
              </p>
              <p className="text-white/40 text-xs mt-1">
                Chorus exports, Teams transcripts, or any call notes
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              {ALL_LISTED_EXTENSIONS.map((ext) => (
                <span
                  key={ext}
                  className="font-mono text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded"
                >
                  {ext}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="text-[#7ed4f7] text-xs hover:text-[#7ed4f7]/80 transition-colors mt-1"
            >
              or browse files
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.vtt,.srt,.docx,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
          >
            <p className="text-red-400 text-xs">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paste toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowPaste((prev) => !prev)}
          disabled={disabled || isProcessing}
          className="text-white/40 text-xs hover:text-white/60 transition-colors"
        >
          {showPaste ? 'hide paste option' : 'or paste transcript'}
        </button>
      </div>

      {/* Paste textarea */}
      <AnimatePresence>
        {showPaste && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3">
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your Chorus transcript or call notes here..."
                rows={6}
                disabled={disabled || isProcessing}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white text-sm placeholder:text-white/20 resize-none outline-none focus:border-[#7ed4f7]/50 transition-colors"
              />
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] text-white/30">
                  {pasteText.trim().length > 0
                    ? `${pasteText.trim().split(/\s+/).length} words`
                    : 'Min 50 characters'}
                </p>
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  disabled={!canSubmitPaste || disabled || isProcessing}
                  className="bg-[#7ed4f7] text-[#061222] text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7ed4f7]/90 transition-colors"
                >
                  Process
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
