import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization');
  
  // Check if the authorization header is valid
  if (!isValidAuthHeader(authHeader)) {
    return NextResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }
  
  // If the authorization header is valid, return success
  return NextResponse.json(
    { success: true, message: 'Authentication successful' },
    { status: 200 }
  );
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
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'GlobalTravelReport2024';
  
  return username === validUsername && password === validPassword;
}
