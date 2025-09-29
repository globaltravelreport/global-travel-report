'use client';

import { CookieConsentBanner, useCookieConsent } from '../src/components/ui/CookieConsentBanner';

export function ClientLayoutWrapper() {
  const { canUseAnalytics } = useCookieConsent();

  const handleAccept = (preferences: any) => {
    console.log('Cookie preferences accepted:', preferences);
    // Handle cookie acceptance logic here
  };

  const handleReject = () => {
    console.log('Cookie preferences rejected');
    // Handle cookie rejection logic here
  };

  return (
    <CookieConsentBanner
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
}