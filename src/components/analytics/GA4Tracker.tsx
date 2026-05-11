'use client';

/**
 * Google Analytics 4 Tracker Component
 * 
 * Client-side component for tracking page views and events with GA4
 */
import { useEffect, ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GA_TRACKING_ID } from '../../lib/analytics';

interface GA4TrackerProps {
  children?: ReactNode;
}

export function GA4Tracker({ children }: GA4TrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view only if GA is loaded and user has consented
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('GA4Tracker: Tracking page view', pathname);
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
