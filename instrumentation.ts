/**
 * Next.js Instrumentation File
 * 
 * This file is used to set up instrumentation for the Next.js app.
 * It's automatically loaded by Next.js during the build process.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    // Some third-party libraries expect `self` to exist (browser global).
    // Define it on the server to prevent "ReferenceError: self is not defined".
    if (!(globalThis as any).self) {
      (globalThis as any).self = globalThis;
    }
  }

  if (typeof window !== 'undefined') {
    // Client-side instrumentation
    const { setupGlobalErrorHandler } = await import('./src/utils/error-logger');
    setupGlobalErrorHandler();
  }
}

export default register;
