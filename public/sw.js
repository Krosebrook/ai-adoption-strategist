// AI Adoption Strategist - Service Worker
// Version: 1.0.0

const CACHE_NAME = 'ai-strategist-v1';
const API_CACHE_NAME = 'ai-strategist-api-v1';
const CACHE_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes for API responses

// Critical assets to precache for offline functionality
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Assets to cache on demand
const RUNTIME_CACHE_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.ico$/
];

// API endpoints to cache with short expiration
const API_CACHE_PATTERNS = [
  /\/api\//,
  /base44\.com\/api\//
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching critical assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Precaching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old caches that don't match current version
              return name !== CACHE_NAME && name !== API_CACHE_NAME;
            })
            .map((name) => {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        // Claim all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request type
  if (isAPIRequest(url)) {
    // Network-first strategy for API requests
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME));
  } else if (isStaticAsset(url)) {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
  } else {
    // Network-first with cache fallback for HTML pages
    event.respondWith(networkFirstStrategy(request, CACHE_NAME));
  }
});

// Network-first strategy: Try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      
      // Add timestamp for cache expiration
      const headers = new Headers(responseToCache.headers);
      headers.append('sw-cached-at', Date.now().toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      // Properly await cache operation to avoid race conditions
      try {
        const cache = await caches.open(cacheName);
        await cache.put(request, modifiedResponse);
      } catch (cacheError) {
        console.warn('[Service Worker] Failed to cache response:', cacheError);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Check if API cache is expired
      if (cacheName === API_CACHE_NAME) {
        const cachedAt = cachedResponse.headers.get('sw-cached-at');
        if (cachedAt && Date.now() - parseInt(cachedAt) > CACHE_EXPIRATION_TIME) {
          console.log('[Service Worker] API cache expired:', request.url);
          return new Response(JSON.stringify({ error: 'Network unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      return cachedResponse;
    }
    
    // No cache available, return error response
    return new Response(JSON.stringify({ error: 'Network unavailable and no cache available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache-first strategy: Try cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful responses for static assets
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      
      // Properly await cache operation to avoid race conditions
      try {
        const cache = await caches.open(cacheName);
        await cache.put(request, responseToCache);
      } catch (cacheError) {
        console.warn('[Service Worker] Failed to cache response:', cacheError);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed for:', request.url, error);
    
    // Return offline page or error response
    return new Response('Network error', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Helper: Check if request is an API call
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

// Helper: Check if request is a static asset
function isStaticAsset(url) {
  return RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Message handler for manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      }).then(() => {
        console.log('[Service Worker] All caches cleared');
      })
    );
  }
});
