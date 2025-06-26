/**
 * Error Monitoring Middleware
 * 
 * This middleware captures and logs errors that occur during request processing.
 * It also provides performance monitoring and can send alerts for critical errors.
 */

import { NextRequest, NextResponse } from 'next/server';
import { error, warn, info } from '@/utils/errorLogger';
import { v4 as uuidv4 } from 'uuid';

// Define middleware options
export interface ErrorMonitoringOptions {
  excludePaths?: string[];
  logPerformance?: boolean;
  performanceThreshold?: number; // in milliseconds
  enableAlerts?: boolean;
  alertThreshold?: number; // number of errors before alerting
}

// Default options
const DEFAULT_OPTIONS: ErrorMonitoringOptions = {
  excludePaths: ['/api/health', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml'],
  logPerformance: true,
  performanceThreshold: 1000, // 1 second
  enableAlerts: false,
  alertThreshold: 10
};

// Error counter for alerting
let errorCount = 0;
let lastAlertTime = Date.now();
const ALERT_RESET_INTERVAL = 60 * 60 * 1000; // 1 hour

/**
 * Reset error count if the alert interval has passed
 */
function checkAndResetErrorCount() {
  const now = Date.now();
  if (now - lastAlertTime > ALERT_RESET_INTERVAL) {
    errorCount = 0;
    lastAlertTime = now;
  }
}

/**
 * Send an alert for critical errors
 * @param message Alert message
 * @param context Additional context
 */
async function sendAlert(message: string, context: Record<string, any>) {
  // This is a placeholder for a real alerting system
  // In a production environment, this would send an alert to a monitoring service
  
  // For now, just log the alert
  error(`ALERT: ${message}`, context);
  
  // In a real implementation, you would send an alert to a monitoring service
  // Example:
  // await fetch('https://alerts.example.com/api/alert', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message, context })
  // });
}

/**
 * Check if a path should be excluded from monitoring
 * @param path The request path
 * @param excludePaths Array of paths to exclude
 * @returns True if the path should be excluded
 */
function shouldExcludePath(path: string, excludePaths: string[] = []): boolean {
  return excludePaths.some(excludePath => {
    // Check for exact match
    if (excludePath === path) return true;
    
    // Check for prefix match
    if (excludePath.endsWith('*') && path.startsWith(excludePath.slice(0, -1))) return true;
    
    // Check for suffix match
    if (excludePath.startsWith('*') && path.endsWith(excludePath.slice(1))) return true;
    
    return false;
  });
}

/**
 * Error monitoring middleware
 * @param options Middleware options
 * @returns Middleware function
 */
export function errorMonitoringMiddleware(options: ErrorMonitoringOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return async function middleware(request: NextRequest) {
    // Skip excluded paths
    if (shouldExcludePath(request.nextUrl.pathname, opts.excludePaths)) {
      return NextResponse.next();
    }
    
    // Generate a unique request ID
    const requestId = uuidv4();
    
    // Start timer for performance monitoring
    const startTime = Date.now();
    
    try {
      // Add request ID to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-request-id', requestId);
      
      // Create the response
      const response = NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
      
      // Add request ID to response headers
      response.headers.set('x-request-id', requestId);
      
      // Log performance if enabled
      if (opts.logPerformance) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Log slow requests
        if (duration > (opts.performanceThreshold || 1000)) {
          warn(`Slow request: ${request.method} ${request.nextUrl.pathname}`, {
            requestId,
            duration,
            method: request.method,
            url: request.nextUrl.toString(),
            userAgent: request.headers.get('user-agent') || 'unknown'
          });
        } else {
          info(`Request completed: ${request.method} ${request.nextUrl.pathname}`, {
            requestId,
            duration,
            method: request.method,
            url: request.nextUrl.toString()
          });
        }
      }
      
      return response;
    } catch (err) {
      // Log the error
      error(`Error processing request: ${request.method} ${request.nextUrl.pathname}`, {
        requestId,
        method: request.method,
        url: request.nextUrl.toString(),
        userAgent: request.headers.get('user-agent') || 'unknown',
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      }, err);
      
      // Increment error count for alerting
      errorCount++;
      
      // Check if we should send an alert
      if (opts.enableAlerts && errorCount >= (opts.alertThreshold || 10)) {
        checkAndResetErrorCount();
        
        // Send alert if threshold is reached
        if (errorCount >= (opts.alertThreshold || 10)) {
          await sendAlert(`Error threshold reached: ${errorCount} errors in the last hour`, {
            threshold: opts.alertThreshold,
            errorCount
          });
          
          // Reset error count after sending alert
          errorCount = 0;
        }
      }
      
      // Create an error response
      const errorResponse = NextResponse.json(
        { error: 'Internal Server Error', requestId },
        { status: 500 }
      );
      
      // Add request ID to response headers
      errorResponse.headers.set('x-request-id', requestId);
      
      return errorResponse;
    }
  };
}

export default errorMonitoringMiddleware;
