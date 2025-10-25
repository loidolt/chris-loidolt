// Service Worker for Map Tile Caching
// This caches OpenTopoMap tiles aggressively for better performance

const CACHE_NAME = 'map-tiles-v7'; // Added cache size management
const TILE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const MAX_CONCURRENT_REQUESTS = 6; // Reduced to prevent overwhelming servers
const REQUEST_TIMEOUT = 15000; // 15 second timeout (increased for reliability)
const HIGH_ZOOM_THRESHOLD = 13; // OpenTopoMap reliable coverage ends at zoom 13
const OSM_THRESHOLD = 13; // OSM fallback starts at zoom 13 (overlap for better coverage)
const MAX_CACHE_ENTRIES = 1000; // Maximum number of tiles to cache (prevent unlimited growth)
const CACHE_CLEANUP_THRESHOLD = 900; // Start cleanup when this many tiles are cached

// Match tile URLs from both OpenTopoMap and OpenStreetMap
const TILE_URL_PATTERN = /^https:\/\/[abc]\.tile\.(opentopomap|openstreetmap)\.org\/\d+\/\d+\/\d+\.png$/;

// Request queue management
let activeRequests = 0;
const requestQueue = [];

// Request deduplication - track in-flight requests
const pendingRequests = new Map();

// Cache cleanup - LRU (Least Recently Used) implementation
async function cleanupCache(cache) {
  const keys = await cache.keys();
  const cacheSize = keys.length;

  if (cacheSize > CACHE_CLEANUP_THRESHOLD) {
    console.log('[Map SW] Cache cleanup triggered. Current size:', cacheSize);

    // Get all cache entries with their metadata
    const entries = await Promise.all(
      keys.map(async (request) => {
        const response = await cache.match(request);
        const date = response ? new Date(response.headers.get('date') || 0) : new Date(0);
        return { request, date: date.getTime() };
      })
    );

    // Sort by date (oldest first)
    entries.sort((a, b) => a.date - b.date);

    // Delete oldest entries to get below threshold
    const toDelete = cacheSize - CACHE_CLEANUP_THRESHOLD;
    for (let i = 0; i < toDelete; i++) {
      await cache.delete(entries[i].request);
    }

    console.log('[Map SW] Cache cleanup complete. Deleted', toDelete, 'entries. New size:', CACHE_CLEANUP_THRESHOLD);
  }
}

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

// Extract zoom level from tile URL
function getZoomLevel(url) {
  const match = url.match(/\/(\d+)\/\d+\/\d+\.png$/);
  return match ? parseInt(match[1], 10) : 0;
}

// Get dynamic timeout based on zoom level and tile source
function getTimeout(zoomLevel, url) {
  const isOSM = url.includes('openstreetmap.org');

  // OSM tiles are faster and more reliable at high zoom
  if (isOSM) {
    return REQUEST_TIMEOUT * 0.7; // 10.5 seconds for OSM (fast and reliable)
  }

  // OpenTopoMap at zoom 13+ may be slower or missing
  if (zoomLevel >= HIGH_ZOOM_THRESHOLD) {
    return REQUEST_TIMEOUT * 1.5; // 22.5 seconds for OpenTopoMap high zoom (spotty coverage)
  }

  return REQUEST_TIMEOUT; // 15 seconds for normal zoom
}

// Get dynamic concurrency limit based on zoom level
function getConcurrencyLimit(zoomLevel) {
  // Keep concurrency consistent since we're using two tile sources
  return MAX_CONCURRENT_REQUESTS;
}

