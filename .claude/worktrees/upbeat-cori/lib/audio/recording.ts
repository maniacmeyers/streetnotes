export const PREFERRED_AUDIO_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/ogg;codecs=opus',
] as const

export const MAX_AUDIO_BYTES = 25 * 1024 * 1024

export function pickSupportedMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return ''
  }

  for (const mimeType of PREFERRED_AUDIO_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType
    }
  }

  return ''
}

export function extensionForMimeType(mimeType: string): string {
  const normalized = mimeType.toLowerCase()

  if (normalized.includes('mp4') || normalized.includes('m4a')) {
    return 'mp4'
  }

  if (normalized.includes('ogg')) {
    return 'ogg'
  }

  if (normalized.includes('wav')) {
    return 'wav'
  }

  return 'webm'
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
