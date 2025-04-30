"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";

declare global {
  interface Window {
    gtag: (command: string, ...args: (string | object)[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
    if (typeof window.gtag === "function" && analyticsId) {
      window.gtag("config", analyticsId, {
        page_path: pathname + searchParams.toString(),
      });
    }
  }, [pathname, searchParams]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}', {
              page_path: window.location.pathname,
            });
          `),
        }}
      />
      <noscript>
        <iframe
          title="Google Analytics"
          src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}