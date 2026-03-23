'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload } from 'lucide-react'
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
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors duration-200 cursor-pointer ${
          dragOver
            ? 'border-[#7ed4f7] bg-[#7ed4f7]/5'
            : 'border-white/10 hover:border-white/20'
        }`}
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
        <Upload className="w-8 h-8 text-[#7ed4f7] mx-auto mb-3" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#7ed4f7] font-inter font-medium mb-1">
          Load Today&apos;s Call List
        </p>
        <p className="text-xs text-gray-500 font-inter">
          Export your Salesforce call list and drop it here
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-xs font-inter mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
