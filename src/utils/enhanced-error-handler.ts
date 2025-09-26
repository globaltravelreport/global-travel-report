/**
 * Enhanced error handling utilities for better error management across the application
 */

/**
 * Error types for categorizing different kinds of errors
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  API = 'api',
  NETWORK = 'network',
  DATABASE = 'database',
  TIMEOUT = 'timeout',
  RATE_LIMIT = 'rate_limit',
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  INPUT = 'input',
  UNKNOWN = 'unknown',
}

/**
 * Error severity levels for categorizing the impact of errors
 */
export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
  FATAL = 'fatal',
}

/**
 * Interface for error context information
 */
export interface ErrorContext {
  [key: string]: any;
  url?: string;
  component?: string;
  action?: string;
  userId?: string;
  requestId?: string;
  timestamp?: Date | string | number;
}

/**
 * Enhanced application error class with additional context and metadata
 */
export class EnhancedAppError extends Error {
  /**
   * The type of error
   */
  type: ErrorType;

  /**
   * The severity level of the error
   */
  severity: ErrorSeverity;

  /**
   * Error code for more specific categorization
   */
  code?: string;

  /**
   * Additional error details
   */
  details?: any;

  /**
   * Context information about where/when the error occurred
   */
  context?: ErrorContext;

  /**
   * The original error that was caught (if applicable)
   */
  originalError?: unknown;

  /**
   * Whether the error has been logged
   */
  logged: boolean;

  /**
   * Unique ID for the error instance
   */
  id: string;

  /**
   * Timestamp when the error was created
   */
  timestamp: Date;

  /**
   * Create a new EnhancedAppError
   * @param message - Error message
   * @param type - Error type
   * @param severity - Error severity
   * @param code - Error code
   * @param details - Additional error details
   * @param context - Error context
   * @param originalError - Original error
   */
  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    code?: string,
    details?: any,
    context?: ErrorContext,
    originalError?: unknown
  ) {
    super(message);

    // Set error name to the class name
    this.name = this.constructor.name;

    // Set error properties
    this.type = type;
    this.severity = severity;
    this.code = code;
    this.details = details;
    this.context = context;
    this.originalError = originalError;
    this.logged = false;
    this.id = generateErrorId();
    this.timestamp = new Date();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Check if the error is a specific type
   * @param type - The error type to check
   * @returns Boolean indicating if the error is of the specified type
   */
  isType(type: ErrorType): boolean {
    return this.type === type;
  }

  /**
   * Check if the error is at or above a specific severity level
   * @param severity - The severity level to check
   * @returns Boolean indicating if the error is at or above the specified severity
   */
  isAtLeastSeverity(severity: ErrorSeverity): boolean {
    const levels = {
      [ErrorSeverity.DEBUG]: 0,
      [ErrorSeverity.INFO]: 1,
      [ErrorSeverity.WARNING]: 2,
      [ErrorSeverity.ERROR]: 3,
      [ErrorSeverity.CRITICAL]: 4,
      [ErrorSeverity.FATAL]: 5,
    };

    return (levels[this.severity] || 0) >= (levels[severity] || 0);
  }

  /**
   * Get a user-friendly error message
   * @returns A user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case ErrorType.VALIDATION:
        return 'The information you provided is invalid. Please check your inputs and try again.';
      case ErrorType.AUTHENTICATION:
        return 'You need to sign in to access this feature.';
      case ErrorType.AUTHORIZATION:
        return 'You do not have permission to perform this action.';
      case ErrorType.NOT_FOUND:
        return 'The requested resource could not be found.';
      case ErrorType.API:
        return 'There was a problem communicating with our services. Please try again later.';
      case ErrorType.NETWORK:
        return 'Network error. Please check your internet connection and try again.';
      case ErrorType.DATABASE:
        return 'There was a problem accessing the database. Please try again later.';
      case ErrorType.TIMEOUT:
        return 'The request timed out. Please try again later.';
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please try again later.';
      case ErrorType.INPUT:
        return 'Invalid input. Please check your inputs and try again.';
      case ErrorType.INTERNAL:
      case ErrorType.EXTERNAL:
      case ErrorType.UNKNOWN:
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }

  /**
   * Get a detailed error report for logging
   * @returns A detailed error report
   */
  getDetailedReport(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      code: this.code,
      details: this.details,
      context: this.context,
      stack: this.stack,
      timestamp: this.timestamp,
      originalError: this.originalError instanceof Error
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : this.originalError,
    };
  }
}

/**
 * Generate a unique error ID
 * @returns A unique error ID
 */
function generateErrorId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Create a validation error
 * @param message - The error message
 * @param details - Additional error details
 * @param context - Error context
 * @returns A new EnhancedAppError with type VALIDATION
 */
export function createValidationError(
  message: string,
  details?: any,
  context?: ErrorContext
): EnhancedAppError {
  return new EnhancedAppError(
    message,
    ErrorType.VALIDATION,
    ErrorSeverity.WARNING,
    'VALIDATION_ERROR',
    details,
    context
  );
}

/**
 * Create an authentication error
 * @param message - The error message
 * @param context - Error context
 * @returns A new EnhancedAppError with type AUTHENTICATION
 */
