'use client'

import { useState, useRef, useCallback } from 'react'
import { FileText, ClipboardPaste } from 'lucide-react'
import { GlassCardElevated } from './glass-card'

interface TranscriptInputProps {
  onSubmit: (transcript: string) => void
  onCancel: () => void
}

const ACCEPTED_EXTENSIONS = ['.txt', '.vtt', '.srt', '.csv', '.json', '.md', '.doc', '.docx']

function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text || !text.trim()) {
        reject(new Error('File is empty'))
        return
      }
      // Strip VTT/SRT timestamps if present
      const cleaned = text
        .replace(/WEBVTT\n\n/g, '')
        .replace(/\d{2}:\d{2}:\d{2}[.,]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[.,]\d{3}\n?/g, '')
        .replace(/^\d+\n/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
      resolve(cleaned)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function TranscriptInput({ onSubmit, onCancel }: TranscriptInputProps) {
  const [text, setText] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setError(null)
    setFileName(file.name)
    try {
      const content = await extractTextFromFile(file)
      setText(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read file')
      setFileName(null)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text')
    if (pasted && pasted.trim().length > 20) {
      setText(pasted.trim())
      setFileName(null)
    }
  }, [])

  const canSubmit = text.trim().length > 20

  return (
    <GlassCardElevated>
      <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#7ed4f7] font-inter font-medium mb-2">
        Paste or Drop Transcript
      </h3>
      <p className="text-gray-400 text-xs font-inter mb-4">
        Chorus transcript, meeting summary, call notes, or any text file
      </p>

      {/* Drop zone + textarea */}
      <div
        className={`relative rounded-lg border-2 transition-colors duration-200 ${
          dragOver
            ? 'border-[#7ed4f7] bg-[#7ed4f7]/5'
            : 'border-white/10'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setFileName(null) }}
          onPaste={handlePaste}
          placeholder="Paste your Chorus transcript here, or drag and drop a file..."
          className="w-full bg-transparent rounded-lg px-4 py-3 text-white text-sm font-inter placeholder:text-gray-500 focus:outline-none min-h-[200px] resize-y"
        />

        {/* File indicator or drop prompt */}
        {!text && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <FileText className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-gray-500 text-xs font-inter">
              Drop .txt, .vtt, .srt, or paste text
            </p>
          </div>
        )}
      </div>

      {fileName && (
        <p className="text-[#7ed4f7] text-xs font-inter mt-2 flex items-center gap-1.5">
          <FileText className="w-3 h-3" />
          {fileName}
        </p>
      )}

      {error && (
        <p className="text-red-400 text-xs font-inter mt-2">{error}</p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => canSubmit && onSubmit(text.trim())}
          disabled={!canSubmit}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold uppercase tracking-widest text-sm cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#7ed4f7', color: '#061222' }}
        >
          <ClipboardPaste className="w-4 h-4" />
          Process Transcript
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="px-4 py-3 rounded-lg text-gray-400 text-sm font-inter hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-white/20"
        >
          Browse
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-3 rounded-lg text-gray-400 text-sm font-inter hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-white/20"
        >
          Cancel
        </button>
      </div>
    </GlassCardElevated>
  )
}
