import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import GoogleAnalytics from './components/GoogleAnalytics'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#000000',
}

// Base metadata configuration
export const metadata: Metadata = {
  title: 'Global Travel Report',
  description: 'Your trusted source for travel news, reviews, tips and exclusive deals.',
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://www.globaltravelreport.com'),
  keywords: ['travel', 'news', 'reviews', 'tips', 'destinations', 'deals'],
  authors: [{ name: 'Global Travel Report' }],
  creator: 'Global Travel Report',
  publisher: 'Global Travel Report',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Global Travel Report',
    description: 'Your trusted source for travel news, reviews, tips and exclusive deals.',
    url: 'https://www.globaltravelreport.com',
    siteName: 'Global Travel Report',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.globaltravelreport.com/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Global Travel Report',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Travel Report',
    description: 'Your trusted source for travel news, reviews, tips and exclusive deals.',
    creator: '@globaltravelreport',
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
        </AuthProvider>
      </body>
    </html>
  )
} 