// ================================================================
//  HDD Manager — Service Worker
//  Enables offline support, caching, and app-like experience
// ================================================================

const CACHE_NAME    = 'hdd-manager-v1';
const OFFLINE_URL   = '/index.html';

// Files to cache for offline use
const CACHE_FILES = [
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ── INSTALL: cache core files ─────────────────────────────
self.addEventListener('install', function(event) {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    }).then(function() {
      console.log('[SW] Core files cached.');
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: clean old caches ───────────────────────────
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key)   { return caches.delete(key); })
      );
    }).then(function() {
      console.log('[SW] Old caches cleared.');
      return self.clients.claim();
    })
  );
});

// ── FETCH: Network first, fallback to cache ───────────────
self.addEventListener('fetch', function(event) {
  // Skip non-GET and Firebase requests (always need network)
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('firestore.googleapis.com')) return;
  if (event.request.url.includes('firebase')) return;
  if (event.request.url.includes('googleapis.com')) return;
  if (event.request.url.includes('gstatic.com')) return;
  if (event.request.url.includes('fonts.')) return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Cache successful responses
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        // Offline fallback
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match(OFFLINE_URL);
        });
      })
  );
});

// ── PUSH NOTIFICATIONS (future use) ──────────────────────
self.addEventListener('push', function(event) {
  if (!event.data) return;
  var data = event.data.json();
  self.registration.showNotification(data.title || 'HDD Manager', {
    body   : data.body || 'You have a new update.',
    icon   : '/icons/icon-192.png',
    badge  : '/icons/icon-72.png',
    vibrate: [200, 100, 200]
  });
});
