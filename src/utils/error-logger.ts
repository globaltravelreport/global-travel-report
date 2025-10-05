/**
 * Simple Error Logging System
 *
 * This module provides utilities for logging errors without relying on
 * third-party services that might cause stability issues.
 */

// Storage key for error logs
const ERROR_LOGS_STORAGE_KEY = 'gtr_error_logs';

// Maximum number of error logs to store
const MAX_ERROR_LOGS = 50;

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Error log interface
export interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  severity: ErrorSeverity;
  timestamp: string;
  url: string;
  userAgent: string;
  additionalInfo?: Record<string, any>;
}

/**
 * Generate a unique ID for an error log
 *
 * @returns A unique ID
 */
function generateErrorId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Store an error log in local storage
 *
 * @param errorLog - The error log to store
 */
function storeErrorLog(errorLog: ErrorLog): void {
  if (typeof window === 'undefined') return;

  try {
    // Get existing error logs from local storage
    const storedLogs = localStorage.getItem(ERROR_LOGS_STORAGE_KEY);
    const logs = storedLogs ? JSON.parse(storedLogs) : [];

    // Add the new error log
    logs.push(errorLog);

    // Keep only the last MAX_ERROR_LOGS logs to avoid excessive storage usage
    const trimmedLogs = logs.slice(-MAX_ERROR_LOGS);

    // Store the logs back in local storage
    localStorage.setItem(ERROR_LOGS_STORAGE_KEY, JSON.stringify(trimmedLogs));

    // Log the error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error logged: ${errorLog.message} (${errorLog.severity})`);
    }
  } catch (_error) {
    console.error(_error);
  }
}

/**
 * Log an error
 *
 * @param error - The error to log
 * @param severity - The severity of the error
 * @param additionalInfo - Additional information about the error
 */
export function logError(
  error: Error | string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  additionalInfo?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  const errorLog: ErrorLog = {
    id: generateErrorId(),
    message: errorMessage,
    stack: errorStack,
    severity,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: window.navigator.userAgent,
    additionalInfo,
  };

  storeErrorLog(errorLog);
}

/**
 * Log an error with component stack trace (for React errors)
 *
 * @param error - The error to log
 * @param componentStack - The component stack trace
 * @param severity - The severity of the error
 * @param additionalInfo - Additional information about the error
 */
export function logReactError(
  error: Error | string,
  componentStack: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  additionalInfo?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  const errorLog: ErrorLog = {
    id: generateErrorId(),
    message: errorMessage,
    stack: errorStack,
    componentStack,
    severity,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: window.navigator.userAgent,
    additionalInfo,
  };

  storeErrorLog(errorLog);
}

/**
 * Get all stored error logs
 *
 * @returns An array of stored error logs
 */
export function getStoredErrorLogs(): ErrorLog[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedLogs = localStorage.getItem(ERROR_LOGS_STORAGE_KEY);
    return storedLogs ? JSON.parse(storedLogs) : [];
  } catch (_error) {
    console.error(_error);
    return [];
  }
}

/**
 * Clear all stored error logs
 */
export function clearStoredErrorLogs(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(ERROR_LOGS_STORAGE_KEY);
  } catch (_error) {
    console.error(_error);
  }
}

/**
 * Global error handler for uncaught exceptions
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window === 'undefined') return;

  const originalOnError = window.onerror;

  window.onerror = (message, source, lineno, colno, error) => {
    // Log the error
    logError(
      error || String(message),
      ErrorSeverity.ERROR,
      { source, lineno, colno }
    );

    // Call the original handler if it exists
    if (originalOnError) {
      return originalOnError(message, source, lineno, colno, error);
    }

    // Return false to allow the default browser error handling
    return false;
  };

  const originalUnhandledRejection = window.onunhandledrejection;

  window.onunhandledrejection = (event) => {
    // Log the unhandled promise rejection
    const errorMessage = event.reason instanceof Error ? event.reason.message : String(event.reason);

    logError(
      errorMessage,
      ErrorSeverity.ERROR,
      { type: 'unhandledrejection' }
    );

    // Call the original handler if it exists
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(window, event);
    }
  };
}
