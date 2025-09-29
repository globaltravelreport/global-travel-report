'use client';

import { useEffect } from 'react';
import { CookieConsentBanner, useCookieConsent } from '../src/components/ui/CookieConsentBanner';
import { GoogleAnalytics } from '../src/components/analytics/GoogleAnalytics';

export function ClientLayoutWrapper() {
  const { canUseAnalytics } = useCookieConsent();

  useEffect(() => {
    const handleCookieConsent = (event: CustomEvent<{ preferences: any; action: string }>) => {
      const { preferences, action } = event.detail;
      console.log('Cookie preferences:', action, preferences);
      // Handle cookie consent logic here
    };

    window.addEventListener('cookieConsent', handleCookieConsent as EventListener);

    return () => {
      window.removeEventListener('cookieConsent', handleCookieConsent as EventListener);
    };
  }, []);

  return (
    <>
      <CookieConsentBanner />
      {/* Google Analytics - Only loads after consent is checked */}
      {process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </>
  );
}