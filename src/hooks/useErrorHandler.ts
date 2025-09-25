"use client";

import { useState, useCallback } from 'react';
<<<<<<< HEAD
import { EnhancedAppError as AppError, ErrorType, handleError } from '@/utils/enhanced-error-handler';
import { logError } from '@/utils/error-handler';
=======
import { AppError, ErrorType, handleError, logError } from '@/utils/error-handler';
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe

/**
 * Interface for error state
 */
interface ErrorState {
  hasError: boolean;
  message: string;
  type: ErrorType;
  details?: any;
}

/**
 * Hook for handling errors in React components
 * @returns Object with error state and error handling functions
 */
export function useErrorHandler() {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: '',
    type: ErrorType.UNKNOWN,
    details: undefined,
  });
  
  /**
   * Handle an error
   * @param error - The error to handle
   * @param context - Additional context information
   */
  const handleErrorWithState = useCallback((error: unknown, context?: Record<string, any>) => {
    const appError = handleError(error);
    
    // Log the error
    logError(appError, context);
    
    // Update error state
    setError({
      hasError: true,
      message: appError.getUserMessage(),
      type: appError.type,
      details: appError.details,
    });
    
    return appError;
  }, []);
  
  /**
   * Clear the error state
   */
  const clearError = useCallback(() => {
    setError({
      hasError: false,
      message: '',
      type: ErrorType.UNKNOWN,
      details: undefined,
    });
  }, []);
  
  /**
   * Wrap an async function with error handling
   * @param fn - The async function to wrap
   * @param context - Additional context information
   * @returns A wrapped function that handles errors
   */
  const withErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      context?: Record<string, any>
    ) => async (...args: T): Promise<R | undefined> => {
      try {
        clearError();
        return await fn(...args);
      } catch (error) {
        handleErrorWithState(error, context);
        return undefined;
      }
    },
    [clearError, handleErrorWithState]
  );
  
  return {
    error,
    handleError: handleErrorWithState,
    clearError,
    withErrorHandling,
    isValidationError: error.type === ErrorType.VALIDATION,
    isAuthenticationError: error.type === ErrorType.AUTHENTICATION,
    isAuthorizationError: error.type === ErrorType.AUTHORIZATION,
    isNotFoundError: error.type === ErrorType.NOT_FOUND,
    isApiError: error.type === ErrorType.API,
    isNetworkError: error.type === ErrorType.NETWORK,
    isDatabaseError: error.type === ErrorType.DATABASE,
  };
}
