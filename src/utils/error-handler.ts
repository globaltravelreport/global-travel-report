import { NextRequest } from 'next/server';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Error context interface
interface ErrorContext {
  context?: string;
  requestId?: string;
  userId?: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: number;
  email?: string;
  frequency?: string;
  additionalData?: Record<string, any>;
}

// Error log entry
interface ErrorLogEntry {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: number;
  resolved: boolean;
}

// In-memory error store (in production, use a proper logging service)
const errorStore: ErrorLogEntry[] = [];
const MAX_STORED_ERRORS = 1000;

/**
 * Generate a unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine error severity based on error type and context
 */
function determineErrorSeverity(error: any, context: ErrorContext): ErrorSeverity {
  // Critical errors
  if (error.name === 'DatabaseConnectionError' || 
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('Database') ||
      context.context?.includes('payment') ||
      context.context?.includes('auth')) {
    return ErrorSeverity.CRITICAL;
  }

  // High severity errors
  if (error.name === 'ValidationError' ||
      error.status >= 500 ||
      error.message?.includes('timeout') ||
      error.message?.includes('network')) {
    return ErrorSeverity.HIGH;
  }

  // Medium severity errors
  if (error.status >= 400 ||
      error.name === 'NotFoundError' ||
      error.message?.includes('permission')) {
    return ErrorSeverity.MEDIUM;
  }

  // Default to low severity
  return ErrorSeverity.LOW;
}

/**
 * Log error to console with formatting
 */
function logToConsole(entry: ErrorLogEntry): void {
  const { id, message, stack, severity, context, timestamp } = entry;
  const date = new Date(timestamp).toISOString();
  
  const logMessage = [
    `[${date}] [${severity.toUpperCase()}] [${id}]`,
    `Message: ${message}`,
    context.context && `Context: ${context.context}`,
    context.requestId && `Request ID: ${context.requestId}`,
    context.method && context.url && `${context.method} ${context.url}`,
    context.ip && `IP: ${context.ip}`,
    context.userAgent && `User Agent: ${context.userAgent}`,
    context.additionalData && `Additional Data: ${JSON.stringify(context.additionalData)}`,
    stack && `Stack: ${stack}`,
  ].filter(Boolean).join('\n');

  switch (severity) {
    case ErrorSeverity.CRITICAL:
      console.error('🚨 CRITICAL ERROR:', logMessage);
      break;
    case ErrorSeverity.HIGH:
      console.error('❌ HIGH SEVERITY ERROR:', logMessage);
      break;
    case ErrorSeverity.MEDIUM:
      console.warn('⚠️ MEDIUM SEVERITY ERROR:', logMessage);
      break;
    case ErrorSeverity.LOW:
    default:
      console.log('ℹ️ LOW SEVERITY ERROR:', logMessage);
      break;
  }
}

/**
 * Store error in memory (with size limit)
 */
function storeError(entry: ErrorLogEntry): void {
  errorStore.push(entry);
  
  // Remove oldest errors if we exceed the limit
  if (errorStore.length > MAX_STORED_ERRORS) {
    errorStore.splice(0, errorStore.length - MAX_STORED_ERRORS);
  }
}

/**
 * Main error logging function
 */
export function logError(
  error: any,
  context: ErrorContext = {},
  severity?: ErrorSeverity
): string {
  const errorId = generateErrorId();
  const timestamp = Date.now();
  
  // Extract error information
  const message = error?.message || error?.toString() || 'Unknown error';
  const stack = error?.stack;
  
  // Determine severity if not provided
  const finalSeverity = severity || determineErrorSeverity(error, context);
  
  // Create error log entry
  const entry: ErrorLogEntry = {
    id: errorId,
    message,
    stack,
    severity: finalSeverity,
    context: {
      ...context,
      timestamp,
    },
    timestamp,
    resolved: false,
  };

  // Log to console
  logToConsole(entry);
  
  // Store in memory
  storeError(entry);
  
  // In production, you would also send to external logging service
  // sendToExternalLoggingService(entry);
  
  return errorId;
}

/**
 * Log error from Next.js request context
 */
export function logRequestError(
  error: any,
  req: NextRequest,
  additionalContext: Partial<ErrorContext> = {},
  severity?: ErrorSeverity
): string {
  const context: ErrorContext = {
    method: req.method,
    url: req.url,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    ...additionalContext,
  };
  
  return logError(error, context, severity);
}

/**
 * Get stored errors (for admin/debugging purposes)
 */
export function getStoredErrors(limit: number = 100): ErrorLogEntry[] {
  return errorStore.slice(-limit).reverse(); // Return most recent first
}

/**
 * Get errors by severity
 */
export function getErrorsBySeverity(severity: ErrorSeverity, limit: number = 100): ErrorLogEntry[] {
  return errorStore
    .filter(entry => entry.severity === severity)
    .slice(-limit)
    .reverse();
}

/**
 * Mark error as resolved
 */
export function markErrorAsResolved(errorId: string): boolean {
  const error = errorStore.find(entry => entry.id === errorId);
  if (error) {
    error.resolved = true;
    return true;
  }
  return false;
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  resolved: number;
  unresolved: number;
} {
  const stats = {
    total: errorStore.length,
    bySeverity: {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    },
    resolved: 0,
    unresolved: 0,
  };
  
  errorStore.forEach(entry => {
    stats.bySeverity[entry.severity]++;
    if (entry.resolved) {
      stats.resolved++;
    } else {
      stats.unresolved++;
    }
  });
  
  return stats;
}

/**
 * Clear old errors (cleanup function)
 */
export function clearOldErrors(olderThanMs: number = 7 * 24 * 60 * 60 * 1000): number { // Default: 7 days
  const cutoffTime = Date.now() - olderThanMs;
  const initialLength = errorStore.length;
  
  // Remove errors older than cutoff time
  for (let i = errorStore.length - 1; i >= 0; i--) {
    if (errorStore[i].timestamp < cutoffTime) {
      errorStore.splice(i, 1);
    }
  }
  
  return initialLength - errorStore.length; // Return number of errors removed
}

// Additional exports for compatibility
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context?: ErrorContext;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: ErrorContext
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.context = context;
  }
}

export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  EXTERNAL_API = 'external_api',
  DATABASE = 'database',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

export function handleError(error: any, context?: ErrorContext): string {
  return logError(error, context);
}