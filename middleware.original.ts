import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { errorMonitoringMiddleware } from './middleware/errorMonitoring';
import { performanceHeadersMiddleware } from './middleware/performanceHeaders';
import { csrfMiddleware } from './src/middleware/csrf';
import { applyCSP } from './src/middleware/csp';
import { error } from './src/utils/errorLogger';

// Create an instance of the error monitoring middleware
const errorMonitoring = errorMonitoringMiddleware({
  excludePaths: ['/api/health', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml'],
  logPerformance: true,
  performanceThreshold: 1000, // 1 second
  enableAlerts: process.env.NODE_ENV === 'production',
  alertThreshold: 10
});

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    // Apply error monitoring middleware
    const monitoringResponse = await errorMonitoring(request);

    // If the monitoring middleware returned a response, return it
    if (monitoringResponse.status !== 200) {
      return monitoringResponse;
    }

    // Apply CSRF protection middleware for mutating requests
    const csrfResponse = await csrfMiddleware(request);
    if (csrfResponse) {
      return csrfResponse;
    }

    // Check if the request is for the admin area
    if (request.nextUrl.pathname.startsWith('/admin')) {
      // Get the authorization header
      const authHeader = request.headers.get('authorization');

      // Check if the authorization header is valid
      if (!isValidAuthHeader(authHeader)) {
        // If not, return a 401 response with a WWW-Authenticate header
        return new NextResponse('Authentication required', {
          status: 401,
          headers: {
            'WWW-Authenticate': 'Basic realm="Global Travel Report Admin"',
          },
        });
      }
    }

    // Apply performance headers middleware (includes basic security headers)
    let response = performanceHeadersMiddleware(request);

    // Apply enhanced Content Security Policy with nonce support
    response = applyCSP(request, response);

    // Add HSTS header for HTTPS enforcement
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=63072000; includeSubDomains; preload'
      );
    }

    // Continue with the request
    return response;
  } catch (err) {
    // Log the error
    error('Unhandled error in middleware', {
      url: request.nextUrl.toString(),
      method: request.method
    }, err);

    // Return a generic error response
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Check if the authorization header is valid
 * @param authHeader - The authorization header
 * @returns True if the header is valid, false otherwise
 */
function isValidAuthHeader(authHeader: string | null): boolean {
  if (!authHeader) {
    return false;
  }

  // Check if the header starts with "Basic "
  if (!authHeader.startsWith('Basic ')) {
    return false;
  }

  // Get the base64-encoded credentials
  const base64Credentials = authHeader.split(' ')[1];

  // Decode the credentials
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

  // Split the credentials into username and password
  const [username, password] = credentials.split(':');

  // Check if the username and password are valid
  // In a real application, you would check against a database or environment variables
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  return username === validUsername && password === validPassword;
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
