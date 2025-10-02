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

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function GA4Tracker({ children }: GA4TrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      console.log('GA4Tracker: Tracking page view', pathname);
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || GA_TRACKING_ID, {
        page_path: url,
      });
    } else {
      console.log('GA4Tracker: gtag not available');
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

/**
 * Hook for tracking custom events
 */
export function useGA4() {
  const trackEvent = (
    eventName: string,
    parameters: {
      category?: string;
      label?: string;
      value?: number;
      [key: string]: any;
    } = {}
  ) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: parameters.category,
        event_label: parameters.label,
        value: parameters.value,
        ...parameters,
      });
    }
  };

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }
  };

  return {
    trackEvent,
    trackPageView,
  };
}

// Re-export utility functions from lib/analytics
export {
  trackNewsletterSignup,
  trackAffiliateClick,
  trackStoryEngagement,
  trackSearch,
  trackEvent,
  trackPageView,
  trackInteraction
} from '../../lib/analytics';