#!/usr/bin/env node

/**
 * Caching Strategy Setup Script
 * 
 * This script:
 * 1. Creates middleware for caching headers
 * 2. Sets up service worker for offline support
 * 3. Configures next.config.js for optimal caching
 * 
 * Usage:
 * node scripts/setup-caching.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  middlewarePath: './middleware.ts',
  serviceWorkerPath: './public/sw.js',
  nextConfigPath: './next.config.js'
};

// Create caching middleware
function createCachingMiddleware() {
  console.log('Creating caching middleware...');
  
  if (fs.existsSync(config.middlewarePath)) {
    console.log('Middleware already exists. Checking if caching is configured...');
    
    const middlewareContent = fs.readFileSync(config.middlewarePath, 'utf8');
    
    if (middlewareContent.includes('Cache-Control')) {
      console.log('Caching headers already configured in middleware.');
      return;
    }
    
    console.log('Adding caching headers to existing middleware...');
    
    // Find the NextResponse.next() call
    const nextResponseRegex = /return NextResponse\.next\(\)/;
    if (nextResponseRegex.test(middlewareContent)) {
      const updatedMiddleware = middlewareContent.replace(
        nextResponseRegex,
        `const response = NextResponse.next();
  
  // Add caching headers
  const cacheControl = [];
  
  // HTML pages: no cache for dynamic content
  if (request.nextUrl.pathname.endsWith('.html') || !request.nextUrl.pathname.includes('.')) {
    cacheControl.push('public');
    cacheControl.push('max-age=0');
    cacheControl.push('must-revalidate');
  }
  // Static assets: cache for 1 year
  else if (/\\.(js|css|woff2|jpg|jpeg|png|gif|ico|svg)$/.test(request.nextUrl.pathname)) {
    cacheControl.push('public');
    cacheControl.push('max-age=31536000');
    cacheControl.push('immutable');
  }
  // API routes: short cache
  else if (request.nextUrl.pathname.startsWith('/api/')) {
    cacheControl.push('public');
    cacheControl.push('max-age=60');
    cacheControl.push('stale-while-revalidate=30');
  }
  
  if (cacheControl.length > 0) {
    response.headers.set('Cache-Control', cacheControl.join(', '));
  }
  
  return response`
      );
      
      fs.writeFileSync(config.middlewarePath, updatedMiddleware);
      console.log('Updated middleware with caching headers.');
    } else {
      console.log('Could not find NextResponse.next() in middleware. Please add caching headers manually.');
    }
  } else {
    console.log('Creating new middleware with caching headers...');
    
    const middlewareContent = `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for handling caching and security headers
 */
export function middleware(request: NextRequest) {
  // Add caching headers
  const response = NextResponse.next();
  
  // Set caching strategy based on content type
  const cacheControl = [];
  
  // HTML pages: no cache for dynamic content
  if (request.nextUrl.pathname.endsWith('.html') || !request.nextUrl.pathname.includes('.')) {
    cacheControl.push('public');
    cacheControl.push('max-age=0');
    cacheControl.push('must-revalidate');
  }
  // Static assets: cache for 1 year
  else if (/\\.(js|css|woff2|jpg|jpeg|png|gif|ico|svg)$/.test(request.nextUrl.pathname)) {
    cacheControl.push('public');
    cacheControl.push('max-age=31536000');
    cacheControl.push('immutable');
  }
  // API routes: short cache
  else if (request.nextUrl.pathname.startsWith('/api/')) {
    cacheControl.push('public');
    cacheControl.push('max-age=60');
    cacheControl.push('stale-while-revalidate=30');
  }
  
  if (cacheControl.length > 0) {
    response.headers.set('Cache-Control', cacheControl.join(', '));
  }
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

// Only apply middleware to relevant paths
export const config = {
  matcher: [
    // Apply to all paths except static files in _next/static
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
`;
    
    fs.writeFileSync(config.middlewarePath, middlewareContent);
    console.log('Created middleware with caching headers.');
  }
}

// Create service worker for offline support
function createServiceWorker() {
  console.log('Creating service worker for offline support...');
  
  if (fs.existsSync(config.serviceWorkerPath)) {
    console.log('Service worker already exists.');
    return;
  }
  
  const serviceWorkerContent = `/**
 * Service Worker for Global Travel Report
 * Provides offline support and caching
 */

const CACHE_NAME = 'global-travel-report-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/styles/globals.css',
  '/images/logo.png',
  '/images/fallback.jpg'
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and browser extensions
  if (
    event.request.method !== 'GET' ||
    event.request.url.startsWith('chrome-extension') ||
    event.request.url.includes('extension') ||
    // Skip analytics
    event.request.url.includes('google-analytics') ||
    event.request.url.includes('googletagmanager')
  ) {
    return;
  }

  // HTML navigation - network-first strategy
  if (
    event.request.mode === 'navigate' ||
    (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))
  ) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If offline, serve the offline page or cached home page
          return caches.match('/offline') || caches.match('/');
        })
    );
    return;
  }

  // Images - cache-first strategy
  if (event.request.url.match(/\\.(jpg|jpeg|png|gif|svg|webp)$/)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache the fetched response
            const clonedResponse = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
            return fetchResponse;
          })
          .catch(() => {
            // If offline and image not cached, return fallback image
            if (event.request.url.match(/\\.(jpg|jpeg|png|gif|webp)$/)) {
              return caches.match('/images/fallback.jpg');
            }
            return null;
          });
      })
    );
    return;
  }

  // Other assets - stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response immediately
      if (cachedResponse) {
        // Fetch new version in background
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((response) => {
        // Cache the response for future
        const clonedResponse = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clonedResponse);
        });
        return response;
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`;
  
  fs.writeFileSync(config.serviceWorkerPath, serviceWorkerContent);
  console.log('Created service worker.');
  
  // Create offline page
  const offlinePagePath = './app/offline/page.tsx';
  const offlinePageDir = path.dirname(offlinePagePath);
  
  if (!fs.existsSync(offlinePageDir)) {
    fs.mkdirSync(offlinePageDir, { recursive: true });
  }
  
  if (!fs.existsSync(offlinePagePath)) {
    const offlinePageContent = `import React from 'react';

