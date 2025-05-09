import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SkipToContent } from '@/src/components/ui/SkipToContent'
import ErrorBoundary from '@/components/ErrorBoundary'
import { GlobalErrorHandler } from '@/src/components/ui/GlobalErrorHandler'
import { BackToTop } from '@/src/components/ui/BackToTop'
import { GoogleAnalytics } from '@/src/components/analytics/GoogleAnalytics'
import { WebVitalsTracker } from '@/src/components/analytics/WebVitalsTracker'
import { CookieConsent } from '@/src/components/ui/CookieConsent'
import { Toaster } from '@/src/components/ui/toaster'
import Script from 'next/script'
import { ThemeProvider } from '@/src/components/theme-provider'
import DOMPurify from 'isomorphic-dompurify'
import { Suspense } from 'react'
import { SafeSearchParamsProvider } from '@/src/components/ui/SearchParamsProvider'
import AccessibilityProvider from '@/src/components/ui/AccessibilityProvider'
import AccessibilityMenu from '@/src/components/ui/AccessibilityMenu'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Global Travel Report | Travel Insights & Stories',
    template: '%s | Global Travel Report'
  },
  description: 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
  applicationName: 'Global Travel Report',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'travel', 'stories', 'destinations', 'hotels', 'airlines', 'cruises',
    'travel guides', 'travel tips', 'travel news', 'travel blog',
    'international travel', 'luxury travel', 'adventure travel',
    'family travel', 'budget travel', 'travel planning'
  ],
  authors: [
    { name: 'Rodney Pattison', url: 'https://globaltravelreport.com/about' },
    { name: 'Editorial Team', url: 'https://globaltravelreport.com/about' }
  ],
  creator: 'Global Travel Report Editorial Team',
  publisher: 'Global Travel Report',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'en-AU': '/au',
    },
    types: {
      'application/rss+xml': [
        { url: '/api/feed/rss', title: 'Global Travel Report - All Stories' },
        { url: '/api/feed/rss?category=cruises', title: 'Global Travel Report - Cruise Stories' },
        { url: '/api/feed/rss?category=destinations', title: 'Global Travel Report - Destination Stories' },
      ],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com',
    title: 'Global Travel Report | Travel Insights & Stories',
    description: 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
    siteName: 'Global Travel Report',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com'}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Global Travel Report',
      },
    ],
  },
  // Add Facebook App ID for Facebook sharing
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '1122233334445556', // Replace with your actual Facebook App ID
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Travel Report | Travel Insights & Stories',
    description: 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
    site: '@GTravelReport',
    creator: '@GTravelReport',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com'}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Global Travel Report',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16' },
      { url: '/favicon-32x32.png', sizes: '32x32' },
    ],
    shortcut: '/favicon-16x16.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#5bbad5',
      },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || '',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '',
    },
  },
  category: 'travel',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#19273A' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth"
      dir="ltr"
    >
      <head>
        {/* Google AdSense Verification Meta Tag */}
        <meta name="google-adsense-account" content="ca-pub-4005772594728149" />

        {/* Accessibility Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Global Travel Report" />
        <meta name="apple-mobile-web-app-title" content="Global Travel Report" />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#19273A" />
        <meta name="msapplication-TileColor" content="#19273A" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-navbutton-color" content="#19273A" />

        {/* Performance Meta Tags */}
        <meta http-equiv="x-dns-prefetch-control" content="on" />
        <meta http-equiv="Accept-CH" content="DPR, Width, Viewport-Width" />
        <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />

        {/* Resource Hints for Performance Optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://unpkg.com" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" />

        {/* Preload Critical Assets */}
        <link rel="preload" href="/logo-gtr.png" as="image" />
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/images/texture-pattern.png" as="image" type="image/png" />

        {/* DNS Prefetch for External Resources */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://stats.g.doubleclick.net" />

        {/* Google AdSense Script - Primary Verification Method */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4005772594728149"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />

        {/* Facebook SDK */}
        <Script
          id="facebook-jssdk"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.fbAsyncInit = function() {
                FB.init({
                  appId: '${process.env.FACEBOOK_APP_ID || '1122233334445556'}',
                  xfbml: true,
                  version: 'v18.0'
                });
              };
              (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
              }(document, 'script', 'facebook-jssdk'));
            `
          }}
        />

        {/* RSS Feed Links */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Global Travel Report - All Stories"
          href="/api/feed/rss"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Global Travel Report - Cruise Stories"
          href="/api/feed/rss?category=cruises"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Global Travel Report - Destination Stories"
          href="/api/feed/rss?category=destinations"
        />

        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://globaltravelreport.com/#website',
                  'url': 'https://globaltravelreport.com/',
                  'name': 'Global Travel Report',
                  'description': 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
                  'publisher': {
                    '@type': 'Organization',
                    '@id': 'https://globaltravelreport.com/#organization',
                    'name': 'Global Travel Report',
                    'logo': {
                      '@type': 'ImageObject',
                      '@id': 'https://globaltravelreport.com/#logo',
                      'url': 'https://globaltravelreport.com/logo-gtr.png',
                      'width': 600,
                      'height': 60
                    }
                  },
                  'inLanguage': 'en-US',
                  'potentialAction': [
                    {
                      '@type': 'SearchAction',
                      'target': 'https://globaltravelreport.com/search?q={search_term_string}',
                      'query-input': 'required name=search_term_string'
                    }
                  ]
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://globaltravelreport.com/#organization',
                  'name': 'Global Travel Report',
                  'url': 'https://globaltravelreport.com/',
                  'logo': {
                    '@type': 'ImageObject',
                    '@id': 'https://globaltravelreport.com/#logo',
                    'url': 'https://globaltravelreport.com/logo-gtr.png',
                    'width': 600,
                    'height': 60
                  },
                  'contactPoint': {
                    '@type': 'ContactPoint',
                    'contactType': 'customer support',
                    'email': 'contact@globaltravelreport.com',
                    'url': 'https://globaltravelreport.com/contact'
                  },
                  'sameAs': [
                    'https://x.com/GTravelReport',
                    'https://www.facebook.com/globaltravelreport',
                    'https://medium.com/@editorial_31000',
                    'https://www.linkedin.com/company/globaltravelreport/',
                    'https://www.youtube.com/@GlobalTravelReport',
                    'https://www.tiktok.com/@globaltravelreport'
                  ]
                }
              ]
            })),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <GlobalErrorHandler>
              {/* Wrap the entire application in a Suspense boundary and SafeSearchParamsProvider */}
              {/* This ensures that useSearchParams() is properly handled throughout the app */}
              <Suspense fallback={<div className="p-4">Loading...</div>}>
                <SafeSearchParamsProvider>
                  <AccessibilityProvider>
                    <SkipToContent />
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main id="main-content" className="flex-grow">
                        {children}
                      </main>
                      <Footer />
                    </div>
                    <BackToTop />
                    <AccessibilityMenu />
                    <CookieConsent />
                    <GoogleAnalytics />
                    <WebVitalsTracker />
                    <Toaster />
                  </AccessibilityProvider>
                </SafeSearchParamsProvider>
              </Suspense>
            </GlobalErrorHandler>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}