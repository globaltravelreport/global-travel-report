/**
 * API Error Handler
 *
 * A utility for handling errors in API routes consistently.
 * It provides functions for creating error responses and logging errors.
 */

import { NextResponse } from 'next/server';
import { AppError, ErrorType, handleError } from './error-handler';
import { error as logError } from './errorLogger';

// Define API error response interface
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: any;
  requestId?: string;
}

/**
 * Create an API error response
 * @param error The error to handle
 * @param status The HTTP status code
 * @param includeDetails Whether to include error details
 * @param requestId Optional request ID for tracking
 * @returns NextResponse with error details
 */
export function createApiErrorResponse(
  error: unknown,
  status: number = 500,
  includeDetails: boolean = false,
  requestId?: string
): NextResponse {
  // Convert the error to an AppError
  const appError = handleError(error);

  // Create the error response
  const errorResponse: ApiErrorResponse = {
    error: appError.message,
    code: appError.code
  };

  // Add request ID if provided
  if (requestId) {
    errorResponse.requestId = requestId;
  }

  // Include details if requested and in development mode
  if (includeDetails && process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: appError.stack,
      type: appError.type,
      details: appError.details
    };
  }

  // Log the error
  logError(`API Error: ${appError.message}`, {
    status,
    code: appError.code,
    type: appError.type,
    requestId
  }, appError);

  // Return the error response
  return NextResponse.json(errorResponse, { status });
}

/**
 * Handle an API error
 * @param error The error to handle
 * @param requestId Optional request ID for tracking
 * @returns NextResponse with error details
 */
export function handleApiError(error: unknown, requestId?: string): NextResponse {
  // Convert the error to an AppError
  const appError = handleError(error);

  // Determine the status code based on the error type
  let status = 500;

  switch (appError.type) {
    case ErrorType.VALIDATION:
      status = 400; // Bad Request
      break;
    case ErrorType.AUTHENTICATION:
      status = 401; // Unauthorized
      break;
    case ErrorType.AUTHORIZATION:
      status = 403; // Forbidden
      break;
    case ErrorType.NOT_FOUND:
      status = 404; // Not Found
      break;
    case ErrorType.NETWORK:
      status = 503; // Service Unavailable
      break;
    default:
      status = 500; // Internal Server Error
  }

  // Create and return the error response
  return createApiErrorResponse(
    appError,
    status,
    process.env.NODE_ENV === 'development',
    requestId
  );
}

/**
 * Create a validation error response
 * @param message The error message
 * @param details Validation error details
 * @param requestId Optional request ID for tracking
 * @returns NextResponse with validation error details
 */
export function createValidationErrorResponse(
  message: string,
  details?: any,
  requestId?: string
): NextResponse {
  // Create a validation error
  const validationError = new AppError(
    message,
    ErrorType.VALIDATION,
    'VALIDATION_ERROR',
    details
  );

  // Create and return the error response
  return createApiErrorResponse(
    validationError,
    400,
    process.env.NODE_ENV === 'development',
    requestId
  );
}

/**
 * Create a not found error response
 * @param message The error message
 * @param resource The resource that was not found
 * @param requestId Optional request ID for tracking
 * @returns NextResponse with not found error details
 */
export function createNotFoundErrorResponse(
  message: string,
  resource?: string,
  requestId?: string
): NextResponse {
  // Create a not found error
  const notFoundError = new AppError(
    message,
    ErrorType.NOT_FOUND,
    'NOT_FOUND_ERROR',
    resource ? { resource } : undefined
  );

  // Create and return the error response
  return createApiErrorResponse(
    notFoundError,
    404,
    process.env.NODE_ENV === 'development',
    requestId
  );
}

/**
 * Create an authentication error response
 * @param message The error message
 * @param requestId Optional request ID for tracking
 * @returns NextResponse with authentication error details
 */
export function createAuthenticationErrorResponse(
  message: string,
  requestId?: string
): NextResponse {
  // Create an authentication error
  const authError = new AppError(
    message,
    ErrorType.AUTHENTICATION,
    'AUTHENTICATION_ERROR'
  );

  // Create and return the error response
  return createApiErrorResponse(
    authError,
    401,
    process.env.NODE_ENV === 'development',
    requestId
  );
}

const apiErrorHandler = {
  createApiErrorResponse,
  handleApiError,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createAuthenticationErrorResponse
};

export default apiErrorHandler;
