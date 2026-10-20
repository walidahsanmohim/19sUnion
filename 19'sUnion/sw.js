/* 19's Union — minimal offline service worker (PWA-lite) */
/* Bump the version whenever a cached asset changes, otherwise returning
 * visitors keep serving the STALE copy from the old cache.
 * v3 removed the client-side member passwords from js/main.js. */
const CACHE_NAME = 'union-site-v3';

const PRECACHE_URLS = ['./', './Index.html', './css/tailwind.css', './css/styles.css', './js/sw-register.js', './js/chart-theme.js', './js/clipboard.js', './js/main.js', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept the live Apps Script API — account data must stay fresh.
  if (url.origin === 'https://script.google.com' || url.hostname.indexOf('script.googleusercontent.com') !== -1) {
    return;
  }

  // Same-origin requests
  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      // HTML navigations: network-first with an offline fallback to the shell.
      event.respondWith(
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('./Index.html', copy));
            return response;
          })
          .catch(() => caches.match('./Index.html').then((r) => r || caches.match('./')))
      );
      return;
    }
    // Static assets: cache-first, refresh in the background.
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchUpdated = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchUpdated;
      })
    );
    return;
  }

  // Cross-origin (CDNs, fonts, Drive images): stale-while-revalidate, best effort.
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchUpdated = fetch(request)
        .then((response) => {
          if (response && (response.ok || response.type === 'opaque')) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchUpdated;
    })
  );
});