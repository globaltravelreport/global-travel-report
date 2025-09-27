"use client";

import React from 'react';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import type { GlobalErrorHandlerProps, GlobalErrorContextType, FallbackProps } from '@/types/error-boundary';

export const GlobalErrorContext = React.createContext<GlobalErrorContextType>({
  error: null,
  setError: () => {},
  clearError: () => {},
  showError: () => {},
});

export const useGlobalError = () => {
  const context = React.useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
};

export function GlobalErrorHandler({ children, fallback }: GlobalErrorHandlerProps) {
  const { error, errorInfo, hasError, resetError, captureError } = useErrorBoundary({ componentName: 'GlobalErrorHandler' });

  const contextValue = React.useMemo<GlobalErrorContextType>(() => ({
    error: error ?? null,
    setError: (e) => captureError(e),
    clearError: resetError,
    showError: (e) => captureError(e),
  }), [error, resetError, captureError]);

  if (hasError && error) {
    if (typeof fallback === 'function') {
      return fallback({ error, errorInfo, resetError, componentName: 'GlobalErrorHandler' });
    }
    if (fallback) return fallback;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            We're sorry, but there was an error loading this page. Please try refreshing the page or contact support if the problem persists.
          </p>
          <div className="mt-6">
            <button
              onClick={resetError}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GlobalErrorContext.Provider value={contextValue}>
      {children}
    </GlobalErrorContext.Provider>
  );
}
