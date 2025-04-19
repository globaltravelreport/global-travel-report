'use client';

import Script from 'next/script';

export default function Analytics() {
  // Only render in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-10453772720"
        strategy="afterInteractive"
      />
      <Script id="ga4-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-10453772720');
        `}
      </Script>
    </>
  );
} 