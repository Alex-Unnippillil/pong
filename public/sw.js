const CACHE_VERSION = 'v2'
const CACHE_NAME = `photonpong-cache-${CACHE_VERSION}`
const ASSETS = [
  '/',
  '/favicon.ico',
  '/icon.svg',
  '/locales/en.json',
  '/locales/es.json',
  '/_next/static/chunks/main-app.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/app/play/page.js',
  '/_next/static/chunks/app/match/%5Bid%5D/page.js',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch(() => undefined),
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