export const metadata = {
  title: 'Offline - Global Travel Report',
  description: 'You are currently offline.',
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">You're Offline</h1>
      <p className="mb-6">
        It looks like you're currently offline. Please check your internet connection and try again.
      </p>
      <p className="mb-8">
        Some content may be available from cache.
      </p>
      <button
        onClick={() => window.location.href = '/'}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
`;
    
    fs.writeFileSync(offlinePagePath, offlinePageContent);
    console.log('Created offline page.');
  }
  
  // Create service worker registration script
  const swRegistrationPath = './app/sw-register.js';
  
  if (!fs.existsSync(swRegistrationPath)) {
    const swRegistrationContent = `/**
 * Service Worker Registration
 */

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(
      function(registration) {
        console.log('Service Worker registration successful with scope: ', registration.scope);
      },
      function(err) {
        console.log('Service Worker registration failed: ', err);
      }
    );
  });
}
`;
    
    fs.writeFileSync(swRegistrationPath, swRegistrationContent);
    console.log('Created service worker registration script.');
  }
}

// Update next.config.js for caching
function updateNextConfig() {
  console.log('Updating Next.js configuration for caching...');
  
  if (!fs.existsSync(config.nextConfigPath)) {
    console.error('next.config.js not found. Please create it first.');
    return;
  }
  
  let configContent = fs.readFileSync(config.nextConfigPath, 'utf8');
  
  // Check if caching is already configured
  if (configContent.includes('generateEtags')) {
    console.log('Caching already configured in next.config.js');
    return;
  }
  
  // Add caching configuration
  const cachingConfig = `
  // Caching configuration
  generateEtags: true,
  compress: true,
  poweredByHeader: false,
  
  // Cache static assets
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://globaltravelreport.com' : '',
  
  // Configure headers
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|css|js|woff|woff2)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, stale-while-revalidate=30',
          },
        ],
      },
    ];
  },`;
  
  // Insert the configuration into the module.exports object
  const moduleExportsRegex = /module\.exports\s*=\s*{/;
  if (moduleExportsRegex.test(configContent)) {
    configContent = configContent.replace(
      moduleExportsRegex,
      `module.exports = {\n${cachingConfig}`
    );
    
    fs.writeFileSync(config.nextConfigPath, configContent);
    console.log('Updated next.config.js with caching configuration');
  } else {
    console.error('Could not find module.exports in next.config.js');
  }
}

// Create documentation
function createDocumentation() {
  console.log('Creating caching documentation...');
  
  const docsPath = './docs/CACHING_STRATEGY.md';
  const docsDir = path.dirname(docsPath);
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const docsContent = `# Caching Strategy

## Overview

This project implements a comprehensive caching strategy to improve performance and provide offline support.

## Caching Layers

### 1. Browser Caching

We use HTTP Cache-Control headers to control browser caching:

- **Static Assets** (JS, CSS, images, fonts): Cached for 1 year with \`immutable\` flag
- **API Responses**: Cached for 60 seconds with stale-while-revalidate for 30 seconds
- **HTML Pages**: No caching to ensure fresh content

### 2. Service Worker Caching

The service worker provides offline support and implements different caching strategies:

- **Navigation Requests**: Network-first with offline fallback
- **Images**: Cache-first with network fallback and offline image placeholder
- **Other Assets**: Stale-while-revalidate for optimal performance

### 3. CDN Caching

When deployed to Vercel, we benefit from their global CDN which provides:

- Edge caching
- Automatic asset optimization
- Global distribution

## Implementation Details

### Middleware

The \`middleware.ts\` file sets Cache-Control headers based on content type.

### Service Worker

The \`public/sw.js\` file implements the service worker caching strategies.

### Next.js Configuration

The \`next.config.js\` file includes additional caching configuration.

## Testing Caching

1. Open Chrome DevTools
2. Go to Network tab
3. Look for \`Cache-Control\` headers in the response
4. Check "Disable cache" to test without browser cache
5. Use Application > Service Worker to test offline functionality

## Maintenance

- Update the \`CACHE_NAME\` in the service worker when making significant changes
- The service worker will automatically clean up old caches
`;
  
  fs.writeFileSync(docsPath, docsContent);
  console.log(`Created documentation at ${docsPath}`);
}

// Main function
function main() {
  console.log('Setting up caching strategy...');
  
  try {
    createCachingMiddleware();
    createServiceWorker();
    updateNextConfig();
    createDocumentation();
    
    console.log('\nCaching strategy setup complete!');
    console.log('\nNext steps:');
    console.log('1. Import the service worker registration in your layout or main component');
    console.log('2. Test the caching with Chrome DevTools');
    console.log('3. Review the documentation at docs/CACHING_STRATEGY.md');
  } catch (error) {
    console.error('Error setting up caching strategy:', error);
  }
}

// Run the setup
main();
