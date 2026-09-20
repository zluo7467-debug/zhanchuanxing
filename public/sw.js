const CACHE_NAME = 'zhanchuanxing-v3'
const APP_SHELL = ['./', './index.html', './manifest.webmanifest', './app-icon.svg']
const scope = new URL(self.registration.scope)

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('zhanchuanxing-') && key !== CACHE_NAME).map(key => caches.delete(key)),
  )).then(() => self.clients.claim()))
})

self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return
  // Do not cache partial audio responses: range requests need a dedicated download/offline design.
  if (request.headers.has('range') || url.pathname.endsWith('.wav')) return
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    try {
      const response = await fetch(request)
      if (response.ok && response.status === 200) event.waitUntil(cache.put(request, response.clone()).catch(() => {}))
      return response
    } catch {
      const cached = await cache.match(request)
      if (cached) return cached
      if (request.mode === 'navigate') {
        const shell = await cache.match(new URL('./index.html', scope).href)
        if (shell) return shell
      }
      return Response.error()
    }
  })())
})
