"use client";

import React, { ErrorInfo } from 'react';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

interface GlobalErrorHandlerState {
  hasError: boolean;
  error?: Error;
}

// Global error context
export const GlobalErrorContext = React.createContext<{
  setError: (error: Error) => void;
  clearError: () => void;
  showError: (error: Error) => void;
}>({
  setError: () => {},
  clearError: () => {},
  showError: () => {},
});

// Hook to use global error
export const useGlobalError = () => {
  const context = React.useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
};

export class GlobalErrorHandler extends React.Component<GlobalErrorHandlerProps, GlobalErrorHandlerState> {
  constructor(props: GlobalErrorHandlerProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorHandlerState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but there was an error loading this page. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="mt-6">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
