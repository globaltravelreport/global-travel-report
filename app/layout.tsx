import './globals.css'
import WebsiteSchema from './components/WebsiteSchema'
import OrganizationSchema from './components/OrganizationSchema'
import SearchBar from './components/SearchBar'
import ScrollHeader from './components/ScrollHeader'

export const metadata = {
  title: 'Global Travel Report | Travel Insights & Stories',
  description: 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Global Travel Report | Travel Insights & Stories',
    description: 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
    url: 'https://globaltravelreport.com',
    siteName: 'Global Travel Report',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Travel Report | Travel Insights & Stories',
    description: 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
    creator: '@globaltravelreport',
  },
  alternates: {
    canonical: 'https://globaltravelreport.com',
  },
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
    <html lang="en">
      <head>
        <WebsiteSchema />
        <OrganizationSchema />
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          {/* Skip to content link for accessibility */}
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to content
          </a>

          {/* Modern Scroll Header */}
          <ScrollHeader />

          {/* Main Content */}
          <main id="main-content" className="flex-grow">
            {children}
          </main>

          {/* Enhanced Footer */}
          <footer className="bg-brand-dark text-white pt-10 pb-6">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* About Section */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-brand-gold">About Us</h3>
                  <p className="text-gray-300 mb-4">
                    Global Travel Report is your trusted source for travel insights, destination guides, and inspiring stories from around the world.
                  </p>
                  <a href="/about" className="text-brand-gold hover:text-brand-lightGold transition-colors duration-200">
                    Learn more →
                  </a>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-brand-gold">Quick Links</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <a href="/" className="hover:text-brand-gold transition-colors duration-200">Home</a>
                    </li>
                    <li>
                      <a href="/categories" className="hover:text-brand-gold transition-colors duration-200">Categories</a>
                    </li>
                    <li>
                      <a href="/about" className="hover:text-brand-gold transition-colors duration-200">About</a>
                    </li>
                    <li>
                      <a href="/contact" className="hover:text-brand-gold transition-colors duration-200">Contact</a>
                    </li>
                  </ul>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-brand-gold">Contact Us</h3>
                  <p className="text-gray-300 mb-2">
                    Email: <a href="mailto:editorial@globaltravelreport.com" className="text-brand-gold hover:text-brand-lightGold">editorial@globaltravelreport.com</a>
                  </p>
                  <p className="text-gray-300 mb-4">
                    Location: Sydney, Australia
                  </p>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-center text-brand-gold">Follow Us</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="https://www.facebook.com/globaltravelreport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors duration-300"
                    aria-label="Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/GTravelReport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors duration-300"
                    aria-label="X (Twitter)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tumblr.com/blog/globaltravelreport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#36465D] flex items-center justify-center hover:bg-[#4A5C7B] transition-colors duration-300"
                    aria-label="Tumblr"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.512 17.489l-.096-.068h-3.274c-.153 0-.16-.467-.163-.622v-5.714c0-.056.045-.101.101-.101h3.82c.056 0 .101-.045.101-.101v-3.766c0-.056-.045-.101-.101-.101h-3.803c-.056 0-.101-.045-.101-.101v-4.816c0-.056-.045-.101-.101-.101h-3.278c-.056 0-.101.045-.101.101v4.98c0 .056-.045.101-.101.101h-2.88c-.056 0-.101.045-.101.101v3.708c0 .056.045.101.101.101h2.88c.056 0 .101.045.101.101v6.705c0 .712.074 1.259.223 1.689.148.43.396.792.741 1.087.345.295.795.535 1.35.72.554.185 1.2.278 1.932.278h1.089c.326 0 .662-.034 1.005-.1.344-.067.665-.164.964-.29.3-.126.562-.275.786-.447.224-.173.365-.351.424-.533l.171-.571c.021-.068.011-.137-.028-.193z" />
                    </svg>
                  </a>
                  <a
                    href="https://medium.com/@editorial_31000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors duration-300"
                    aria-label="Medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/globaltravelreport/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center hover:bg-[#0069A6] transition-colors duration-300"
                    aria-label="LinkedIn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@GlobalTravelReport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors duration-300"
                    aria-label="YouTube"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@globaltravelreport"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors duration-300"
                    aria-label="TikTok"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Copyright */}
              <div className="pt-6 border-t border-gray-800 text-center text-gray-400">
                <p>© {new Date().getFullYear()} Global Travel Report. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}