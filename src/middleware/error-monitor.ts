// Error Monitoring Middleware
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { logError } from '../utils/error-handler';

export async function errorMonitorMiddleware(request: Request, next: () => Promise<Response>) {
  const requestId = uuidv4();
  const start = Date.now();
  try {
    const response = await next();
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
    return response;
  } catch (error: any) {
    logError({
      requestId,
      url: request.url,
      method: request.method,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    // Optionally send to external monitoring
    return NextResponse.json({ error: 'Internal Server Error', requestId }, { status: 500 });
  }
}
