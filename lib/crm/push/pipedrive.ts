import type { CRMNote } from '@/lib/notes/schema'
import type { DecryptedTokens, PushResult, PushOptions } from './types'

const PD_API = 'https://api.pipedrive.com/v1'

async function pdFetch(
  tokens: DecryptedTokens,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = path.includes('?')
    ? `${PD_API}${path}&api_token=${tokens.accessToken}`
    : `${PD_API}${path}?api_token=${tokens.accessToken}`

  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function pushToPipedrive(tokens: DecryptedTokens, note: CRMNote, options: PushOptions): Promise<PushResult> {
  // Pipedrive integration placeholder — not yet implemented
  void [pdFetch, PD_API, tokens, note, options]
  return { success: false, error: 'Pipedrive integration not yet implemented', errorCode: 'api_error' }
}
