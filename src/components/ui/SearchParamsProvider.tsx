'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams as useNextSearchParams } from 'next/navigation';

/**
 * A client component that safely uses useSearchParams
 * This component should be used in place of direct useSearchParams calls
 * 
 * @param props - Component props
 * @returns A component that safely uses useSearchParams
 */
export function SearchParamsProvider({
  children
}: {
  children: (searchParams: URLSearchParams) => React.ReactNode;
}) {
  // Use Next.js useSearchParams hook
  const searchParams = useNextSearchParams();
  
  // Only render children when searchParams is available
  if (!searchParams) {
    return null;
  }

  return <>{children(searchParams)}</>;
}

/**
 * A client component that safely uses useSearchParams and provides the search params to its children
 * 
 * @param props - Component props
 * @returns A component that safely uses useSearchParams
 */
export function SafeSearchParamsProvider({
  children,
  fallback = <div>Loading...</div>
}: {
  children: (searchParams: URLSearchParams) => React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // This component is a client component that safely handles useSearchParams
  const [mounted, setMounted] = useState(false);
  
  // Use useEffect to ensure we're mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render children when mounted on the client
  if (!mounted) {
    return <>{fallback}</>;
  }

  // Safely use Suspense on the client
  return (
    <Suspense fallback={fallback}>
      <SearchParamsProvider>
        {children}
      </SearchParamsProvider>
    </Suspense>
  );
}

/**
 * A hook that safely uses useSearchParams
 * This hook should be used in place of direct useSearchParams calls
 * 
 * @returns URLSearchParams object or null if not available
 */
export function useSafeSearchParams(): URLSearchParams | null {
  // Only run on the client
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Use Next.js useSearchParams hook
    return useNextSearchParams();
  } catch (error) {
    console.error('Error using useSearchParams:', error);
    // Fallback to window.location.search
    return new URLSearchParams(window.location.search);
  }
}

/**
 * A higher-order component (HOC) that wraps a component with SafeSearchParamsProvider
 * 
 * @param Component - The component to wrap
 * @returns A wrapped component with SafeSearchParamsProvider
 */
export function withSafeSearchParams<P extends object>(
  Component: React.ComponentType<P & { searchParams: URLSearchParams }>
): React.FC<P> {
  return function WithSafeSearchParams(props: P) {
    return (
      <SafeSearchParamsProvider>
        {(searchParams) => <Component {...props} searchParams={searchParams} />}
      </SafeSearchParamsProvider>
    );
  };
}
