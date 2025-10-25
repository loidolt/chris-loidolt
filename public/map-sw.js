// Service Worker for Map Tile Caching
// This caches OpenTopoMap tiles aggressively for better performance

const CACHE_NAME = 'map-tiles-v1';
const TILE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MAX_CONCURRENT_REQUESTS = 12; // Increased from 6 for faster high-zoom loading
const REQUEST_TIMEOUT = 8000; // 8 second timeout (reduced from 10s)

// Match OpenTopoMap tile URLs
const TILE_URL_PATTERN = /^https:\/\/[abc]\.tile\.opentopomap\.org\/\d+\/\d+\/\d+\.png$/;

// Request queue management
let activeRequests = 0;
const requestQueue = [];

self.addEventListener('install', (event) => {
  console.log('[Map SW] Installing service worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Map SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Clean up old caches
          if (cacheName !== CACHE_NAME && cacheName.startsWith('map-tiles-')) {
            console.log('[Map SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Throttled fetch with timeout
async function throttledFetch(request, cache) {
  // Wait if too many active requests
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    await new Promise(resolve => {
      requestQueue.push(resolve);
    });
  }

  activeRequests++;

  try {
    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    // Cache successful responses
    if (response && response.status === 200) {
      const responseToCache = response.clone();
      cache.put(request, responseToCache);
    }

    return response;
  } finally {
    activeRequests--;
    // Process next queued request
    if (requestQueue.length > 0) {
      const resolve = requestQueue.shift();
      resolve();
    }
  }
}

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Only handle tile requests
  if (!TILE_URL_PATTERN.test(url)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);

      // Check if cached response exists and is still fresh
      if (cachedResponse) {
        const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
        const now = new Date();

        // If cache is still fresh, use it immediately
        if (now - cachedDate < TILE_CACHE_MAX_AGE) {
          return cachedResponse;
        }
      }

      // Fetch from network with throttling
      try {
        return await throttledFetch(event.request, cache);
      } catch (error) {
        console.error('[Map SW] Fetch failed:', url, error.name);
        // If we have a stale cache, use it as fallback
        if (cachedResponse) {
          console.log('[Map SW] Using stale cache as fallback:', url);
          return cachedResponse;
        }
        // Return a transparent 1x1 PNG instead of throwing
        return new Response(
          new Uint8Array([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
            0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
            0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
            0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
            0x42, 0x60, 0x82
          ]),
          { headers: { 'Content-Type': 'image/png' } }
        );
      }
    })
  );
});

// Handle tile prefetch messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PREFETCH_TILES') {
    const { tiles } = event.data;
    console.log('[Map SW] Prefetching', tiles.length, 'tiles...');

    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return Promise.all(
          tiles.map((tileUrl) => {
            return cache.match(tileUrl).then((cachedResponse) => {
              if (!cachedResponse) {
                return fetch(tileUrl).then((response) => {
                  if (response && response.status === 200) {
                    return cache.put(tileUrl, response);
                  }
                }).catch((error) => {
                  console.error('[Map SW] Prefetch failed for:', tileUrl, error);
                });
              }
            });
          })
        );
      })
    );
  }
});
