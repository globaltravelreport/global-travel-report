import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { SkipToContent } from '@/components/ui/SkipToContent'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { BackToTop } from '@/components/ui/BackToTop'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { Toaster } from '../components/ui/toaster'
import Script from 'next/script'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: {
    default: 'Global Travel Report - Travel Stories & Inspiration',
    template: '%s | Global Travel Report',
  },
  description: 'Discover travel stories, tips, and inspiration from around the world. Explore destinations, hotels, airlines, and more.',
  keywords: ['travel', 'stories', 'destinations', 'hotels', 'airlines', 'cruises'],
  authors: [{ name: 'Rodney & Nuch' }],
  creator: 'Rodney & Nuch',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://globaltravelreport.com',
    siteName: 'Global Travel Report',
    title: 'Global Travel Report - Travel Stories & Inspiration',
    description: 'Discover travel stories, tips, and inspiration from around the world.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Global Travel Report - Travel Stories & Inspiration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Travel Report - Travel Stories & Inspiration',
    description: 'Discover travel stories, tips, and inspiration from around the world.',
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://globaltravelreport.com',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://globaltravelreport.com'),
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
    <html lang="en" className={inter.variable}>
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Global Travel Report',
              url: 'https://globaltravelreport.com',
              description: 'Discover travel stories, tips, and inspiration from around the world.',
              publisher: {
                '@type': 'Organization',
                name: 'Global Travel Report',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://globaltravelreport.com/logo-gtr.png',
                },
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://globaltravelreport.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </body>
    </html>
  )
} 