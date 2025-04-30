/**
 * Centralized error handling utilities
 */

/**
 * Error types for application errors
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  API = 'api',
  NETWORK = 'network',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  type: ErrorType;
  code?: string;
  details?: any;
  
  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, code?: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
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
        return 'There was a problem with our database. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }
  
  /**
   * Get the HTTP status code for the error
   * @returns The HTTP status code
   */
  getStatusCode(): number {
    switch (this.type) {
      case ErrorType.VALIDATION:
        return 400;
      case ErrorType.AUTHENTICATION:
        return 401;
      case ErrorType.AUTHORIZATION:
        return 403;
      case ErrorType.NOT_FOUND:
        return 404;
      case ErrorType.API:
      case ErrorType.DATABASE:
        return 500;
      case ErrorType.NETWORK:
        return 503;
      default:
        return 500;
    }
  }
}

/**
 * Create a validation error
 * @param message - The error message
 * @param details - Additional error details
 * @returns A new AppError with type VALIDATION
 */
export function createValidationError(message: string, details?: any): AppError {
  return new AppError(message, ErrorType.VALIDATION, 'VALIDATION_ERROR', details);
}

/**
 * Create an authentication error
 * @param message - The error message
 * @returns A new AppError with type AUTHENTICATION
 */
export function createAuthenticationError(message: string): AppError {
  return new AppError(message, ErrorType.AUTHENTICATION, 'AUTHENTICATION_ERROR');
}

/**
 * Create an authorization error
 * @param message - The error message
 * @returns A new AppError with type AUTHORIZATION
 */
export function createAuthorizationError(message: string): AppError {
  return new AppError(message, ErrorType.AUTHORIZATION, 'AUTHORIZATION_ERROR');
}

/**
 * Create a not found error
 * @param message - The error message
 * @param resource - The resource that was not found
 * @returns A new AppError with type NOT_FOUND
 */
export function createNotFoundError(message: string, resource?: string): AppError {
  return new AppError(
    message,
    ErrorType.NOT_FOUND,
    'NOT_FOUND_ERROR',
    resource ? { resource } : undefined
  );
}

/**
 * Create an API error
 * @param message - The error message
 * @param details - Additional error details
 * @returns A new AppError with type API
 */
export function createApiError(message: string, details?: any): AppError {
  return new AppError(message, ErrorType.API, 'API_ERROR', details);
}

/**
 * Create a network error
 * @param message - The error message
 * @returns A new AppError with type NETWORK
 */
export function createNetworkError(message: string): AppError {
  return new AppError(message, ErrorType.NETWORK, 'NETWORK_ERROR');
}

/**
 * Create a database error
 * @param message - The error message
 * @param details - Additional error details
 * @returns A new AppError with type DATABASE
 */
export function createDatabaseError(message: string, details?: any): AppError {
  return new AppError(message, ErrorType.DATABASE, 'DATABASE_ERROR', details);
}

/**
 * Handle an error and convert it to an AppError
 * @param error - The error to handle
 * @returns An AppError
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, ErrorType.UNKNOWN, 'UNKNOWN_ERROR', { originalError: error });
  }
  
  return new AppError(
    typeof error === 'string' ? error : 'An unknown error occurred',
    ErrorType.UNKNOWN,
    'UNKNOWN_ERROR',
    { originalError: error }
  );
}

/**
 * Log an error to the console
 * @param error - The error to log
 * @param context - Additional context information
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const appError = handleError(error);
  
  console.error(
    `[ERROR] [${appError.type.toUpperCase()}] ${appError.message}`,
    {
      code: appError.code,
      details: appError.details,
      context,
      stack: appError.stack,
    }
  );
  
  // In a real application, you might send this to an error tracking service
  // Example: sendToErrorTrackingService(appError, context);
}
