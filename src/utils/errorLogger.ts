/**
 * Error Logger
 *
 * A centralized system for logging errors and warnings in the application.
 * This ensures consistent error handling and makes it easier to add
 * error reporting services in the future.
 */

import { EnhancedAppError, ErrorType, ErrorSeverity, handleError } from './enhanced-error-handler';

// Use ErrorSeverity from enhanced-error-handler for log levels
export type LogLevel = ErrorSeverity;
export const LogLevel = ErrorSeverity;

// Define log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | EnhancedAppError;
  stack?: string;
  errorId?: string;
  errorType?: ErrorType;
  errorCode?: string;
}

// In-memory log storage for recent logs
const recentLogs: LogEntry[] = [];
const MAX_RECENT_LOGS = 100;

// Control logging verbosity
let verboseLogging = process.env.NODE_ENV === 'development';
let logToConsole = true;

// Error reporting service configuration
let errorReportingEnabled = false;
let errorReportingEndpoint = '';

/**
 * Set the logging verbosity
 * @param verbose Whether to log verbose messages
 */
export function setVerboseLogging(verbose: boolean): void {
  verboseLogging = verbose;
}

/**
 * Set whether to log to console
 * @param enabled Whether to log to console
 */
export function setLogToConsole(enabled: boolean): void {
  logToConsole = enabled;
}

/**
 * Configure error reporting service
 * @param enabled Whether to enable error reporting
 * @param endpoint The endpoint to send errors to
 */
export function configureErrorReporting(enabled: boolean, endpoint?: string): void {
  errorReportingEnabled = enabled;
  if (endpoint) {
    errorReportingEndpoint = endpoint;
  }
}

/**
 * Format a log entry for display
 * @param entry The log entry to format
 * @returns Formatted log message
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context, error } = entry;
  let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  if (context && Object.keys(context).length > 0) {
    formattedMessage += `\nContext: ${JSON.stringify(context, null, 2)}`;
  }

  if (error) {
    formattedMessage += `\nError: ${error.message}`;
    if (error.stack) {
      formattedMessage += `\nStack: ${error.stack}`;
    }
  }

  return formattedMessage;
}

/**
 * Add a log entry to the recent logs
 * @param entry The log entry to add
 */
function addToRecentLogs(entry: LogEntry): void {
  recentLogs.unshift(entry);

  // Trim the log if it exceeds the maximum size
  if (recentLogs.length > MAX_RECENT_LOGS) {
    recentLogs.length = MAX_RECENT_LOGS;
  }
}

/**
 * Send an error to the error reporting service
 * @param entry The log entry to send
 */
async function sendToErrorReportingService(entry: LogEntry): Promise<void> {
  if (!errorReportingEnabled || !errorReportingEndpoint) {
    return;
  }

  try {
    // Only send errors, critical errors, and fatal errors to the reporting service
    if (
      entry.level !== LogLevel.ERROR &&
      entry.level !== LogLevel.CRITICAL &&
      entry.level !== LogLevel.FATAL
    ) {
      return;
    }

    // Prepare the error data with additional information
    const errorData = {
      ...entry,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      sessionId: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('sessionId') : null,
    };

    // Send the error to the reporting service
    const response = await fetch(errorReportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData),
      // Use keepalive to ensure the request completes even if the page is unloading
      keepalive: true
    });

    if (!response.ok) {
      console.error(`Failed to send error to reporting service: ${response.status} ${response.statusText}`);
    }
  } catch (_error) {
    // Don't use the logger here to avoid infinite recursion
    console.error(_error);
  }
}

/**
 * Log a message at the specified level
 * @param level The log level
 * @param message The message to log
 * @param context Additional context information
 * @param error Optional error object
 */
