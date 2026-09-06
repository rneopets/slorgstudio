// Minimal service worker for Slorg Studio: network-first with cache fallback, so the app loads
// fast on repeat visits and still opens offline. It deliberately does not precache - the app
// shell is small and asset URLs are content-hashed, so caching on demand keeps this simple with
// no stale-cache bookkeeping (old hashed assets are simply never requested again).

const CACHE = "slorg-studio-v1"
// Matches the PR preview base path in .github/workflows/pr-preview.yml.
const PR_PREVIEW = /\/pr-preview\//

self.addEventListener("install", () => {
  // Nothing to precache; activate immediately so the first visit benefits right away.
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await self.caches.keys()
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => self.caches.delete(name)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Never intercept PR previews: they're ephemeral and must always reflect the latest build.
  if (PR_PREVIEW.test(url.pathname)) return

  event.respondWith(
    (async () => {
      const cache = await self.caches.open(CACHE)
      try {
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      } catch {
        const cached = await cache.match(request)
        if (cached) return cached
        throw new Error("Offline: resource not cached")
      }
    })(),
  )
})