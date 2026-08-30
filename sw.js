const CACHE_NAME = 'mk313-cache-v2';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/css/styles.css',
  '/js/main.js',
  '/images/logo/logo.jpg',
  '/manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        fetch(request).then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