export function log(level: LogLevel, message: string, context?: Record<string, any>, error?: unknown): void {
  // Skip debug logs in production unless verbose logging is enabled
  if (level === LogLevel.DEBUG && !verboseLogging && process.env.NODE_ENV === 'production') {
    return;
  }

  // Convert error to EnhancedAppError if provided
  let enhancedError: EnhancedAppError | undefined;
  if (error) {
    enhancedError = handleError(error);
  }

  // Create the log entry
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: enhancedError,
    stack: enhancedError?.stack,
    errorId: enhancedError?.id,
    errorType: enhancedError?.type,
    errorCode: enhancedError?.code
  };

  // Add to recent logs
  addToRecentLogs(entry);

  // Log to console if enabled
  if (logToConsole) {
    const formattedMessage = formatLogEntry(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARNING:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
      case LogLevel.FATAL:
        console.error(formattedMessage);
        break;
    }
  }

  // Send to error reporting service if it's an error, critical, or fatal
  if (level === LogLevel.ERROR || level === LogLevel.CRITICAL || level === LogLevel.FATAL) {
    sendToErrorReportingService(entry);
  }
}

/**
 * Log a debug message
 * @param message The message to log
 * @param context Additional context information
 */
export function debug(message: string, context?: Record<string, any>): void {
  log(LogLevel.DEBUG, message, context);
}

/**
 * Log an info message
 * @param message The message to log
 * @param context Additional context information
 */
export function info(message: string, context?: Record<string, any>): void {
  log(LogLevel.INFO, message, context);
}

/**
 * Log a warning message
 * @param message The message to log
 * @param context Additional context information
 * @param error Optional error object
 */
export function warn(message: string, context?: Record<string, any>, error?: unknown): void {
  log(LogLevel.WARNING, message, context, error);
}

/**
 * Log an error message
 * @param message The message to log
 * @param context Additional context information
 * @param error Optional error object
 */
export function error(message: string, context?: Record<string, any>, error?: unknown): void {
  log(LogLevel.ERROR, message, context, error);
}

/**
 * Log a critical message
 * @param message The message to log
 * @param context Additional context information
 * @param error Optional error object
 */
export function critical(message: string, context?: Record<string, any>, error?: unknown): void {
  log(LogLevel.CRITICAL, message, context, error);
}

/**
 * Log a fatal message
 * @param message The message to log
 * @param context Additional context information
 * @param error Optional error object
 */
export function fatal(message: string, context?: Record<string, any>, error?: unknown): void {
  log(LogLevel.FATAL, message, context, error);
}

/**
 * Get recent logs
 * @param maxEntries Maximum number of entries to return
 * @param level Optional log level to filter by
 * @returns Recent log entries
 */
export function getRecentLogs(maxEntries?: number, level?: LogLevel): LogEntry[] {
  let logs = [...recentLogs];

  // Filter by level if provided
  if (level) {
    logs = logs.filter(entry => entry.level === level);
  }

  // Limit the number of entries if provided
  if (maxEntries && maxEntries > 0) {
    logs = logs.slice(0, maxEntries);
  }

  return logs;
}

/**
 * Clear recent logs
 */
export function clearRecentLogs(): void {
  recentLogs.length = 0;
}

/**
 * Capture an enhanced app error
 * @param enhancedError The enhanced app error to capture
 * @param context Additional context information
 * @returns The captured error
 */
export function captureEnhancedError(enhancedError: EnhancedAppError, context?: Record<string, any>): EnhancedAppError {
  // Determine the log level based on the error severity
  let level: LogLevel;
  switch (enhancedError.severity) {
    case ErrorSeverity.DEBUG:
      level = LogLevel.DEBUG;
      break;
    case ErrorSeverity.INFO:
      level = LogLevel.INFO;
      break;
    case ErrorSeverity.WARNING:
      level = LogLevel.WARNING;
      break;
    case ErrorSeverity.ERROR:
      level = LogLevel.ERROR;
      break;
    case ErrorSeverity.CRITICAL:
      level = LogLevel.CRITICAL;
      break;
    case ErrorSeverity.FATAL:
      level = LogLevel.FATAL;
      break;
    default:
      level = LogLevel.ERROR;
  }

  // Merge contexts
  const mergedContext = {
    ...enhancedError.context,
    ...context,
  };

  // Log the error
  log(level, enhancedError.message, mergedContext, enhancedError);

  // Mark as logged
  enhancedError.logged = true;

  return enhancedError;
}

const errorLogger = {
  LogLevel,
  log,
  debug,
  info,
  warn,
  error,
  critical,
  fatal,
  getRecentLogs,
  clearRecentLogs,
  setVerboseLogging,
  setLogToConsole,
  configureErrorReporting,
  captureEnhancedError
};

export default errorLogger;
