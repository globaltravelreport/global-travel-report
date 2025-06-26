/* eslint-env node */
/* eslint-disable no-undef */
// Global polyfills for server-side rendering
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = globalThis;
  }
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = {};
  }
  if (typeof globalThis.navigator === 'undefined') {
    globalThis.navigator = {};
  }
}
