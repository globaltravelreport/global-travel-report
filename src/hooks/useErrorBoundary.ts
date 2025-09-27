'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ErrorBoundaryState,
  ErrorBoundaryOptions,
  FallbackProps
} from '../types/error-boundary';

export function useErrorBoundary({
  onError,
  resetKeys = [],
  componentName
}: ErrorBoundaryOptions = {}) {
  const [state, setState] = useState<ErrorBoundaryState>({
    error: null,
    errorInfo: null,
    hasError: false
  });
  const prevResetKeys = useRef(resetKeys);

  const resetError = useCallback(() => {
    setState({ error: null, errorInfo: null, hasError: false });
  }, []);

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    setState({ error, errorInfo, hasError: true });
    if (onError) onError(error, errorInfo, componentName);
  }, [onError, componentName]);

  useEffect(() => {
    if (prevResetKeys.current &&
      prevResetKeys.current.length !== resetKeys.length ||
      prevResetKeys.current.some((key, i) => key !== resetKeys[i])
    ) {
      resetError();
    }
    prevResetKeys.current = resetKeys;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKeys]);

  return {
    ...state,
    resetError,
    captureError
  };
}
