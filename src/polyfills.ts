/**
 * Polyfills for server-side rendering
 * This file should be imported early in the application to ensure
 * browser globals are available during SSR
 */

// Polyfill for 'self' global
if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

// Polyfill for 'window' global
if (typeof globalThis !== 'undefined' && typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis as any;
}

// Polyfill for 'document' global
if (typeof globalThis !== 'undefined' && typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElement: () => ({}),
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
  } as any;
}

// Polyfill for 'navigator' global
if (typeof globalThis !== 'undefined' && typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = {
    userAgent: 'Node.js',
    platform: 'Node.js',
    language: 'en-US',
    languages: ['en-US'],
  } as any;
}

// Polyfill for 'location' global
if (typeof globalThis !== 'undefined' && typeof globalThis.location === 'undefined') {
  globalThis.location = {
    href: '',
    origin: '',
    protocol: 'https:',
    host: '',
    hostname: '',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
  } as any;
}

export {};
