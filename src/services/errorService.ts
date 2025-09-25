/**
 * Centralized Error Handling Service for Global Travel Report
 * 
 * This service provides consistent error handling across the application:
 * - Standardized error logging
 * - Error categorization
 * - User-friendly error messages
 * - Error reporting (without using Sentry)
 */

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Error categories
export enum ErrorCategory {
  API = 'api',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  CONTENT = 'content',
  SYSTEM = 'system',
  UNKNOWN = 'unknown',
}

// Error context interface
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  url?: string;
  params?: Record<string, any>;
  additionalData?: Record<string, any>;
}

// Standardized error interface
export interface AppError {
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  originalError?: Error;
  context?: ErrorContext;
  timestamp: Date;
  id: string;
}

// In-memory error store for the current session
const errorStore: AppError[] = [];

/**
 * Log an error with standardized formatting
 * @param error Error object or message
 * @param severity Error severity
 * @param category Error category
 * @param context Additional context
 * @returns Generated AppError object
 */
export function logError(
  error: Error | string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  context?: ErrorContext
): AppError {
  // Create a standardized error object
  const appError: AppError = {
    message: typeof error === 'string' ? error : error.message,
    severity,
    category,
    originalError: typeof error === 'string' ? undefined : error,
    context,
    timestamp: new Date(),
    id: generateErrorId(),
  };

  // Store the error
  errorStore.push(appError);

  // Limit the error store to the last 100 errors
  if (errorStore.length > 100) {
    errorStore.shift();
  }

  // Log to console with appropriate level
  const logPrefix = `[${appError.severity.toUpperCase()}][${appError.category}]`;
  const logMessage = `${logPrefix} ${appError.message}`;

  switch (severity) {
    case ErrorSeverity.INFO:
      console.info(logMessage, { error: appError });
      break;
    case ErrorSeverity.WARNING:
      console.warn(logMessage, { error: appError });
      break;
    case ErrorSeverity.CRITICAL:
      console.error(`CRITICAL: ${logMessage}`, { error: appError });
      break;
    case ErrorSeverity.ERROR:
    default:
      console.error(logMessage, { error: appError });
      break;
  }

  return appError;
}

/**
 * Generate a unique error ID
 * @returns Unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get user-friendly error message based on error category and context
 * @param error AppError object
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  // Default messages by category
  const defaultMessages: Record<ErrorCategory, string> = {
    [ErrorCategory.API]: 'We had trouble connecting to an external service. Please try again later.',
    [ErrorCategory.DATABASE]: 'We had trouble accessing our database. Please try again later.',
    [ErrorCategory.NETWORK]: 'There seems to be a network issue. Please check your connection and try again.',
    [ErrorCategory.VALIDATION]: 'Some of the information provided is invalid. Please check and try again.',
    [ErrorCategory.AUTHENTICATION]: 'There was a problem with your login credentials. Please try again.',
    [ErrorCategory.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
    [ErrorCategory.CONTENT]: 'There was a problem loading the content. Please try again later.',
    [ErrorCategory.SYSTEM]: 'We encountered a system error. Our team has been notified.',
    [ErrorCategory.UNKNOWN]: 'Something went wrong. Please try again later.',
  };

  // For non-critical errors, we can show the actual error message
  if (error.severity !== ErrorSeverity.CRITICAL) {
    return error.message || defaultMessages[error.category];
  }

  // For critical errors, always use the default message
  return defaultMessages[error.category];
}

/**
 * Get all errors from the current session
 * @returns Array of AppError objects
 */
export function getErrorHistory(): AppError[] {
  return [...errorStore];
}

/**
 * Clear the error history
 */
export function clearErrorHistory(): void {
  errorStore.length = 0;
}

/**
 * Create an API error with standardized formatting
 * @param message Error message
 * @param originalError Original error object
 * @param context Additional context
 * @returns AppError object
 */
export function createApiError(
  message: string,
  originalError?: Error,
  context?: ErrorContext
): AppError {
  return logError(
    originalError || message,
    ErrorSeverity.ERROR,
    ErrorCategory.API,
    context
  );
}

/**
 * Create a database error with standardized formatting
 * @param message Error message
 * @param originalError Original error object
 * @param context Additional context
 * @returns AppError object
 */
export function createDatabaseError(
  message: string,
  originalError?: Error,
  context?: ErrorContext
): AppError {
  return logError(
    originalError || message,
    ErrorSeverity.ERROR,
    ErrorCategory.DATABASE,
    context
  );
}

/**
 * Create a content error with standardized formatting
 * @param message Error message
 * @param originalError Original error object
 * @param context Additional context
 * @returns AppError object
 */
export function createContentError(
  message: string,
  originalError?: Error,
  context?: ErrorContext
): AppError {
  return logError(
    originalError || message,
    ErrorSeverity.WARNING,
    ErrorCategory.CONTENT,
    context
  );
}

// Export the service as a default object
const errorService = {
  logError,
  getUserFriendlyMessage,
  getErrorHistory,
  clearErrorHistory,
  createApiError,
  createDatabaseError,
  createContentError,
  ErrorSeverity,
  ErrorCategory,
};

export default errorService;
