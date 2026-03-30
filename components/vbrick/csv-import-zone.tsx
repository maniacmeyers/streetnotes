'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet } from 'lucide-react'
import { neuTheme } from '@/lib/vbrick/theme'
import { parseCallListCSV, type QueueContact, type ColumnMapping, DEFAULT_IMPORT_MAPPING } from '@/lib/vbrick/csv-parser'

interface CsvImportZoneProps {
  onImport: (contacts: QueueContact[]) => void
  mapping?: ColumnMapping
}

export function CsvImportZone({ onImport, mapping }: CsvImportZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const getSavedMapping = (): ColumnMapping => {
    if (mapping) return mapping
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vbrick_import_mapping')
      if (saved) {
        try { return JSON.parse(saved) } catch {}
      }
    }
    return DEFAULT_IMPORT_MAPPING
  }

  const handleFile = useCallback((file: File) => {
    setError(null)
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const contacts = parseCallListCSV(text, getSavedMapping())
      if (contacts.length === 0) {
        setError('No contacts found. Check your CSV column headers match your Settings mapping.')
        return
      }
      onImport(contacts)
    }
    reader.readAsText(file)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onImport, mapping])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div>
      <div
        className="group rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer relative overflow-hidden"
        style={{
          background: dragOver ? neuTheme.colors.bg : neuTheme.colors.bg,
          borderColor: dragOver ? neuTheme.colors.accent.primary : neuTheme.colors.shadow,
          boxShadow: dragOver
            ? `0 0 0 3px ${neuTheme.colors.accent.primary}30, ${neuTheme.shadows.inset}`
            : neuTheme.shadows.inset,
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') fileRef.current?.click() }}
        aria-label="Import CSV call list"
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all"
          style={{
            background: neuTheme.colors.bg,
            boxShadow: neuTheme.shadows.raisedSm,
          }}
        >
          {dragOver ? (
            <FileSpreadsheet className="w-7 h-7" style={{ color: neuTheme.colors.accent.primary }} />
          ) : (
            <Upload className="w-7 h-7" style={{ color: neuTheme.colors.accent.primary }} />
          )}
        </div>

        <p
          className="text-sm font-semibold font-inter mb-1"
          style={{ color: neuTheme.colors.text.heading }}
        >
          Load Today&apos;s Call List
        </p>
        <p className="text-xs font-inter" style={{ color: neuTheme.colors.text.muted }}>
          Export your Salesforce call list and drop the CSV here
        </p>
      </div>

      {error && (
        <p className="text-xs font-inter mt-2 text-center" style={{ color: neuTheme.colors.status.danger }}>
          {error}
        </p>
      )}
    </div>
  )
}
