/**
 * Utilities for standardizing API responses
 */

import { NextResponse } from 'next/server';
import { AppError, ErrorType, handleError } from './error-handler';

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    type?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Create a success response
 * @param data - The response data
 * @param meta - Additional metadata
 * @returns A standardized success response
 */
export function createSuccessResponse<T = any>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

/**
 * Create an error response
 * @param error - The error object
 * @returns A standardized error response
 */
export function createErrorResponse(error: unknown): ApiResponse {
  const appError = handleError(error);
  
  return {
    success: false,
    error: {
      message: appError.message,
      code: appError.code,
      type: appError.type,
      details: appError.details,
    },
  };
}

/**
 * Create a Next.js API response
 * @param data - The response data or error
 * @param options - Additional options
 * @returns A Next.js response object
 */
export function createApiResponse<T = any>(
  data: T | unknown,
  options: {
    status?: number;
    headers?: Record<string, string>;
    isError?: boolean;
    meta?: ApiResponse['meta'];
  } = {}
): NextResponse {
  const { status, headers = {}, isError = false, meta } = options;
  
  // If data is an error or isError is true, create an error response
  const responseData = isError || data instanceof Error
    ? createErrorResponse(data)
    : createSuccessResponse(data, meta);
  
  // Determine status code
  let statusCode = status;
  
  if (!statusCode) {
    if (isError || data instanceof Error) {
      const appError = data instanceof AppError ? data : handleError(data);
      statusCode = appError.getStatusCode();
    } else {
      statusCode = 200;
    }
  }
  
  // Create response
  const response = NextResponse.json(responseData, { status: statusCode });
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * Create a validation error response
 * @param message - The error message
 * @param details - Additional error details
 * @returns A Next.js response object
 */
export function createValidationErrorResponse(message: string, details?: any): NextResponse {
  const error = new AppError(message, ErrorType.VALIDATION, 'VALIDATION_ERROR', details);
  return createApiResponse(error);
}

/**
 * Create a not found error response
 * @param message - The error message
 * @param resource - The resource that was not found
 * @returns A Next.js response object
 */
export function createNotFoundResponse(message: string, resource?: string): NextResponse {
  const error = new AppError(
    message,
    ErrorType.NOT_FOUND,
    'NOT_FOUND_ERROR',
    resource ? { resource } : undefined
  );
  return createApiResponse(error);
}

/**
 * Create an unauthorized error response
 * @param message - The error message
 * @returns A Next.js response object
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  const error = new AppError(message, ErrorType.AUTHENTICATION, 'UNAUTHORIZED_ERROR');
  return createApiResponse(error);
}

/**
 * Create a forbidden error response
 * @param message - The error message
 * @returns A Next.js response object
 */
export function createForbiddenResponse(message: string = 'Forbidden'): NextResponse {
  const error = new AppError(message, ErrorType.AUTHORIZATION, 'FORBIDDEN_ERROR');
  return createApiResponse(error);
}

/**
 * Create a server error response
 * @param message - The error message
 * @param details - Additional error details
 * @returns A Next.js response object
 */
export function createServerErrorResponse(message: string = 'Internal Server Error', details?: any): NextResponse {
  const error = new AppError(message, ErrorType.UNKNOWN, 'SERVER_ERROR', details);
  return createApiResponse(error);
}
