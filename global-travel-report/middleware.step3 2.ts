import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { performanceHeadersMiddleware } from './middleware/performanceHeaders';
import { csrfMiddleware } from './src/middleware/csrf';
import { errorMonitoringMiddleware } from './middleware/errorMonitoring';

// Step 3: Add back error monitoring middleware
export async function middleware(request: NextRequest) {
  try {
    // Apply performance headers middleware (includes basic security headers)
    const response = performanceHeadersMiddleware(request);

    // Apply CSRF middleware for POST, PUT, DELETE requests
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
      const csrfResult = await csrfMiddleware(request);
      if (csrfResult) {
        return csrfResult;
      }
    }

    // Create an instance of the error monitoring middleware
    const errorMonitoring = errorMonitoringMiddleware({
      excludePaths: ['/api/health', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml'],
      logPerformance: true,
      performanceThreshold: 1000, // 1 second
      enableAlerts: process.env.NODE_ENV === 'production',
      alertThreshold: 10
    });

    // Apply error monitoring middleware
    const monitoringResponse = await errorMonitoring(request);

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
