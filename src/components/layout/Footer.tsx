import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#19273A] to-[#0F1824] text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-12">
              <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-300 max-w-md">
                Subscribe to our newsletter for the latest travel insights, exclusive deals, and destination guides.
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A14A] text-white w-full sm:w-64"
                />
                <button className="px-6 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About Section */}
          <div>
            <div className="flex items-center mb-6">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#19273A] border-2 border-[#C9A14A] flex items-center justify-center mr-3">
                <span className="text-[#C9A14A] font-bold text-lg">GTR</span>
              </div>
              <span className="font-bold text-xl text-white">Global Travel Report</span>
            </div>
            <p className="text-gray-300 mb-6">
              Based in Sydney, Australia, Global Travel Report brings you the latest travel news, insights, and stories from around the world.
            </p>
            <div className="flex items-center text-gray-300">
              <svg className="w-5 h-5 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>Sydney, Australia</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-12 after:h-0.5 after:bg-[#C9A14A] after:bottom-0 after:left-0 after:-mb-2 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-12 after:h-0.5 after:bg-[#C9A14A] after:bottom-0 after:left-0 after:-mb-2 pb-2">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/hotels" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="/categories/airlines" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Airlines
                </Link>
              </li>
              <li>
                <Link href="/categories/cruises" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Cruises
                </Link>
              </li>
              <li>
                <Link href="/categories/destinations" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/categories/travel-tips" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Travel Tips
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-xl font-semibold mb-6 text-white relative inline-block after:content-[''] after:absolute after:w-12 after:h-0.5 after:bg-[#C9A14A] after:bottom-0 after:left-0 after:-mb-2 pb-2">
              Connect With Us
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/globaltravelreport"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors group"
                aria-label="Facebook"
              >
                <svg className="h-6 w-6 text-[#C9A14A] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                </svg>
                <span className="mt-2 text-xs text-gray-400 group-hover:text-white transition-colors">Facebook</span>
              </a>

              {/* Twitter/X */}
              <a
                href="https://x.com/GTravelReport"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors group"
                aria-label="X (Twitter)"
              >
                <svg className="h-6 w-6 text-[#C9A14A] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
                <span className="mt-2 text-xs text-gray-400 group-hover:text-white transition-colors">Twitter</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/globaltravelreport/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors group"
                aria-label="Instagram"
              >
                <svg className="h-6 w-6 text-[#C9A14A] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                <span className="mt-2 text-xs text-gray-400 group-hover:text-white transition-colors">Instagram</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/globaltravelreport/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors group"
                aria-label="LinkedIn"
              >
                <svg className="h-6 w-6 text-[#C9A14A] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="mt-2 text-xs text-gray-400 group-hover:text-white transition-colors">LinkedIn</span>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@GlobalTravelReport"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors group"
                aria-label="YouTube"
              >
                <svg className="h-6 w-6 text-[#C9A14A] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span className="mt-2 text-xs text-gray-400 group-hover:text-white transition-colors">YouTube</span>
              </a>

              {/* Email */}
              <a
                href="mailto:editorial@globaltravelreport.com"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 p-3 rounded-lg transition-colors group"
                aria-label="Email"
              >
                <svg className="h-6 w-6 text-[#C9A14A] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="mt-2 text-xs text-gray-400 group-hover:text-white transition-colors">Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Global Travel Report. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-[#C9A14A] text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-[#C9A14A] text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-[#C9A14A] text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              Based in Sydney, Australia. Content is sourced from various travel news outlets and curated by our editorial team.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}