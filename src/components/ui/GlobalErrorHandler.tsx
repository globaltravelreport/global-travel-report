"use client";

import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Wifi, ServerCrash, Lock, FileWarning } from 'lucide-react';
import { ErrorType } from '@/src/utils/error-handler';
import { cn } from '@/src/lib/utils';

interface GlobalErrorHandlerProps {
  /**
   * Children to render
   */
  children: React.ReactNode;
}

/**
 * Error state interface
 */
interface ErrorState {
  visible: boolean;
  message: string;
  type: ErrorType;
  timestamp: number;
}

/**
 * Global error context
 */
export const GlobalErrorContext = React.createContext<{
  showError: (message: string, type?: ErrorType) => void;
  clearError: () => void;
}>({
  showError: () => {},
  clearError: () => {},
});

/**
 * Hook to use the global error context
 */
export const useGlobalError = () => React.useContext(GlobalErrorContext);

/**
 * Global error handler component
 * 
 * This component provides a global error handling mechanism for the application.
 * It displays error messages in a toast-like notification and provides a context
 * for showing and clearing errors from anywhere in the application.
 */
export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  const [error, setError] = useState<ErrorState>({
    visible: false,
    message: '',
    type: ErrorType.UNKNOWN,
    timestamp: 0,
  });
  
  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error.visible) {
      const timer = setTimeout(() => {
        setError(prev => ({ ...prev, visible: false }));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error.visible, error.timestamp]);
  
  // Show error
  const showError = (message: string, type: ErrorType = ErrorType.UNKNOWN) => {
    setError({
      visible: true,
      message,
      type,
      timestamp: Date.now(),
    });
  };
  
  // Clear error
  const clearError = () => {
    setError(prev => ({ ...prev, visible: false }));
  };
  
  // Get icon based on error type
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return <Wifi className="h-5 w-5" />;
      case ErrorType.API:
      case ErrorType.DATABASE:
        return <ServerCrash className="h-5 w-5" />;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return <Lock className="h-5 w-5" />;
      case ErrorType.VALIDATION:
        return <FileWarning className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };
  
  // Get background color based on error type
  const getErrorBackground = () => {
    switch (error.type) {
      case ErrorType.VALIDATION:
        return 'bg-amber-100 border-amber-500 text-amber-800';
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return 'bg-blue-100 border-blue-500 text-blue-800';
      case ErrorType.NOT_FOUND:
        return 'bg-purple-100 border-purple-500 text-purple-800';
      default:
        return 'bg-red-100 border-red-500 text-red-800';
    }
  };
  
  return (
    <GlobalErrorContext.Provider value={{ showError, clearError }}>
      {children}
      
      {/* Error toast */}
      <div
        className={cn(
          'fixed bottom-4 right-4 z-50 max-w-md transition-all duration-300 transform',
          error.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        )}
      >
        <div
          className={cn(
            'rounded-lg border p-4 shadow-lg flex items-start',
            getErrorBackground()
          )}
        >
          <div className="flex-shrink-0 mr-3">
            {getErrorIcon()}
          </div>
          <div className="flex-1 mr-2">
            <p className="font-medium">{error.message}</p>
          </div>
          <button
            onClick={clearError}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </GlobalErrorContext.Provider>
  );
}
