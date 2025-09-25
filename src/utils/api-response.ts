import { NextResponse } from 'next/server';

// Standard API response structure
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

// Validation error structure
interface ValidationError {
  field: string;
  message: string;
}

interface ValidationErrorResponse {
  success: false;
  error: string;
  message: string;
  errors: ValidationError[];
  timestamp: string;
}

// Response options
interface ResponseOptions {
  status?: number;
  headers?: Record<string, string>;
  requestId?: string;
}

/**
 * Create a standardized API response
 */
export function createApiResponse<T = any>(
  data: T | { error: string; message?: string },
  options: ResponseOptions = {}
): NextResponse {
  const { status = 200, headers = {}, requestId } = options;

  const isError = typeof data === 'object' && data !== null && 'error' in data;

  const response = {
    success: !isError,
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
    ...(isError ? data : { data }),
  } as ApiResponse<T>;

  // Set default headers
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...headers,
  };

  return NextResponse.json(response, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(
  message: string,
  details: { errors: ValidationError[] },
  options: ResponseOptions = {}
): NextResponse {
  const { status = 400, headers = {}, requestId } = options;

  const response: ValidationErrorResponse = {
    success: false,
    error: 'Validation Error',
    message,
    errors: details.errors,
    timestamp: new Date().toISOString(),
    ...(requestId && { requestId }),
  };

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...headers,
  };

  return NextResponse.json(response, {
    status,
    headers: responseHeaders,
  });
}

/**
 * Create a success response
 */
export function createSuccessResponse<T = any>(
  data: T,
  message?: string,
  options: ResponseOptions = {}
): NextResponse {
  return createApiResponse(
    {
      ...data,
      ...(message && { message }),
    },
    options
  );
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: string,
  message?: string,
  options: ResponseOptions = {}
): NextResponse {
  const { status = 500 } = options;

  return createApiResponse(
    {
      error,
      ...(message && { message }),
    },
    { ...options, status }
  );
}

/**
 * Create a not found response
 */
export function createNotFoundResponse(
  message: string = 'Resource not found',
  options: ResponseOptions = {}
): NextResponse {
  return createErrorResponse('Not Found', message, { ...options, status: 404 });
}

/**
 * Create an unauthorized response
 */
export function createUnauthorizedResponse(
  message: string = 'Unauthorized access',
  options: ResponseOptions = {}
): NextResponse {
  return createErrorResponse('Unauthorized', message, { ...options, status: 401 });
}

/**
 * Create a forbidden response
 */
export function createForbiddenResponse(
  message: string = 'Access forbidden',
  options: ResponseOptions = {}
): NextResponse {
  return createErrorResponse('Forbidden', message, { ...options, status: 403 });
}

/**
 * Create a rate limit response
 */
export function createRateLimitResponse(
  message: string = 'Too many requests',
  options: ResponseOptions = {}
): NextResponse {
  return createErrorResponse('Rate Limit Exceeded', message, { ...options, status: 429 });
}