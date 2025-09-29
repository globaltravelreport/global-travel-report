'use client';

import { useEffect } from 'react';
import { useCookieConsent } from '../ui/CookieConsentBanner';

interface GoogleAnalyticsProps {
  gaId: string;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const { canUseAnalytics, hasConsented } = useCookieConsent();

  useEffect(() => {
    // Only load GA if user has consented to analytics cookies
    if (!hasConsented || !canUseAnalytics) {
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true,
      // Respect user privacy settings
      anonymize_ip: true,
      allow_ad_features: false,
    });

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [gaId, hasConsented, canUseAnalytics]);

  return null;
}

// Utility functions for tracking
export function trackEvent(eventName: string, parameters: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_title: pageTitle || document.title,
      page_location: window.location.origin + pagePath
    });
  }
}

export function trackAffiliateClick(partnerName: string, url: string) {
  trackEvent('affiliate_click', {
    event_category: 'affiliate',
    event_label: partnerName,
    affiliate_url: url,
    value: 1
  });
}

export function trackStoryEngagement(storySlug: string, action: string) {
  trackEvent('story_engagement', {
    event_category: 'content',
    event_label: storySlug,
    engagement_action: action,
    value: 1
  });
}