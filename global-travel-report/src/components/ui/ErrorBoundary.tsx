"use client";

import React from 'react';
import { Button } from "./button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: any[];
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * Error Boundary component to catch and handle errors in React components
 *
 * Features:
 * - Catches errors in child components
 * - Displays a fallback UI when errors occur
 * - Logs errors to console and can send to error tracking service
 * - Can reset when specific props change
 * - Supports custom fallback components
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Set errorInfo in state
    this.setState({ errorInfo });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console
    console.error(
      `Error in ${this.props.componentName || 'component'}:`,
      error,
      errorInfo.componentStack
    );

    // In development, rethrow the error to show in the console
    if (process.env.NODE_ENV !== 'production') {
      console.error('React ErrorBoundary caught an error:', error, errorInfo);
    }

    // Here you could also log to an error reporting service
    // Example: logErrorToService(error, errorInfo, this.props.componentName);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state if resetKeys have changed
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary() {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
          </p>

          {/* Show error details in development */}
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mb-8 max-w-2xl overflow-auto text-left bg-red-50 p-4 rounded border border-red-200">
              <p className="font-bold text-red-700">Error: {this.state.error.message}</p>
              {this.state.errorInfo && (
                <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={this.resetErrorBoundary}
              aria-label="Try again"
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              aria-label="Return to homepage"
            >
              Return Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Component-specific error boundary that wraps a component with an error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps} componentName={displayName}>
      <Component {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}