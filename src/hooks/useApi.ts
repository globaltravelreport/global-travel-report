"use client";

import { useState, useCallback, useEffect } from 'react';
import { useGlobalError } from '@/components/ui/GlobalErrorHandler';
import { ErrorType } from '@/utils/error-handler';

/**
 * API request state
 */
export interface ApiRequestState<T> {
  /**
   * Whether the request is currently loading
   */
  isLoading: boolean;

  /**
   * Whether the request was successful
   */
  isSuccess: boolean;

  /**
   * Whether the request failed
   */
  isError: boolean;

  /**
   * Response data from the request
   */
  data?: T;

  /**
   * Error from the request
   */
  error?: Error;
}

/**
 * API request options
 */
export interface ApiRequestOptions<T> {
  /**
   * Whether to fetch data immediately
   */
  immediate?: boolean;

  /**
   * Initial data
   */
  initialData?: T;

  /**
   * Error message to display
   */
  errorMessage?: string;

  /**
   * Whether to show error message
   */
  showErrorMessage?: boolean;

  /**
   * Callback to run on successful request
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback to run on failed request
   */
  onError?: (error: Error) => void;

  /**
   * Dependencies for refetching
   */
  deps?: any[];
}

/**
 * Hook for handling API requests with error handling
 * @param requestFn - Function to make the API request
 * @param options - Options for the API request
 * @returns API request state and functions
 */
export function useApi<TData = any, TParams = void>(
  requestFn: (params?: TParams) => Promise<TData>,
  options: ApiRequestOptions<TData> = {}
) {
  const {
    immediate = false,
    initialData,
    errorMessage = 'An error occurred while fetching data',
    showErrorMessage = true,
    onSuccess,
    onError,
    deps = [],
  } = options;

  const { showError } = useGlobalError();

  const [state, setState] = useState<ApiRequestState<TData>>({
    isLoading: immediate,
    isSuccess: false,
    isError: false,
    data: initialData,
  });

  const execute = useCallback(
    async (params?: TParams) => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: undefined,
      }));

      try {
        const data = await requestFn(params);

        setState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          data,
        });

        if (onSuccess) {
          onSuccess(data);
        }

        return data;
      } catch (error: any) {
        console.error('API request error:', error);

        setState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error instanceof Error ? error : new Error(error?.message || errorMessage),
        });

        if (showErrorMessage) {
          // Create an error object with the message
          const errorObj = new Error(error?.message || errorMessage);
          // Add error type as a property
          (errorObj as any).type = getErrorType(error);
          showError(errorObj);
        }

        if (onError) {
          onError(error instanceof Error ? error : new Error(error?.message || errorMessage));
        }

        throw error;
      }
    },
    [requestFn, errorMessage, showErrorMessage, onSuccess, onError, showError]
  );

  // Execute the request immediately if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute, ...deps]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

/**
 * Get error type from error object
 * @param error - Error object
 * @returns Error type
 */
function getErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  // Check for network errors
  if (error.name === 'NetworkError' || error.message?.includes('network')) {
    return ErrorType.NETWORK;
  }

  // Check for API errors
  if (error.status) {
    if (error.status === 401 || error.status === 403) {
      return ErrorType.AUTHENTICATION;
    }

    if (error.status === 404) {
      return ErrorType.NOT_FOUND;
    }

    if (error.status === 400 || error.status === 422) {
      return ErrorType.VALIDATION;
    }

    if (error.status >= 500) {
      return ErrorType.API;
    }
  }

  // Check for validation errors
  if (error.name === 'ValidationError' || error.errors) {
    return ErrorType.VALIDATION;
  }

  return ErrorType.UNKNOWN;
}
