import { NextResponse } from 'next/server';

/**
 * Health check API endpoint
 * This endpoint returns basic health information about the application
 * It can be used by monitoring tools to check if the site is up
 */
export async function GET() {
  try {
    // Get basic system information
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const nodeVersion = process.version;
    const environment = process.env.NODE_ENV || 'development';
    
    // Return health information
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      },
      environment: environment,
      nodeVersion: nodeVersion,
    }, { status: 200 });
  } catch (_error) {
    console.error(_error);
    
    // Return error response
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
    }, { status: 500 });
  }
}
