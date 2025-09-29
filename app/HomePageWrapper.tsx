'use client';

import { Suspense } from 'react';
import HomePage from './page';

/**
 * Client component wrapper for the home page
 * This component wraps the home page in a ClientSuspense boundary
 * to handle useSearchParams safely
 */
export default function HomePageWrapper() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
