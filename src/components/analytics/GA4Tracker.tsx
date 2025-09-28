'use client';

/**
 * Google Analytics 4 Tracker Component
 *
 * Client-side component for tracking page views and events with GA4
 */

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface GA4TrackerProps {
  children?: React.ReactNode;
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
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
      });
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

/**
 * Newsletter signup event tracker
 */
export function trackNewsletterSignup(source: string = 'website') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'newsletter_signup', {
      event_category: 'engagement',
      event_label: source,
    });
  }
}

/**
 * Affiliate click event tracker
 */
export function trackAffiliateClick(productId: string, provider: string, source: string = 'website') {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'affiliate_click', {
      event_category: 'monetization',
      event_label: productId,
      value: provider,
      custom_parameter: source,
    });
  }
}

/**
 * Story engagement tracker
 */
export function trackStoryEngagement(
  storyId: string,
  action: 'view' | 'comment' | 'reaction' | 'share',
  metadata?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'story_engagement', {
      event_category: 'content',
      event_label: storyId,
      action: action,
      ...metadata,
    });
  }
}

/**
 * Search event tracker
 */
export function trackSearch(query: string, resultsCount?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      event_category: 'navigation',
      search_term: query,
      results_count: resultsCount,
    });
  }
}