// Throttled fetch with timeout
async function throttledFetch(request, cache, zoomLevel) {
  const concurrencyLimit = getConcurrencyLimit(zoomLevel);

  // Wait if too many active requests
  if (activeRequests >= concurrencyLimit) {
    await new Promise(resolve => {
      requestQueue.push(resolve);
    });
  }

  activeRequests++;

  try {
    // Add timeout to fetch (dynamic based on zoom and tile source)
    const controller = new AbortController();
    const timeout = getTimeout(zoomLevel, request.url);
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    // Only cache valid successful responses
    if (response && response.ok && response.status === 200) {
      // Verify the response has content before caching
      const responseClone = response.clone();
      const buffer = await responseClone.arrayBuffer();

      // Only cache if response is large enough to be a valid tile
      // Valid tiles are typically 200+ bytes minimum
      if (buffer.byteLength > 80) {
        const responseToCache = response.clone();
        await cache.put(request, responseToCache);

        // Periodically cleanup cache (1% chance on each cache write)
        if (Math.random() < 0.01) {
          cleanupCache(cache).catch(err => console.error('[Map SW] Cleanup error:', err));
        }
      } else {
        console.warn('[Map SW] Skipping cache of invalid tile (too small):', buffer.byteLength, 'bytes', request.url);
      }
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
    (async () => {
      // Check for existing pending request for this URL
      if (pendingRequests.has(url)) {
        // Return the existing promise to deduplicate requests
        return pendingRequests.get(url);
      }

      // Extract zoom level for dynamic handling
      const zoomLevel = getZoomLevel(url);

      // Create new request promise
      const requestPromise = caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);

        // Check if cached response exists and is still fresh
        if (cachedResponse) {
          const cachedDate = new Date(cachedResponse.headers.get('date') || 0);
          const now = new Date();

          // If cache is still fresh, use it immediately
          if (now - cachedDate < TILE_CACHE_MAX_AGE) {
            // Verify cached response is valid (not empty or error)
            const cachedClone = cachedResponse.clone();
            const buffer = await cachedClone.arrayBuffer();
            if (buffer.byteLength > 80) { // Valid tiles are larger than 80 bytes
              return cachedResponse;
            } else {
              // Invalid cache, delete it
              console.warn('[Map SW] Deleting invalid cached tile:', buffer.byteLength, 'bytes');
              await cache.delete(event.request);
            }
          }
        }

        // Fetch from network with throttling (pass zoom level for dynamic handling)
        try {
          const response = await throttledFetch(event.request, cache, zoomLevel);

          // Verify response is valid before returning
          if (response.ok && response.status === 200) {
            // Clone and check size
            const responseClone = response.clone();
            const buffer = await responseClone.arrayBuffer();

            if (buffer.byteLength > 80) {
              return response;
            } else {
              console.warn('[Map SW] Response too small, likely invalid:', buffer.byteLength, 'bytes at zoom', zoomLevel);
              throw new Error('Invalid tile size');
            }
          } else {
            console.warn('[Map SW] Non-200 response:', response.status, 'zoom:', zoomLevel, url);
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (error) {
          console.error('[Map SW] Fetch failed at zoom', zoomLevel, ':', url, error.name);

          // For high zoom tiles, provide more context
          if (zoomLevel >= HIGH_ZOOM_THRESHOLD) {
            console.warn('[Map SW] High zoom tile failure - this is expected for areas with incomplete coverage');
          }

          // If we have a stale but valid cache, use it as fallback
          if (cachedResponse) {
            const cachedClone = cachedResponse.clone();
            const buffer = await cachedClone.arrayBuffer();
            if (buffer.byteLength > 80) {
              console.log('[Map SW] Using stale cache as fallback for zoom', zoomLevel, ':', url);
              return cachedResponse;
            }
          }

          // Return a light gray 256x256 tile instead of transparent
          // This makes it obvious when tiles fail to load
          return new Response(
            new Uint8Array([
              0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
              0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
              0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
              0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
              0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41,
              0x54, 0x78, 0x9c, 0x63, 0xc0, 0xc0, 0xc0, 0x00,
              0x00, 0x00, 0x04, 0x00, 0x01, 0xf8, 0x69, 0xd1,
              0xbc, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
              0x44, 0xae, 0x42, 0x60, 0x82
            ]),
            {
              headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-store' // Don't cache error tiles
              }
            }
          );
        }
      }).finally(() => {
        // Remove from pending requests when complete
        pendingRequests.delete(url);
      });

      // Store in pending requests map
      pendingRequests.set(url, requestPromise);

      return requestPromise;
    })()
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
