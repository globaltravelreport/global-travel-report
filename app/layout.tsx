import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import GoogleAnalytics from './components/GoogleAnalytics'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#000000',
}

// Base metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL('https://globaltravelreport.com'),
  title: {
    default: 'Global Travel Report - Travel News, Stories & Guides',
    template: '%s | Global Travel Report'
  },
  description: 'Stay informed with the latest travel news, stories, and guides from around the world. Discover destinations, travel tips, and insider experiences.',
  keywords: ['travel news', 'travel stories', 'travel guides', 'destinations', 'travel tips'],
  authors: [{ name: 'Global Travel Report Team' }],
  openGraph: {
    type: 'website',
    siteName: 'Global Travel Report',
    title: 'Global Travel Report - Travel News, Stories & Guides',
    description: 'Stay informed with the latest travel news, stories, and guides from around the world.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Global Travel Report'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelrpt',
    creator: '@globaltravelrpt',
    title: 'Global Travel Report',
    description: 'Latest travel news, stories & guides',
    images: ['/images/twitter-image.jpg']
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  creator: 'Global Travel Report',
  publisher: 'Global Travel Report',
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://www.globaltravelreport.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Global Travel Report',
              url: 'https://www.globaltravelreport.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://www.globaltravelreport.com/search?q={search_term_string}'
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Global Travel Report',
              url: 'https://www.globaltravelreport.com',
              logo: 'https://www.globaltravelreport.com/images/logo.png',
              sameAs: [
                'https://twitter.com/globaltravelreport',
                'https://www.facebook.com/globaltravelreport',
                'https://www.instagram.com/globaltravelreport',
                'https://www.linkedin.com/company/globaltravelreport'
              ]
            })
          }}
        />
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-10453772720" />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-10453772720');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <Navigation />
          {children}
          <Footer />
          <GoogleAnalytics />
          <Toaster position="top-right" />
          <Analytics />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  )
} 