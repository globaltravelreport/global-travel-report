"use client";

import React, { ReactNode, ReactElement, useCallback } from 'react';
import { Button } from "./button";
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import type { ErrorBoundaryProps, FallbackProps } from '@/types/error-boundary';

const DefaultFallback = ({ error, errorInfo, resetError, componentName }: FallbackProps) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
    <p className="text-gray-600 mb-8 max-w-md">
      We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
    </p>
    {process.env.NODE_ENV !== 'production' && error && (
      <div className="mb-8 max-w-2xl overflow-auto text-left bg-red-50 p-4 rounded border border-red-200">
        <p className="font-bold text-red-700">Error: {error.message}</p>
        {errorInfo && (
          <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
            {errorInfo?.componentStack}
          </pre>
        )}
      </div>
    )}
    <div className="flex gap-4">
      <Button onClick={resetError} aria-label="Try again">Try again</Button>
      <Button variant="outline" onClick={() => window.location.href = "/"} aria-label="Return to homepage">Return Home</Button>
    </div>
  </div>
);

export function ErrorBoundary({
  children,
  fallback,
  onError,
  resetKeys,
  componentName
}: ErrorBoundaryProps) {
  const { error, errorInfo, hasError, resetError, captureError } = useErrorBoundary({ onError, resetKeys, componentName });

  const handleRender = useCallback(() => {
    try {
      return children;
    } catch (err: any) {
      captureError(err);
      return null;
    }
  }, [children, captureError]);

  if (hasError && error) {
    if (typeof fallback === 'function') {
      return fallback({ error, errorInfo, resetError, componentName });
    }
    if (fallback) return fallback;
    return <DefaultFallback error={error} errorInfo={errorInfo} resetError={resetError} componentName={componentName} />;
  }
  return handleRender();
}

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> => {
  const displayName = Component.displayName || Component.name || 'Component';
  const ComponentWithErrorBoundary: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps} componentName={displayName}>
      <Component {...props} />
    </ErrorBoundary>
  );
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  return ComponentWithErrorBoundary;
};