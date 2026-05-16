'use client';

import { useEffect } from 'react';
import { CookieConsentBanner, useCookieConsent } from '../src/components/ui/CookieConsentBanner';

export function ClientLayoutWrapper() {
  const { canUseAnalytics: _canUseAnalytics } = useCookieConsent();

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
    </>
  );
}
