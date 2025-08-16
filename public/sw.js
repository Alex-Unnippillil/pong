const CACHE_NAME = 'photonpong-cache-v1'
const ASSETS = ['/', '/favicon.ico']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const fetchPromise = fetch(event.request).then((networkResponse) =>
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(event.request, networkResponse.clone())
      return networkResponse
    }),
  )

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetchPromise),
  )

  event.waitUntil(fetchPromise)
})
