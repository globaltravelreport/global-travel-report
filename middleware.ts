import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
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
  return NextResponse.next();
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
  // For now, we'll use hardcoded values (not ideal for production)
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'GlobalTravelReport2024';
  
  return username === validUsername && password === validPassword;
}

// Configure the middleware to run only on admin routes
export const config = {
  matcher: '/admin/:path*',
};
