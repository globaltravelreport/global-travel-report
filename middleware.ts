import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { errorMonitoringMiddleware } from './middleware/errorMonitoring';

// Global flag to disable middleware in case of emergency
const DISABLE_MIDDLEWARE = process.env.DISABLE_MIDDLEWARE === 'true';

// Safety timeout for middleware execution (5 seconds)
const MIDDLEWARE_TIMEOUT = 5000;

/**
 * Execute a function with a timeout
 * @param fn - The function to execute
 * @param timeout - The timeout in milliseconds
 * @returns Promise resolving to the function result
 */
async function executeWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    // Set a timeout to reject the promise
    const timeoutId = setTimeout(() => {
      reject(new Error(`Middleware execution timed out after ${timeout}ms`));
    }, timeout);

    try {
      // Execute the function
      const result = await fn();

      // Clear the timeout
      clearTimeout(timeoutId);

      // Resolve with the result
      resolve(result);
    } catch (err) {
      // Clear the timeout
      clearTimeout(timeoutId);

      // Reject with the error
      reject(err);
    }
  });
}

/**
 * Safe middleware wrapper that handles errors and timeouts
 * @param request - The Next.js request object
 * @param middlewareFn - The middleware function to execute
 * @returns Promise resolving to the Next.js response object
 */
async function safeMiddleware(
  request: NextRequest,
  middlewareFn: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // If middleware is disabled, return a basic response
  if (DISABLE_MIDDLEWARE) {
    console.log('Middleware is disabled, using fallback');
    return NextResponse.next();
  }

  try {
    // Execute middleware with timeout
    return await executeWithTimeout(() => middlewareFn(request), MIDDLEWARE_TIMEOUT);
  } catch (err) {
    console.error('Middleware failed, using fallback:', err);

    // Log the error to a monitoring service if available
    try {
      // This would be your error logging service
      // await logError('Middleware failure', err, { url: request.url });
    } catch (logErr) {
      // Ignore logging errors
    }

    // Return a basic response that allows the site to function
    return NextResponse.next();
  }
}

// Main middleware function
export function middleware(request: NextRequest) {
  return safeMiddleware(request, async (req) => {
    try {
      // Create the response
      const response = NextResponse.next();

      // Add basic security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'SAMEORIGIN');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Create an instance of the error monitoring middleware
      const errorMonitoring = errorMonitoringMiddleware({
        excludePaths: ['/api/health', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml'],
        logPerformance: true,
        performanceThreshold: 1000, // 1 second
        enableAlerts: process.env.NODE_ENV === 'production',
        alertThreshold: 10
      });

      // Apply error monitoring middleware
      const monitoringResponse = await errorMonitoring(req);

      // If the monitoring middleware returned an error response, return it
      if (monitoringResponse.status !== 200) {
        return monitoringResponse;
      }

      // Continue with the request
      return response;
    } catch (err) {
      console.error('Middleware error:', err);

      // Return a generic error response
      return NextResponse.next();
    }
  });
}

// Configure the middleware to run on all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
