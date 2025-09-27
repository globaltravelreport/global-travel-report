// Service Worker for Global Travel Report
// Provides caching, offline functionality, and performance optimization

const CACHE_NAME = 'global-travel-report-v1';
const STATIC_CACHE_NAME = 'global-travel-report-static-v1';
const DYNAMIC_CACHE_NAME = 'global-travel-report-dynamic-v1';
const IMAGE_CACHE = 'gtr-images-v1';
const MAX_ENTRIES = 100;
const IMAGE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/images/logo.png',
  '/images/fallback.jpg',
  '/og/home-1200x630.jpg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (different origin)
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    // Static assets - Cache First strategy
    event.respondWith(cacheFirst(request));
  } else if (isImageRequest(request)) {
    // Images - Cache First with fallback
    event.respondWith(imageStrategy(request));
  } else if (isAPIRequest(request)) {
    // API requests - Network First
    event.respondWith(networkFirst(request));
  } else {
    // HTML pages - Network First with cache fallback
    event.respondWith(networkFirstWithCacheFallback(request));
  }
});

// Cache First strategy for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First strategy for dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline', { status: 503 });
  }
}

// Network First with Cache Fallback for HTML pages
async function networkFirstWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache fallback:', error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page or main page
    return caches.match('/') || new Response('Offline', { status: 503 });
  }
}

// Image strategy with LRU/TTL and fallback
async function imageStrategy(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      // Check TTL
      const dateHeader = cachedResponse.headers.get('sw-cache-date');
      if (dateHeader && Date.now() - Number(dateHeader) > IMAGE_TTL) {
        await cache.delete(request);
      } else {
        return cachedResponse;
      }
    }
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Clone and add custom header for TTL
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cache-date', Date.now().toString());
      const responseToCache = new Response(await networkResponse.clone().blob(), { status: networkResponse.status, statusText: networkResponse.statusText, headers });
      await cache.put(request, responseToCache);
      // LRU: trim cache
      const keys = await cache.keys();
      if (keys.length > MAX_ENTRIES) {
        await cache.delete(keys[0]);
      }
      return networkResponse;
    }
    // On error, try fallback
    const fallback = await cache.match('/images/fallback.jpg');
    return fallback || new Response('Image not available', { status: 503 });
  } catch (error) {
    const cache = await caches.open(IMAGE_CACHE);
    const fallback = await cache.match('/images/fallback.jpg');
    return fallback || new Response('Image not available', { status: 503 });
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.includes('/images/') ||
         url.pathname.includes('/icons/');
}

function isImageRequest(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions like form submissions
  console.log('Service Worker: Performing background sync');
}

// Push notifications (for future features)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/images/logo.png',
      badge: '/images/logo.png',
      vibrate: [200, 100, 200],
      data: data.url,
      actions: [
        {
          action: 'open',
          title: 'View Story',
          icon: '/images/logo.png'
        },
        {
          action: 'close',
          title: 'Dismiss'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Listen for Web Vitals messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'WEB_VITAL') {
    // Optionally adapt caching/preloading based on metrics
    // e.g., log or store metrics for analysis
    // console.log('SW received Web Vitals:', event.data.payload);
  }
});

console.log('Service Worker: Script loaded successfully');