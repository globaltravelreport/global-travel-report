import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Global Travel Report',
  description: 'Your trusted source for travel news, reviews, and tips',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  if (!recaptchaKey) {
    console.error('Warning: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set in environment variables');
  }

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {/* Google Analytics - Production Only */}
        {process.env.NODE_ENV === 'production' && (
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
        )}
        <GoogleReCaptchaProvider
          reCaptchaKey={recaptchaKey || 'missing-key'}
          scriptProps={{
            async: false,
            defer: false,
            appendTo: 'head',
            nonce: undefined,
          }}
        >
          <Navigation />
          {children}
          <Footer />
        </GoogleReCaptchaProvider>
      </body>
    </html>
  )
} 