import type { ReactNode, ReactElement, ComponentType, FC } from 'react';

export interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: any;
  hasError: boolean;
}

export interface ErrorBoundaryOptions {
  onError?: (error: Error, errorInfo?: any, componentName?: string) => void;
  resetKeys?: any[];
  componentName?: string;
}

export interface FallbackProps {
  error: Error;
  errorInfo?: any;
  resetError: () => void;
  componentName?: string;
}

export interface ErrorBoundaryProps extends ErrorBoundaryOptions {
  children: ReactNode;
  fallback?: ReactElement | ((props: FallbackProps) => ReactElement);
}

export type WithErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  boundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => FC<P>;

export interface GlobalErrorContextType {
  error: Error | null;
  setError: (error: Error) => void;
  clearError: () => void;
  showError: (error: Error) => void;
}

export interface GlobalErrorHandlerProps {
  children: ReactNode;
  fallback?: ReactElement | ((props: FallbackProps) => ReactElement);
}
