'use client';

import Script from 'next/script';
import { useEffect } from 'react';

const GA_MEASUREMENT_ID = 'G-K8BJQ43XFT'; // GA4 Measurement ID for Global Travel Report (Stream ID: 10453772720)

export default function GoogleAnalytics() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', GA_MEASUREMENT_ID);
    }
  }, []);

  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
    </>
  );
}

// Add type declaration for window.dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
} 