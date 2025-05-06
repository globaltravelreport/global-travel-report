/**
 * Error Logger
 * 
 * A centralized system for logging errors and warnings in the application.
 * This ensures consistent error handling and makes it easier to add
 * error reporting services in the future.
 */

import { AppError, ErrorType, handleError } from './error-handler';

// Define log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Define log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error | AppError;
  stack?: string;
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
    // Only send errors and fatals to the error reporting service
    if (entry.level !== LogLevel.ERROR && entry.level !== LogLevel.FATAL) {
      return;
    }
    
    // Send the error to the reporting service
    const response = await fetch(errorReportingEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entry)
    });
    
    if (!response.ok) {
      console.error(`Failed to send error to reporting service: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    // Don't use the logger here to avoid infinite recursion
    console.error('Error sending to error reporting service:', error);
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
  
  // Convert error to AppError if provided
  let appError: AppError | undefined;
  if (error) {
    appError = handleError(error);
  }
  
  // Create the log entry
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: appError,
    stack: appError?.stack
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
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage);
        break;
    }
  }
  
  // Send to error reporting service if it's an error or fatal
  if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
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
  log(LogLevel.WARN, message, context, error);
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

export default {
  LogLevel,
  log,
  debug,
  info,
  warn,
  error,
  fatal,
  getRecentLogs,
  clearRecentLogs,
  setVerboseLogging,
  setLogToConsole,
  configureErrorReporting
};
