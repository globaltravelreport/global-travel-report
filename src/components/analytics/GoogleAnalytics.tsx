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

    // Set up gtag function if not already available
    if (typeof window !== 'undefined' && !window.gtag) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(...args) {
        window.dataLayer.push(args);
      };
    }

    // Set default consent state (deny analytics until user consents)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        functionality_storage: 'granted',
        personalization_storage: 'denied',
        security_storage: 'granted',
      });
    }

    // Update consent when user makes a choice
    if (hasConsented) {
      if (canUseAnalytics) {
        console.log('GA: Granting analytics consent');
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'denied', // Keep ads denied for now
          });
          // Now initialize GA
          initializeGA();
        }
      } else {
        console.log('GA: Analytics consent denied');
        // Keep denied state
      }
    }
  }, [hasConsented, canUseAnalytics]);

  // Always load the GA script so Tag Assistant can detect it
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