import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

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
      <head>
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
      <body className={`${inter.className} bg-gray-50`}>
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