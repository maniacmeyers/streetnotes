import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StreetNotes.ai',
    short_name: 'StreetNotes',
    description:
      'Voice-to-CRM for sales reps. Talk for 60 seconds, review, push to your CRM.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#061222',
    theme_color: '#061222',
    categories: ['business', 'productivity', 'sales'],
    icons: [
      {
        src: '/streetnotes_logo.png',
        sizes: '1194x287',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
  }
}
