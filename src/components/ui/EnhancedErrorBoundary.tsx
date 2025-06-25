'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { logError } from '@/utils/error-handler';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface FallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  resetErrorBoundary: () => void;
  componentName?: string;
}

/**
 * Default fallback component for error boundaries
 */
export function DefaultErrorFallback({
  error,
  errorInfo,
  resetErrorBoundary,
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
          
          {/* Show error details in development */}
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
                    {errorInfo.componentStack.split('\n').slice(0, 10).join('\n')}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="mt-4 flex gap-3">
            <Button
              size="sm"
              onClick={resetErrorBoundary}
              className="inline-flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EnhancedErrorBoundaryProps {
  /**
   * The components to render
   */
  children: ReactNode;
  
  /**
   * Custom fallback component to render when an error occurs
   */
  fallback?: React.ComponentType<FallbackProps>;
  
  /**
   * Callback function called when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Props that will trigger a reset of the error boundary when they change
   */
  resetKeys?: any[];
  
  /**
   * Name of the component wrapped by the error boundary (for better error reporting)
   */
  componentName?: string;
  
  /**
   * Whether to log errors to the error tracking system
   */
  logErrors?: boolean;
}

interface EnhancedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Enhanced error boundary component with improved error reporting and recovery options
 */
export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error info
    this.setState({ errorInfo });

    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to tracking system if enabled
    if (this.props.logErrors !== false) {
      const context = {
        componentName: this.props.componentName || 'Unknown',
        componentStack: errorInfo.componentStack,
        url: typeof window !== 'undefined' ? window.location.href : '',
      };
      
      logError(error, context);
    }
  }

  componentDidUpdate(prevProps: EnhancedErrorBoundaryProps): void {
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

  resetErrorBoundary(): void {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: FallbackComponent, componentName } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided, otherwise use default
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            resetErrorBoundary={this.resetErrorBoundary}
            componentName={componentName}
          />
        );
      }

      // Use default fallback
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          resetErrorBoundary={this.resetErrorBoundary}
          componentName={componentName}
        />
      );
    }

    return children;
  }
}

/**
 * Higher-order component that wraps a component with an enhanced error boundary
 */
export function withEnhancedErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<EnhancedErrorBoundaryProps, 'children'> = {}
): React.ComponentType<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  const componentName = errorBoundaryProps.componentName || displayName;

  const ComponentWithErrorBoundary = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps} componentName={componentName}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withEnhancedErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

export default EnhancedErrorBoundary;
