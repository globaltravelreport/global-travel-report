'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * A client component that wraps its children in a Suspense boundary
 * This is useful for components that use hooks like useSearchParams
 *
 * @param props - Component props
 * @returns A client component with a Suspense boundary
 */
export function ClientSuspense({
  children,
  fallback = <div>Loading...</div>
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  // This component is a client component that safely handles useSearchParams
  // by wrapping it in a Suspense boundary
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
      {children}
    </Suspense>
  );
}

/**
 * A client component that wraps its children in a Suspense boundary with a loading skeleton
 *
 * @param props - Component props
 * @returns A client component with a Suspense boundary and loading skeleton
 */
export function ClientSuspenseWithSkeleton({
  children,
  height = '200px'
}: {
  children: React.ReactNode;
  height?: string;
}) {
  return (
    <Suspense fallback={<LoadingSkeleton height={height} />}>
      {children}
    </Suspense>
  );
}

/**
 * A simple loading skeleton component
 *
 * @param props - Component props
 * @returns A loading skeleton component
 */
function LoadingSkeleton({ height }: { height: string }) {
  return (
    <div
      className="animate-pulse bg-gray-200 rounded-md w-full"
      style={{ height }}
    />
  );
}

/**
 * A client component that wraps a component that uses useSearchParams
 * This is a higher-order component (HOC) that adds a Suspense boundary
 *
 * @param Component - The component to wrap
 * @returns A wrapped component with a Suspense boundary
 */
export function withClientSuspense<T>(Component: React.ComponentType<T>) {
  return function WithClientSuspense(props: T) {
    return (
      <ClientSuspense>
        <Component {...props} />
      </ClientSuspense>
    );
  };
}

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
  // This will be properly wrapped in a Suspense boundary by the parent
  const searchParams = React.useMemo(() => {
    // Only run on the client
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams();
  }, []);

  return <>{children(searchParams)}</>;
}

/**
 * A client component that safely uses useSearchParams and provides the search params to its children
 *
 * @param props - Component props
 * @returns A component that safely uses useSearchParams
 */
export function SafeSearchParamsProvider({
  children
}: {
  children: (searchParams: URLSearchParams) => React.ReactNode;
}) {
  return (
    <ClientSuspense>
      <SearchParamsProvider>
        {children}
      </SearchParamsProvider>
    </ClientSuspense>
  );
}
