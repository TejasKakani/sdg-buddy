// SDG Buddy service worker.
// - Precaches a small offline fallback shell on install.
// - GET navigations: network-first, falling back to the cached shell offline.
// - Other GETs (static assets): stale-while-revalidate.
// Bump CACHE_VERSION whenever the precached assets change to evict old caches.

const CACHE_VERSION = 'v1';
const CACHE_NAME = `sdg-buddy-${CACHE_VERSION}`;
const OFFLINE_URL = '/';

const PRECACHE_URLS = [
  '/',
  '/logo.png',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests; let the browser handle the rest
  // (POST/PUT API calls, cross-origin requests, etc.).
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  // Don't cache API responses — they're user-specific and dynamic.
  if (new URL(request.url).pathname.startsWith('/api/')) {
    return;
  }

  // Navigations: network-first with an offline fallback to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match(request)) || (await cache.match(OFFLINE_URL));
      })
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
