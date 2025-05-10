'use client';

import { ClientSuspense } from '@/src/components/ui/ClientSuspense';
import HomePage from './page';

/**
 * Client component wrapper for the home page
 * This component wraps the home page in a ClientSuspense boundary
 * to handle useSearchParams safely
 */
export default function HomePageWrapper() {
  return (
    <ClientSuspense>
      <HomePage />
    </ClientSuspense>
  );
}
