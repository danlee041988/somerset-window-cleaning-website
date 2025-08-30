// Somerset Window Cleaning Service Worker
// Version 1.0 - Caching and Performance Optimization

const CACHE_NAME = 'somerset-window-cleaning-v1.1';
const STATIC_CACHE_NAME = 'static-v1.1';
const DYNAMIC_CACHE_NAME = 'dynamic-v1.1';

// Resources to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/services/',
  '/booking-2step/',
  '/about/',
  '/contact/',
  '/areas/',
  '/terms/',
  
  // Critical CSS and JS
  '/assets/styles/tailwind.css',
  
  // Optimized images
  '/images/services/optimized/',
  '/src/assets/images/optimized/',
  
  // Fallback page
  '/404.html'
];

// Routes that should be cached dynamically
const DYNAMIC_ROUTES = [
  '/services/',
  '/areas/',
  '/booking'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Filter out any non-HTTPS resources in development
        const httpsAssets = STATIC_ASSETS.filter(asset => {
          try {
            const url = new URL(asset, self.location.origin);
            return url.protocol === 'https:' || url.protocol === 'http:' && url.hostname === 'localhost';
          } catch {
            return true; // Relative URLs are fine
          }
        });
        return cache.addAll(httpsAssets);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTPS requests in production (except localhost)
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip WebSocket connections (for HMR in development)
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }
  
  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request));
  } else if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(handleAssetRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  try {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Image request failed:', error);
    // Return placeholder image
    return new Response(
      '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image not available</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Handle page requests with network-first strategy for fresh content
async function handlePageRequest(request) {
  try {
    // Try network first for pages to get fresh content
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', error);
    
    // Fall back to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/404.html');
    return offlineResponse || new Response(
      '<html><body><h1>Offline</h1><p>This page is not available offline. Please check your connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Handle CSS/JS assets with cache-first strategy
async function handleAssetRequest(request) {
  try {
    // Check cache first for assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Asset request failed:', error);
    return new Response('/* Asset not available */', {
      headers: { 'Content-Type': 'text/css' }
    });
  }
}

// Handle generic requests
async function handleGenericRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Not available', { status: 404 });
  }
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending offline form submissions
  // This would be implemented based on specific requirements
  console.log('[SW] Performing background sync...');
}

// Push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Window cleaning service update',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Somerset Window Cleaning', options)
  );
});

// Clean up old caches periodically - only in secure contexts
if (self.isSecureContext) {
  setInterval(() => {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        // Remove caches older than 7 days
        if (cacheName.includes('dynamic') && Math.random() < 0.1) {
          caches.open(cacheName).then((cache) => {
            cache.keys().then((requests) => {
              const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
              requests.forEach((request) => {
                cache.match(request).then((response) => {
                  const dateHeader = response?.headers.get('date');
                  if (dateHeader && new Date(dateHeader).getTime() < oneWeekAgo) {
                    cache.delete(request);
                  }
                });
              });
            });
          });
        }
      });
    });
  }, 60000); // Check every minute
}