'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { reportWebVitals } from '@/utils/web-vitals';

/**
 * Web Vitals Tracker Component
 * 
 * This component tracks Web Vitals metrics for the current page.
 * It should be included in the app layout to track metrics for all pages.
 */
export function WebVitalsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Report Web Vitals on route change
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Use the Next.js reportWebVitals function
    const reportWebVitalsOnRouteChange = (metric: any) => {
      // Add the current URL to the metric
      const metricWithUrl = {
        ...metric,
        url,
      };
      
      // Report the metric
      reportWebVitals(metricWithUrl);
    };
    
    // Add the reportWebVitals function to the window object
    // This is used by Next.js to report Web Vitals metrics
    (window as any).reportWebVitals = reportWebVitalsOnRouteChange;
    
    return () => {
      // Clean up
      delete (window as any).reportWebVitals;
    };
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}

export default WebVitalsTracker;
