'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useCookieConsent } from '../ui/CookieConsentBanner';

interface GoogleAnalyticsProps {
  gaId?: string;
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const { canUseAnalytics, hasConsented } = useCookieConsent();
  const [shouldLoadGA, setShouldLoadGA] = useState(false);

  useEffect(() => {
    console.log('GA component: hasConsented=', hasConsented, 'canUseAnalytics=', canUseAnalytics);

    // Only load GA after user has consented to analytics
    if (hasConsented && canUseAnalytics && gaId) {
      console.log('GA: User consented to analytics, loading GA script');
      setShouldLoadGA(true);

      // Set up gtag function
      if (typeof window !== 'undefined' && !window.gtag) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function(...args) {
          window.dataLayer.push(args);
        };
      }

      // Set consent to granted
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
          ad_storage: 'denied',
        });
      }
    } else if (hasConsented && !canUseAnalytics) {
      console.log('GA: User declined analytics');
      // Keep default denied state
    }
  }, [hasConsented, canUseAnalytics, gaId]);

  // Only render GA script after consent
  if (!shouldLoadGA || !gaId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('GA: Script loaded, initializing GA');
          // Initialize GA after script loads
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('js', new Date());
            window.gtag('config', gaId, {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              anonymize_ip: true,
              allow_ad_features: false,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
            });
          }
        }}
        onError={() => {
          console.log('GA: Script failed to load');
        }}
      />
    </>
  );
}

// Re-export utility functions
export {
  trackEvent,
  trackPageView,
  trackAffiliateClick,
  trackStoryEngagement
} from '../../lib/analytics';