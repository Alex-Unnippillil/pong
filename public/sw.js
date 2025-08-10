const CACHE_VERSION = 'v1'
const CACHE_NAME = `photonpong-cache-${CACHE_VERSION}`
const PRECACHE_URLS = ['/']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request)
        .then((response) => {
          if (response.status === 200 && response.type === 'basic') {
            const respClone = response.clone()
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, respClone))
          }
          return response
        })
        .catch(() => caches.match('/'))
    }),
  )
})
