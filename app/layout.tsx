import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SkipToContent } from '@/components/ui/SkipToContent'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { BackToTop } from '@/components/ui/BackToTop'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { NewsletterSignup } from '@/components/ui/NewsletterSignup'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.globaltravelreport.com'),
  title: {
    default: 'Global Travel Report',
    template: '%s | Global Travel Report',
  },
  description: 'Discover amazing travel stories and share your own adventures with travelers worldwide.',
  openGraph: {
    title: 'Global Travel Report',
    description: 'Share and discover amazing travel stories from around the world',
    type: 'website',
    locale: 'en_US',
    siteName: 'Global Travel Report',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Travel Report',
    description: 'Share and discover amazing travel stories from around the world',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <SkipToContent />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <div className="bg-gray-50 py-12">
              <div className="container mx-auto px-4">
                <NewsletterSignup />
              </div>
            </div>
            <Footer />
          </div>
          <BackToTop />
          <CookieConsent />
          <GoogleAnalytics />
        </ErrorBoundary>
      </body>
    </html>
  )
} 