// Server-side polyfills for browser globals
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

// Export self for webpack ProvidePlugin
module.exports = {
  self: globalThis
};
