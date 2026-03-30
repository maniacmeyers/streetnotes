'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X, Loader2, Check } from 'lucide-react'
import { NeuCard, NeuButton } from '@/components/vbrick/neu'
import { neuTheme } from '@/lib/vbrick/theme'

interface FileUploaderProps {
  campaignId: string
  email: string
  onUploadComplete: () => void
}

interface UploadedFile {
  name: string
  size: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  extractedLength?: number
}

const ACCEPTED_TYPES = '.txt,.md,.docx,.pdf,.csv'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function FileUploader({ campaignId, email, onUploadComplete }: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(fileList: FileList) {
    const newFiles: UploadedFile[] = []
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i]
      if (f.size > MAX_FILE_SIZE) {
        setError(`${f.name} exceeds 10MB limit`)
        continue
      }
      newFiles.push({ name: f.name, size: f.size, status: 'pending' })
    }
    setFiles(prev => [...prev, ...newFiles])
    setError(null)
  }

  function removeFile(name: string) {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  async function handleUpload() {
    if (!files.some(f => f.status === 'pending')) return

    setUploading(true)
    setError(null)

    // Get the actual File objects from the input
    const fileInput = inputRef.current
    if (!fileInput?.files) {
      setError('No files selected')
      setUploading(false)
      return
    }

    const formData = new FormData()
    formData.append('email', email)

    const pendingNames = new Set(files.filter(f => f.status === 'pending').map(f => f.name))
    for (let i = 0; i < fileInput.files.length; i++) {
      const f = fileInput.files[i]
      if (pendingNames.has(f.name)) {
        formData.append('files', f)
      }
    }

    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' as const } : f))

    try {
      const res = await fetch(`/api/vbrick/campaigns/${campaignId}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      const resultMap = new Map(
        (data.uploaded || []).map((r: { file_name: string; status: string; extracted_length?: number }) => [r.file_name, r])
      )

      setFiles(prev =>
        prev.map(f => {
          const result = resultMap.get(f.name) as { status: string; extracted_length?: number } | undefined
          if (result && result.status === 'ok') {
            return { ...f, status: 'done' as const, extractedLength: result.extracted_length }
          } else if (result) {
            return { ...f, status: 'error' as const }
          }
          return f
        })
      )

      onUploadComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'error' as const } : f))
    } finally {
      setUploading(false)
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <NeuCard
        variant="inset"
        hover={false}
        padding="lg"
        className="text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e: React.DragEvent) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        <div
          className="py-8 flex flex-col items-center gap-3"
          style={{
            borderRadius: neuTheme.radii.md,
            border: `2px dashed ${isDragging ? neuTheme.colors.accent.primary : neuTheme.colors.shadow}60`,
            transition: neuTheme.transitions.default,
          }}
        >
          <Upload
            size={32}
            style={{ color: isDragging ? neuTheme.colors.accent.primary : neuTheme.colors.text.subtle }}
          />
          <div>
            <p className="font-satoshi text-sm font-medium" style={{ color: neuTheme.colors.text.body }}>
              Drop campaign files here or click to browse
            </p>
            <p className="font-satoshi text-xs mt-1" style={{ color: neuTheme.colors.text.subtle }}>
              Supports .docx, .pdf, .txt, .md, .csv (max 10MB each)
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
          }}
        />
      </NeuCard>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <NeuCard key={f.name} padding="sm" radius="sm" className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} style={{ color: neuTheme.colors.accent.primary, flexShrink: 0 }} />
                <div className="min-w-0">
                  <p className="font-satoshi text-sm font-medium truncate" style={{ color: neuTheme.colors.text.heading }}>
                    {f.name}
                  </p>
                  <p className="font-satoshi text-xs" style={{ color: neuTheme.colors.text.subtle }}>
                    {formatSize(f.size)}
                    {f.extractedLength ? ` — ${f.extractedLength.toLocaleString()} chars extracted` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {f.status === 'uploading' && <Loader2 size={16} className="animate-spin" style={{ color: neuTheme.colors.accent.primary }} />}
                {f.status === 'done' && <Check size={16} style={{ color: neuTheme.colors.status.success }} />}
                {f.status === 'error' && <span className="text-xs font-satoshi" style={{ color: neuTheme.colors.status.danger }}>Error</span>}
                {f.status === 'pending' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(f.name) }}
                    className="border-none bg-transparent cursor-pointer p-1"
                    style={{ color: neuTheme.colors.text.subtle }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </NeuCard>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="font-satoshi text-sm" style={{ color: neuTheme.colors.status.danger }}>
          {error}
        </p>
      )}

      {/* Upload button */}
      {files.some(f => f.status === 'pending') && (
        <NeuButton
          variant="accent"
          size="md"
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="mr-2 inline-block animate-spin" />
              Uploading &amp; Extracting...
            </>
          ) : (
            <>
              <Upload size={16} className="mr-2 inline-block" />
              Upload {files.filter(f => f.status === 'pending').length} File{files.filter(f => f.status === 'pending').length > 1 ? 's' : ''}
            </>
          )}
        </NeuButton>
      )}
    </div>
  )
}