export function createAuthenticationError(
  message: string,
  context?: ErrorContext
): EnhancedAppError {
  return new EnhancedAppError(
    message,
    ErrorType.AUTHENTICATION,
    ErrorSeverity.ERROR,
    'AUTHENTICATION_ERROR',
    undefined,
    context
  );
}

/**
 * Create an authorization error
 * @param message - The error message
 * @param context - Error context
 * @returns A new EnhancedAppError with type AUTHORIZATION
 */
export function createAuthorizationError(
  message: string,
  context?: ErrorContext
): EnhancedAppError {
  return new EnhancedAppError(
    message,
    ErrorType.AUTHORIZATION,
    ErrorSeverity.ERROR,
    'AUTHORIZATION_ERROR',
    undefined,
    context
  );
}

/**
 * Create a not found error
 * @param message - The error message
 * @param resource - The resource that was not found
 * @param context - Error context
 * @returns A new EnhancedAppError with type NOT_FOUND
 */
export function createNotFoundError(
  message: string,
  resource?: string,
  context?: ErrorContext
): EnhancedAppError {
  return new EnhancedAppError(
    message,
    ErrorType.NOT_FOUND,
    ErrorSeverity.WARNING,
    'NOT_FOUND_ERROR',
    resource ? { resource } : undefined,
    context
  );
}

/**
 * Create a network error
 * @param message - The error message
 * @param details - Additional error details
 * @param context - Error context
 * @returns A new EnhancedAppError with type NETWORK
 */
export function createNetworkError(
  message: string,
  details?: any,
  context?: ErrorContext
): EnhancedAppError {
  return new EnhancedAppError(
    message,
    ErrorType.NETWORK,
    ErrorSeverity.ERROR,
    'NETWORK_ERROR',
    details,
    context
  );
}

/**
 * Handle an error and convert it to an EnhancedAppError
 * @param error - The error to handle
 * @param context - Additional context information
 * @returns An EnhancedAppError
 */
export function handleError(
  error: unknown,
  context?: ErrorContext
): EnhancedAppError {
  // If it's already an EnhancedAppError, just return it
  if (error instanceof EnhancedAppError) {
    // Update context if provided
    if (context) {
      error.context = { ...error.context, ...context };
    }
    return error;
  }

  // If it's a standard Error, convert it to an EnhancedAppError
  if (error instanceof Error) {
    // Try to determine the error type based on the error name or message
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.ERROR;
    let code: string | undefined;

    // Check for common error patterns
    if (error.name === 'ValidationError' || error.message.includes('validation')) {
      type = ErrorType.VALIDATION;
      severity = ErrorSeverity.WARNING;
      code = 'VALIDATION_ERROR';
    } else if (error.name === 'NetworkError' || error.message.includes('network')) {
      type = ErrorType.NETWORK;
      code = 'NETWORK_ERROR';
    } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      type = ErrorType.TIMEOUT;
      code = 'TIMEOUT_ERROR';
    } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
      type = ErrorType.NOT_FOUND;
      severity = ErrorSeverity.WARNING;
      code = 'NOT_FOUND_ERROR';
    }

    return new EnhancedAppError(
      error.message,
      type,
      severity,
      code,
      undefined,
      context,
      error
    );
  }

  // For non-Error objects, create a generic error
  return new EnhancedAppError(
    typeof error === 'string' ? error : 'An unknown error occurred',
    ErrorType.UNKNOWN,
    ErrorSeverity.ERROR,
    'UNKNOWN_ERROR',
    { originalError: error },
    context,
    error
  );
}

/**
 * Log an error to the centralized error logging system
 * @param error - The error to log
 * @param context - Additional context information
 * @param severity - The log level (default: error)
 * @returns The enhanced error that was logged
 */
export function logError(
  error: unknown,
  context?: ErrorContext,
  severity?: ErrorSeverity
): EnhancedAppError {
  // Convert to EnhancedAppError if needed
  const enhancedError = handleError(error, context);

  // Update severity if provided
  if (severity) {
    enhancedError.severity = severity;
  }

  // Mark as logged
  enhancedError.logged = true;

  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      `[${enhancedError.severity.toUpperCase()}] [${enhancedError.type.toUpperCase()}] ${enhancedError.message}`,
      enhancedError.getDetailedReport()
    );
  }

  // In production, send to error tracking service
  // This would typically be implemented with a service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // Import the error logger dynamically to avoid circular dependencies
    import('./errorLogger').then(({ default: logger }) => {
      logger.captureEnhancedError(enhancedError);
    }).catch(err => {
      // Fallback to console if the logger fails
      console.error('Error importing logger:', err);
      console.error(
        `[${enhancedError.severity.toUpperCase()}] [${enhancedError.type.toUpperCase()}] ${enhancedError.message}`,
        enhancedError.getDetailedReport()
      );
    });
  }

  return enhancedError;
}

const enhancedErrorHandler = {
  EnhancedAppError,
  ErrorType,
  ErrorSeverity,
  handleError,
  logError,
  createValidationError,
  createAuthenticationError,
  createAuthorizationError,
  createNotFoundError,
  createNetworkError,
};

export default enhancedErrorHandler;
