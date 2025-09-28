"use client";

import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { logError } from '@/utils/error-handler';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import type { ErrorBoundaryOptions, FallbackProps, ErrorBoundaryProps } from '@/types/error-boundary';

export function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
  componentName,
}: FallbackProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-red-100 p-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold leading-6 text-red-900">
            {componentName ? `Error in ${componentName}` : 'Something went wrong'}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>We apologize for the inconvenience. Please try again or contact support if the problem persists.</p>
          </div>
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-4 rounded border border-red-200 bg-white p-3 text-xs font-mono text-red-800 overflow-auto max-h-40">
              <p className="font-bold">{error.name}: {error.message}</p>
              {error.stack && (
                <pre className="mt-1 text-xs whitespace-pre-wrap">
                  {error.stack.split('\n').slice(0, 5).join('\n')}
                </pre>
              )}
              {errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold">Component Stack</summary>
                  <pre className="mt-1 text-xs whitespace-pre-wrap">
                    {errorInfo.componentStack?.split('\n').slice(0, 10).join('\n')}
                  </pre>
                </details>
              )}
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <Button size="sm" onClick={resetError} className="inline-flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.location.href = '/'} className="inline-flex items-center gap-1">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface EnhancedErrorBoundaryProps extends ErrorBoundaryProps {
  logErrors?: boolean;
}

export function EnhancedErrorBoundary({
  children,
  fallback: FallbackComponent,
  onError,
  resetKeys,
  componentName,
  logErrors = true
}: EnhancedErrorBoundaryProps) {
  const { error, errorInfo, hasError, resetError, captureError } = useErrorBoundary({ onError, resetKeys, componentName });

  React.useEffect(() => {
    if (hasError && error && logErrors) {
      const context = {
        componentName: componentName || 'Unknown',
        componentStack: errorInfo?.componentStack,
        url: typeof window !== 'undefined' ? window.location.href : '',
      };
      logError(error, context);
    }
  }, [hasError, error, errorInfo, logErrors, componentName]);

  if (hasError && error) {
    if (FallbackComponent) {
      // Handle both function components and React elements
      if (typeof FallbackComponent === 'function') {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            resetError={resetError}
            componentName={componentName}
          />
        );
      }
      // If it's a React element, render it directly
      return FallbackComponent;
    }
    return (
      <DefaultErrorFallback
        error={error}
        errorInfo={errorInfo}
        resetError={resetError}
        componentName={componentName}
      />
    );
  }
  return children;
}

// HOC function removed due to TypeScript complexity

export default EnhancedErrorBoundary;
