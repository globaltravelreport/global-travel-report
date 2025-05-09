'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams as useNextSearchParams } from 'next/navigation';

/**
 * A component that safely uses useSearchParams inside a client component
 * This is an internal component used by SafeSearchParamsProvider
 */
function SearchParamsContent({ children }: { children: React.ReactNode }) {
  // Use Next.js useSearchParams hook - this must be called directly in a Client Component
  // and cannot be called conditionally
  // We don't need to use the return value, just need to call the hook to satisfy Next.js requirements
  useNextSearchParams();

  return <>{children}</>;
}

/**
 * A client component that safely uses useSearchParams
 * This component should be used in place of direct useSearchParams calls
 *
 * @param props - Component props
 * @returns A component that safely uses useSearchParams
 */
export function SearchParamsProvider({
  children,
  fallback = <div>Loading...</div>
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <SearchParamsContent>
        {children}
      </SearchParamsContent>
    </Suspense>
  );
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
  children: React.ReactNode;
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
    <SearchParamsProvider fallback={fallback}>
      {children}
    </SearchParamsProvider>
  );
}

/**
 * A hook that safely uses useSearchParams
 * This hook should be used in place of direct useSearchParams calls
 *
 * IMPORTANT: This hook must be used inside a component wrapped with SafeSearchParamsProvider
 * or inside a component that is a child of SafeSearchParamsProvider
 *
 * @returns URLSearchParams object or null if not available
 */
export function useSafeSearchParams(): URLSearchParams | null {
  // Always call the hook unconditionally to follow React's rules of hooks
  // This will throw an error if not used inside a Client Component that's properly
  // wrapped in a Suspense boundary
  const nextSearchParams = useNextSearchParams();

  // Handle server-side rendering or cases where the hook returns null
  if (typeof window === 'undefined' || !nextSearchParams) {
    // Return an empty URLSearchParams object on the server
    return new URLSearchParams();
  }

  return nextSearchParams;
}

/**
 * A higher-order component (HOC) that wraps a component with SafeSearchParamsProvider
 * This ensures that the component has access to the search params and is properly
 * wrapped in a Suspense boundary
 *
 * @param Component - The component to wrap
 * @returns A wrapped component with SafeSearchParamsProvider
 */
export function withSafeSearchParams<P extends object>(
  Component: React.ComponentType<P & { searchParams: URLSearchParams }>
): React.FC<P> {
  // Define a client component that will be wrapped with SafeSearchParamsProvider
  function WithSafeSearchParams(props: P) {
    // Create a wrapper component that uses the search params
    function ComponentWithSearchParams() {
      // Get the search params from the URL
      const searchParams = useNextSearchParams();
      // Pass the search params to the wrapped component
      return <Component {...props} searchParams={searchParams || new URLSearchParams()} />;
    }

    // Wrap the component with SafeSearchParamsProvider to ensure proper Suspense boundary
    return (
      <SafeSearchParamsProvider>
        <ComponentWithSearchParams />
      </SafeSearchParamsProvider>
    );
  }

  // Add display name for debugging
  WithSafeSearchParams.displayName = `withSafeSearchParams(${Component.displayName || Component.name || 'Component'})`;

  return WithSafeSearchParams;
}
