// Security Headers Middleware
import { NextResponse } from 'next/server';
import { buildCSP } from '../utils/csp-builder';

export function securityHeadersMiddleware(request: Request) {
  const nonce = Math.random().toString(36).substring(2, 18);
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const csp = buildCSP({ nonce, env });
  const response = NextResponse.next();
  response.headers.set(csp.key, csp.value);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Request-ID', nonce);
  // Add more headers as needed
  return response;
}
