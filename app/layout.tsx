import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import GoogleAnalytics from './components/GoogleAnalytics'
import ReCaptchaProvider from './components/ReCaptchaProvider'

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
        <GoogleAnalytics />
        <ReCaptchaProvider>
          <Navigation />
          {children}
          <Footer />
        </ReCaptchaProvider>
      </body>
    </html>
  )
} 