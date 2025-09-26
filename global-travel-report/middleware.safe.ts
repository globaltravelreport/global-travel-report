import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { performanceHeadersMiddleware } from './middleware/performanceHeaders';
import { csrfMiddleware } from './src/middleware/csrf';
import { errorMonitoringMiddleware } from './middleware/errorMonitoring';

// Global flag to disable middleware in case of emergency
const DISABLE_MIDDLEWARE = process.env.DISABLE_MIDDLEWARE === 'true';

// Safety timeout for middleware execution (5 seconds)
const MIDDLEWARE_TIMEOUT = 5000;

/**
 * Execute a function with a timeout
 * @param fn Function to execute
 * @param timeout Timeout in milliseconds
 * @returns Promise that resolves with the function result or rejects with a timeout error
 */
async function executeWithTimeout<T>(fn: () => Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Middleware timeout')), timeout);
    }),
  ]);
}

/**
 * Safe middleware execution with fallback
 * @param request Next.js request
 * @param middlewareFn Middleware function to execute
 * @returns Next.js response
 */
async function safeMiddleware(
  request: NextRequest,
  middlewareFn: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // If middleware is disabled, skip it
    if (DISABLE_MIDDLEWARE) {
      console.warn('Middleware is disabled by environment variable');
      return NextResponse.next();
    }

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
export async function middleware(request: NextRequest) {
  return safeMiddleware(request, async (req) => {
    try {
      // Apply performance headers middleware (includes basic security headers)
      const response = performanceHeadersMiddleware(req);
      
      // Apply CSRF middleware for POST, PUT, DELETE requests
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        const csrfResult = await csrfMiddleware(req);
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
      const monitoringResponse = await errorMonitoring(req);
      
      // If the monitoring middleware returned an error response, return it
      if (monitoringResponse.status !== 200) {
        return monitoringResponse;
      }
      
      // Check if the request is for the admin area
      if (req.nextUrl.pathname.startsWith('/admin')) {
        // Get the authorization header
        const authHeader = req.headers.get('authorization');
        
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
  });
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
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'GlobalTravelReport2024';

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
