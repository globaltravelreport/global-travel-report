import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import { cn } from '@/utils/cn';
import { AccessibilityProvider, SkipToContent } from '@/src/components/accessibility/AccessibilityProvider';
import { WebVitalsTracker } from '@/src/components/analytics/WebVitalsTracker';
import AITravelAssistantMount from '@/src/components/experimental/AITravelAssistantMount';
import { Suspense } from 'react';
import { SearchParamsProvider } from '@/src/components/ui/SearchParamsProvider';
 
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com'),
  title: {
    default: 'Global Travel Report - Your Ultimate Travel Companion',
    template: '%s | Global Travel Report',
  },
  description: 'Discover amazing travel destinations, insider tips, and inspiring stories from around the world. Your ultimate guide to unforgettable adventures.',
  keywords: ['travel', 'destinations', 'travel tips', 'travel guide', 'adventure', 'vacation', 'tourism'],
  authors: [{ name: 'Global Travel Report Team' }],
  creator: 'Global Travel Report',
  publisher: 'Global Travel Report',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com',
    siteName: 'Global Travel Report',
    title: 'Global Travel Report - Your Ultimate Travel Companion',
    description: 'Discover amazing travel destinations, insider tips, and inspiring stories from around the world.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com'}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Global Travel Report',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'Global Travel Report - Your Ultimate Travel Companion',
    description: 'Discover amazing travel destinations, insider tips, and inspiring stories from around the world.',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com'}/images/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com',
    languages: {
      'en-US': process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com',
    },
  },
  category: 'travel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://globaltravelreport.com';
  
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <meta name="theme-color" content="#19273A" />
        <meta name="msapplication-TileColor" content="#19273A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Global Travel Report" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Global Travel Report',
              url: baseUrl,
              logo: `${baseUrl}/images/logo.png`,
              description: 'Your ultimate travel companion for discovering amazing destinations and travel tips.',
              sameAs: [
                'https://twitter.com/globaltravelreport',
                'https://facebook.com/globaltravelreport',
                'https://instagram.com/globaltravelreport',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-555-0123',
                contactType: 'customer service',
                availableLanguage: 'English'
              }
            })
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Global Travel Report',
              url: baseUrl,
              description: 'Discover amazing travel destinations, insider tips, and inspiring stories from around the world.',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${baseUrl}/search?q={search_term_string}`,
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
      </head>
      <body className={cn(inter.className, 'antialiased')}>
        <AccessibilityProvider>
          <SkipToContent />
          <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main id="main-content" className="flex-1">
                <Suspense fallback={null}>
                  <SearchParamsProvider fallback={null}>
                    {children}
                  </SearchParamsProvider>
                </Suspense>
              </main>
              <Footer />
            </div>
            <Toaster />
          </ErrorBoundary>
          <AITravelAssistantMount />
          <Suspense fallback={null}>
            <WebVitalsTracker />
          </Suspense>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
