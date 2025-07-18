'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  AppError, 
  ErrorType, 
  ErrorSeverity, 
  handleError, 
  logError, 
  ErrorContext 
} from '@/utils/enhanced-error-handler';

/**
 * Error state interface
 */
interface ErrorState {
  error: AppError | null;
  isLoading: boolean;
  retryCount: number;
}

/**
 * Enhanced error handler hook with retry logic and context tracking
 */
export function useEnhancedErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isLoading: false,
    retryCount: 0
  });

  /**
   * Handle error with enhanced context and retry logic
   */
  const handleErrorWithContext = useCallback(async (
    error: Error | AppError,
    context?: ErrorContext,
    maxRetries: number = 3
  ) => {
    const appError = error instanceof AppError ? error : new AppError(
      error.message,
      ErrorType.UNKNOWN,
      ErrorSeverity.MEDIUM,
      context
    );

    // Log the error
    await logError(appError);

    // Update state
    setErrorState(prev => ({
      error: appError,
      isLoading: false,
      retryCount: prev.retryCount + 1
    }));

    // Handle the error (this might trigger notifications, etc.)
    await handleError(appError);

    return appError;
  }, []);

  /**
   * Retry the last failed operation
   */
  const retry = useCallback(async (operation: () => Promise<void>) => {
    if (errorState.retryCount >= 3) {
      return;
    }

    setErrorState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      await operation();
      setErrorState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      await handleErrorWithContext(
        error as Error,
        { operation: 'retry' }
      );
    }
  }, [errorState.retryCount, handleErrorWithContext]);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isLoading: false,
      retryCount: 0
    });
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setErrorState(prev => ({
      ...prev,
      isLoading: loading
    }));
  }, []);

  return {
    error: errorState.error,
    isLoading: errorState.isLoading,
    retryCount: errorState.retryCount,
    canRetry: errorState.retryCount < 3,
    handleError: handleErrorWithContext,
    retry,
    clearError,
    setLoading
  };
}

export default useEnhancedErrorHandler;