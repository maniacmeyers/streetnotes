// Pass-through service worker.
//
// The previous version cached HTML navigations, which broke deploys: cached
// HTML referenced build-hashed assets that Vercel purges on each deploy, so
// returning users would get a stale shell pointing at 404'd assets. Safari
// in particular would render that as "could not load".
//
// This version registers a SW (so PWA install-to-home-screen still works)
// but does no caching. On activation it deletes every cache from prior
// versions, which auto-heals users who were stuck on the old broken SW.
const CACHE_VERSION = 'v3-2026-05-04-passthrough'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', () => {
  // intentionally empty — let the browser handle all requests directly
})
