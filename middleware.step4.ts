import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { performanceHeadersMiddleware } from './middleware/performanceHeaders';
import { csrfMiddleware } from './src/middleware/csrf';
import { errorMonitoringMiddleware } from './middleware/errorMonitoring';

// Step 4: Add back admin authentication
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
    
    // Continue with the request
    return response;
  } catch (err) {
    console.error('Middleware error:', err);
    
    // Return a generic error response
    return NextResponse.next();
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
