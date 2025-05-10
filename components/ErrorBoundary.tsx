'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by boundary:', event.error);
      setHasError(true);
      
      // Log the error to a monitoring service if available
      // This would be your error logging service
      // logError('Client-side error', event.error);
    };

    // Add error event listener
    window.addEventListener('error', handleError);
    
    // Clean up
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          
          <p className="text-gray-600 mb-6">
            We're sorry, but something went wrong on this page. Our team has been notified and is working to fix the issue.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setHasError(false);
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            
            <Link
              href="/fallback"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-center"
            >
              Go to Fallback Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
