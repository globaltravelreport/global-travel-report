// Global Rate Limiter Middleware - Currently not in use
// The rate limiting is handled by the applyRateLimit function in rate-limit.ts
// This file can be removed or updated if needed for future use

/*
import { NextResponse } from 'next/server';
import { applyRateLimit } from './rate-limit';

const endpointLimits = {
  '/api/admin/login': { windowMs: 15 * 60 * 1000, max: 5 },
  '/api/contact': { windowMs: 60 * 60 * 1000, max: 5 },
  '/api/cron/dailyStories': { windowMs: 10 * 60 * 1000, max: 2 },
  // ...add more endpoint configs
};

export async function globalRateLimiterMiddleware(request: Request) {
  const url = new URL(request.url);
  const endpoint = Object.keys(endpointLimits).find(e => url.pathname.startsWith(e));
  const config = endpoint ? endpointLimits[endpoint] : { windowMs: 60 * 1000, max: 30 };
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const key = `${endpoint || url.pathname}:${ip}`;
  const { allowed, remaining, reset } = await rateLimit(key, config);
  const response = allowed ? NextResponse.next() : NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  response.headers.set('X-RateLimit-Limit', String(config.max));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(reset));
  return response;
}
*/
