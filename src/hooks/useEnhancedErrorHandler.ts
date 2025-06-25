'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { 
  EnhancedAppError, 
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
  /**
   * Whether there is an error
   */
  hasError: boolean;
  
  /**
   * Error message
   */
  message: string;
  
  /**
   * Error type
   */
  type: ErrorType;
  
  /**
   * Error severity
   */
  severity: ErrorSeverity;
  
  /**
   * Error code
   */
  code?: string;
  
  /**
   * Additional error details
   */
  details?: any;
  
  /**
   * Error context
   */
  context?: ErrorContext;
  
  /**
   * Original error
   */
  error?: EnhancedAppError;
}

/**
 * Options for the useEnhancedErrorHandler hook
 */
interface UseEnhancedErrorHandlerOptions {
  /**
   * Whether to show toast notifications for errors
   */
  showToasts?: boolean;
  
  /**
   * Minimum severity level for showing toast notifications
   */
  toastSeverityThreshold?: ErrorSeverity;
  
  /**
   * Default context to include with all errors
   */
  defaultContext?: ErrorContext;
  
  /**
   * Whether to log errors automatically
   */
  autoLog?: boolean;
  
  /**
   * Callback function to run when an error occurs
   */
  onError?: (error: EnhancedAppError) => void;
}

/**
 * Enhanced hook for handling errors in React components
 * 
 * @param options - Options for the error handler
 * @returns Object with error state and error handling functions
 */
export function useEnhancedErrorHandler(options: UseEnhancedErrorHandlerOptions = {}) {
  const {
    showToasts = true,
    toastSeverityThreshold = ErrorSeverity.ERROR,
    defaultContext = {},
    autoLog = true,
    onError,
  } = options;
  
  const { toast } = useToast();
  
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: '',
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.ERROR,
    details: undefined,
  });
  
  /**
   * Handle an error and update error state
   * 
   * @param error - The error to handle
   * @param context - Additional context information
   * @param showToast - Whether to show a toast notification
   * @returns The enhanced error
   */
  const handleErrorWithState = useCallback((
    error: unknown,
    context?: ErrorContext,
    showToast: boolean = showToasts
  ): EnhancedAppError => {
    // Merge context with default context
    const mergedContext = { ...defaultContext, ...context };
    
    // Convert to EnhancedAppError
    const enhancedError = handleError(error, mergedContext);
    
    // Log the error if autoLog is enabled
    if (autoLog) {
      logError(enhancedError);
    }
    
    // Update error state
    setErrorState({
      hasError: true,
      message: enhancedError.getUserMessage(),
      type: enhancedError.type,
      severity: enhancedError.severity,
      code: enhancedError.code,
      details: enhancedError.details,
      context: enhancedError.context,
      error: enhancedError,
    });
    
    // Show toast notification if enabled and severity is at or above threshold
    if (showToast && enhancedError.isAtLeastSeverity(toastSeverityThreshold)) {
      toast({
        title: getToastTitle(enhancedError),
        description: enhancedError.getUserMessage(),
        variant: getToastVariant(enhancedError),
      });
    }
    
    // Call onError callback if provided
    if (onError) {
      onError(enhancedError);
    }
    
    return enhancedError;
  }, [autoLog, defaultContext, onError, showToasts, toast, toastSeverityThreshold]);
  
  /**
   * Clear the error state
   */
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      message: '',
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      details: undefined,
    });
  }, []);
  
  /**
   * Wrap a function with error handling
   * 
   * @param fn - The function to wrap
   * @param context - Additional context information
   * @returns A wrapped function that handles errors
   */
  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R> | R,
    context?: ErrorContext
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleErrorWithState(error, context);
        throw error;
      }
    };
  }, [handleErrorWithState]);
  
  /**
   * Show an error without throwing it
   * 
   * @param error - The error to show
   * @param context - Additional context information
   * @returns The enhanced error
   */
  const showError = useCallback((
    error: unknown,
    context?: ErrorContext
  ): EnhancedAppError => {
    return handleErrorWithState(error, context, true);
  }, [handleErrorWithState]);
  
  // Clear error state when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  
  return {
    // Error state
    error: errorState,
    hasError: errorState.hasError,
    errorMessage: errorState.message,
    errorType: errorState.type,
    errorSeverity: errorState.severity,
    errorDetails: errorState.details,
    errorContext: errorState.context,
    
    // Error handling functions
    handleError: handleErrorWithState,
    clearError,
    withErrorHandling,
    showError,
    
    // Type checking helpers
    isValidationError: errorState.type === ErrorType.VALIDATION,
    isAuthenticationError: errorState.type === ErrorType.AUTHENTICATION,
    isAuthorizationError: errorState.type === ErrorType.AUTHORIZATION,
    isNotFoundError: errorState.type === ErrorType.NOT_FOUND,
    isNetworkError: errorState.type === ErrorType.NETWORK,
    isApiError: errorState.type === ErrorType.API,
    
    // Severity checking helpers
    isCriticalError: errorState.severity === ErrorSeverity.CRITICAL || errorState.severity === ErrorSeverity.FATAL,
  };
}

/**
 * Get a toast title based on error severity
 * 
 * @param error - The error
 * @returns A toast title
 */
function getToastTitle(error: EnhancedAppError): string {
  switch (error.severity) {
    case ErrorSeverity.DEBUG:
    case ErrorSeverity.INFO:
      return 'Information';
    case ErrorSeverity.WARNING:
      return 'Warning';
    case ErrorSeverity.ERROR:
      return 'Error';
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.FATAL:
      return 'Critical Error';
    default:
      return 'Error';
  }
}

/**
 * Get a toast variant based on error severity
 * 
 * @param error - The error
 * @returns A toast variant
 */
function getToastVariant(error: EnhancedAppError): 'default' | 'destructive' {
  switch (error.severity) {
    case ErrorSeverity.DEBUG:
    case ErrorSeverity.INFO:
    case ErrorSeverity.WARNING:
      return 'default';
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.FATAL:
      return 'destructive';
    default:
      return 'destructive';
  }
}

export default useEnhancedErrorHandler;
