'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useCookieConsent } from '../ui/CookieConsentBanner';
import { initializeGA, GA_TRACKING_ID } from '../../lib/analytics';

interface GoogleAnalyticsProps {
  gaId?: string;
}

export function GoogleAnalytics({ gaId = GA_TRACKING_ID }: GoogleAnalyticsProps) {
  const { canUseAnalytics, hasConsented } = useCookieConsent();

  useEffect(() => {
    console.log('GA component: hasConsented=', hasConsented, 'canUseAnalytics=', canUseAnalytics);
    // Only initialize GA if user has consented to analytics cookies
    if (hasConsented && canUseAnalytics) {
      console.log('GA: Initializing GA');
      initializeGA();
    }
  }, [hasConsented, canUseAnalytics]);

  // Only load the script if consent is given
  if (!hasConsented || !canUseAnalytics) {
    return null;
  }

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      strategy="afterInteractive"
      onLoad={() => {
        console.log('GA script loaded');
      }}
      onError={() => {
        console.log('GA script failed to load');
      }}
    />
  );
}

// Re-export utility functions
export {
  trackEvent,
  trackPageView,
  trackAffiliateClick,
  trackStoryEngagement
} from '../../lib/analytics';