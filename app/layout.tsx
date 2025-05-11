import './globals.css'

export const metadata = {
  title: 'Global Travel Report | Travel Insights & Stories',
  description: 'Your trusted source for global travel insights, destination guides, and inspiring stories from around the world.',
  icons: {
    icon: '/favicon.svg',
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
      <body>
        <div className="flex flex-col min-h-screen">
          {/* Skip to content link for accessibility */}
          <a href="#main-content" className="sr-only focus:not-sr-only">
            Skip to content
          </a>

          {/* Enhanced Header */}
          <header className="bg-brand-dark text-white py-4 shadow-md">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
              {/* Logo */}
              <a href="/" className="flex items-center mb-4 md:mb-0 group">
                <span className="text-2xl font-bold tracking-tight">
                  <span className="text-white">Global Travel</span>
                  <span className="text-brand-gold"> Report</span>
                </span>
              </a>

              {/* Navigation */}
              <nav className="w-full md:w-auto">
                <ul className="flex flex-wrap justify-center md:justify-end space-x-1 md:space-x-6">
                  <li>
                    <a
                      href="/"
                      className="px-3 py-2 text-sm md:text-base font-medium hover:text-brand-gold transition-colors duration-200 relative group"
                    >
                      Home
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/about"
                      className="px-3 py-2 text-sm md:text-base font-medium hover:text-brand-gold transition-colors duration-200 relative group"
                    >
                      About
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      className="px-3 py-2 text-sm md:text-base font-medium hover:text-brand-gold transition-colors duration-200 relative group"
                    >
                      Contact
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </header>

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
                  <p className="text-gray-300">
                    Location: Sydney, Australia
                  </p>
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