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

export async function pushToPipedrive(
  tokens: DecryptedTokens,
  note: CRMNote,
  _options: PushOptions
): Promise<PushResult> {
  const results: PushResult = {
    contact: null,
    deal: null,
    task: null,
    errors: [],
  }

  try {
    // Handle contact
    if (note.contact?.name) {
      try {
        const contactRes = await pdFetch(tokens, `/persons/search?term=${encodeURIComponent(note.contact.name)}`)
        
        if (contactRes.ok) {
          const data = await contactRes.json()
          const persons = data.data?.items || []
          
          if (persons.length > 0 && persons[0].item?.type === 'person') {
            results.contact = {
              id: persons[0].item.id.toString(),
              url: `https://app.pipedrive.com/person/${persons[0].item.id}`,
              action: 'found',
            }
          }
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'unknown error'
        results.errors.push(`Contact search error: ${errMsg}`)
      }
    }

    // Handle deal
    if (note.deal?.name) {
      try {
        const dealRes = await pdFetch(tokens, `/deals/search?term=${encodeURIComponent(note.deal.name)}`)
        
        if (dealRes.ok) {
          const data = await dealRes.json()
          const deals = data.data?.items || []
          
          if (deals.length > 0 && deals[0].item?.type === 'deal') {
            results.deal = {
              id: deals[0].item.id.toString(),
              url: `https://app.pipedrive.com/deal/${deals[0].item.id}`,
              action: 'found',
            }
          }
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'unknown error'
        results.errors.push(`Deal search error: ${errMsg}`)
      }
    }

    return results
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'unknown error'
    results.errors.push(`Push failed: ${errMsg}`)
    return results
  }
}
