#!/usr/bin/env node

/**
 * Service Worker Generator
 *
 * This script generates a service worker for offline support:
 * 1. Precaches critical assets
 * 2. Implements a cache-first strategy for static assets
 * 3. Implements a network-first strategy for API requests
 * 4. Provides offline fallback pages
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

// Configuration
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SW_PATH = path.join(PUBLIC_DIR, 'sw.js');
const SW_REGISTER_PATH = path.join(PUBLIC_DIR, 'sw-register.js');
const CACHE_VERSION = new Date().toISOString().split('T')[0].replace(/-/g, '');
const CACHE_NAME = `global-travel-report-v${CACHE_VERSION}`;

// Assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/logo-gtr.png',
  '/favicon.ico',
  '/manifest.json',
  '/css/main.css',
  '/js/main.js'
];

// Generate the service worker content
async function generateServiceWorker() {
  // Find all static assets to cache
  const staticAssets = await findStaticAssets();

  // Create the service worker content
  const swContent = `
/**
 * Global Travel Report Service Worker
 * Generated on: ${new Date().toISOString()}
 * Cache version: ${CACHE_VERSION}
 */

// Cache names
const PRECACHE = '${CACHE_NAME}-precache';
const RUNTIME = '${CACHE_NAME}-runtime';
const IMAGE_CACHE = '${CACHE_NAME}-images';
const API_CACHE = '${CACHE_NAME}-api';

// Assets to precache
const PRECACHE_ASSETS = ${JSON.stringify(PRECACHE_ASSETS, null, 2)};

// Additional static assets to cache on first use
const CACHEABLE_STATIC_ASSETS = ${JSON.stringify(staticAssets, null, 2)};

// Install event - precache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME, IMAGE_CACHE, API_CACHE];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => {
        // Keep caches that start with our cache name but aren't in our current caches
        return cacheName.startsWith('global-travel-report-') &&
               !currentCaches.includes(cacheName);
      });
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // URL object for easier parsing
  const url = new URL(event.request.url);

  // Handle API requests (network-first strategy)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Handle image requests (cache-first with timeout)
  if (
    url.pathname.match(/\\.(jpg|jpeg|png|gif|webp|svg)$/) ||
    url.pathname.includes('/images/') ||
    url.pathname.includes('/img/')
  ) {
    event.respondWith(cacheFirstWithTimeout(event.request));
    return;
  }

  // Handle static assets (cache-first strategy)
  if (
    CACHEABLE_STATIC_ASSETS.includes(url.pathname) ||
    url.pathname.match(/\\.(css|js|woff2|json)$/) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Handle navigation requests (network-first with offline fallback)
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(event.request));
    return;
  }

  // Default strategy (network-first)
  event.respondWith(networkFirst(event.request));
});

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    return caches.match('/offline');
  }
}

// Cache-first with timeout strategy
async function cacheFirstWithTimeout(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // If not in cache, try network with timeout
  try {
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), 3000);
    });

    // Race between network and timeout
    const response = await Promise.race([networkPromise, timeoutPromise]);

    // Cache the response if valid
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return placeholder image or offline fallback
    return caches.match('/images/placeholder.jpg') || new Response('Image not available', { status: 408 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback if available
    return caches.match('/offline');
  }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return empty JSON for API requests
    return new Response(JSON.stringify({ error: 'Offline', message: 'You are currently offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Network-first with offline fallback for navigation
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache valid responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match('/offline');
  }
}
  `;

  // Create the service worker registration script
  const swRegisterContent = `
/**
 * Service Worker Registration
 * Generated on: ${new Date().toISOString()}
 */

// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(function(error) {
        console.error('Service Worker registration failed:', error);
      });
  });
}
  `;

  // Write the files
  await fs.writeFile(SW_PATH, swContent);
  await fs.writeFile(SW_REGISTER_PATH, swRegisterContent);

  console.log(`Service worker generated at: ${SW_PATH}`);
  console.log(`Service worker registration script generated at: ${SW_REGISTER_PATH}`);
}

// Find static assets to cache
async function findStaticAssets() {
  try {
    const { globby } = await import('globby');
    const files = await globby(['**/*.{css,js,woff2,json}'], { cwd: PUBLIC_DIR });

    // Convert to paths relative to the public directory
    const assets = files.map(file => `/${file}`);
    return assets;
  } catch (error) {
    console.error('Error finding static assets:', error);
    return [];
  }
}

// Create an offline fallback page
async function createOfflinePage() {
  const offlinePagePath = path.join(PUBLIC_DIR, 'offline.html');
  const offlinePageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline | Global Travel Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #0070f3;
      margin-top: 40px;
    }
    p {
      font-size: 18px;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    .card {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background: #0070f3;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      text-decoration: none;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <img src="/logo-gtr.png" alt="Global Travel Report" class="logo">
  <h1>You're Offline</h1>
  <p>It looks like you've lost your internet connection. Don't worry, you can still access some previously visited content.</p>

  <div class="card">
    <h2>What you can do:</h2>
    <p>Check your internet connection and try again.</p>
    <a href="/" class="button">Try Again</a>
  </div>

  <div class="card">
    <h2>Recently Visited</h2>
    <p>Your recently visited pages may still be available offline.</p>
    <div id="recent-pages">
      <p>No recent pages available.</p>
    </div>
  </div>

  <script>
    // Try to display recently visited pages
    if ('caches' in window) {
      caches.open('${CACHE_NAME}-runtime').then(cache => {
        cache.keys().then(requests => {
          const navigationRequests = requests.filter(request =>
            request.mode === 'navigate' ||
            (request.headers.get('Accept') && request.headers.get('Accept').includes('text/html'))
          );

          if (navigationRequests.length > 0) {
            const recentPagesEl = document.getElementById('recent-pages');
            recentPagesEl.innerHTML = '<ul>' +
              navigationRequests.slice(0, 5).map(request => {
                const url = new URL(request.url);
                const path = url.pathname;
                const title = path === '/' ? 'Home' : path.split('/').pop().replace(/-/g, ' ');
                return '<li><a href="' + path + '">' + title + '</a></li>';
              }).join('') +
            '</ul>';
          }
        });
      });
    }
  </script>
</body>
</html>
  `;

  await fs.writeFile(offlinePagePath, offlinePageContent);
  console.log(`Offline page generated at: ${offlinePagePath}`);
}

// Create a placeholder image
async function createPlaceholderImage() {
  const placeholderDir = path.join(PUBLIC_DIR, 'images');
  const placeholderPath = path.join(placeholderDir, 'placeholder.jpg');

  // Ensure the directory exists
  await fs.mkdir(placeholderDir, { recursive: true });

  // Check if the placeholder image already exists
  try {
    await fs.access(placeholderPath);
    console.log(`Placeholder image already exists at: ${placeholderPath}`);
  } catch (error) {
    // Create a simple placeholder image (1x1 pixel transparent GIF)
    const transparentGif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    await fs.writeFile(placeholderPath, transparentGif);
    console.log(`Placeholder image generated at: ${placeholderPath}`);
  }
}

// Main function
async function main() {
  try {
    // Create the offline page
    await createOfflinePage();

    // Create the placeholder image
    await createPlaceholderImage();

    // Generate the service worker
    await generateServiceWorker();

    console.log('Service worker generation completed successfully!');
  } catch (error) {
    console.error('Error generating service worker:', error);
  }
}

// Run the script
main();
