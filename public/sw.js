// Service Worker for NEXORA PWA
// Provides offline caching, image cache management, asset pre-fetching, and instant standalone loading
const CACHE_NAME = 'nexora-shell-v2';
const IMAGE_CACHE_NAME = 'nexora-images-v2';
const MAX_IMAGE_ENTRIES = 120;

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png'
];

// Helper to limit cache size
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      trimCache(cacheName, maxItems);
    }
  } catch (err) {
    console.warn('Trim cache error:', err);
  }
}

// Install: precache critical app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-cache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up outdated caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== IMAGE_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy dispatcher
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // CRITICAL: NEVER intercept Firebase Auth, token fetching, Firestore channels, or Google APIs!
  // Bypassing the Service Worker ensures native browser network requests with credentials and CORS succeed.
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('identitytoolkit') ||
    url.hostname.includes('securetoken') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  // 1. Navigation requests (HTML SPA router)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const indexCached = await caches.match('/index.html');
          if (indexCached) return indexCached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response(
            '<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>NEXORA Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#0f131c;color:#fff;font-family:sans-serif;text-align:center;padding:60px 20px"><h2>NEXORA Modo Offline</h2><p>Estás sem ligação à internet. A aplicação continua a funcionar com os dados em cache.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 2. High-performance Image Caching
  const isImage =
    event.request.destination === 'image' ||
    /\.(png|jpe?g|webp|svg|gif|avif)($|\?)/i.test(url.pathname) ||
    url.hostname.includes('images.unsplash.com') ||
    url.hostname.includes('api.dicebear.com') ||
    url.hostname.includes('lh3.googleusercontent.com') ||
    url.hostname.includes('storage.googleapis.com');

  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          // Serve from cache immediately; update in background
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
                trimCache(IMAGE_CACHE_NAME, MAX_IMAGE_ENTRIES);
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        // Cache miss: fetch from network
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            cache.put(event.request, networkResponse.clone());
            trimCache(IMAGE_CACHE_NAME, MAX_IMAGE_ENTRIES);
          }
          return networkResponse;
        } catch {
          // If offline and request fails, try generic fallback if available
          return caches.match(event.request);
        }
      })
    );
    return;
  }

  // 3. Static Assets (Scripts, Styles, Fonts, Icons)
  if (
    url.origin === self.location.origin ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }

  // Non-origin requests pass through directly to native browser networking
  if (url.origin !== self.location.origin) {
    return;
  }

  // Same-origin default network pass-through
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Listen for messages from client (skip waiting, clear image cache)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_IMAGE_CACHE') {
    caches.delete(IMAGE_CACHE_NAME);
  }
});
