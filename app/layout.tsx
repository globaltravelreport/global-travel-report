import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SkipToContent } from '@/src/components/ui/SkipToContent'
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary'
import { GlobalErrorHandler } from '@/src/components/ui/GlobalErrorHandler'
import { BackToTop } from '@/src/components/ui/BackToTop'
import { GoogleAnalytics } from '@/src/components/analytics/GoogleAnalytics'
import { CookieConsent } from '@/src/components/ui/CookieConsent'
import { Toaster } from '@/src/components/ui/toaster'
import Script from 'next/script'
import { ThemeProvider } from '@/src/components/theme-provider'
import DOMPurify from 'isomorphic-dompurify'

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
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Global Travel Report',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Travel Report | Travel Insights & Stories',
    description: 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
    site: '@GTravelReport',
    creator: '@GTravelReport',
    images: ['/images/twitter-image.jpg'],
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4005772594728149"
          crossOrigin="anonymous"
          strategy="afterInteractive"
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
              <SkipToContent />
              <div className="flex flex-col min-h-screen">
                <Header />
                <main id="main-content" className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
              <BackToTop />
              <CookieConsent />
              <GoogleAnalytics />
              <Toaster />
            </GlobalErrorHandler>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}