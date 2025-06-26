import Link from 'next/link'
import { FaFacebook, FaXTwitter, FaMedium, FaLinkedin, FaYoutube, FaTiktok, FaTumblr } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#19273A] to-[#0F1824] text-white border-t-4 border-[#C9A14A]">
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
                <Link href="/category-index" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  All Categories
                </Link>
              </li>
              <li>
                <Link href="/category-index/hotels" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Hotels
                </Link>
              </li>
              <li>
                <Link href="/category-index/airlines" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Airlines
                </Link>
              </li>
              <li>
                <Link href="/category-index/cruises" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Cruises
                </Link>
              </li>
              <li>
                <Link href="/category-index/destinations" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/category-index/travel-tips" className="text-gray-300 hover:text-[#C9A14A] transition-colors flex items-center">
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
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-[#C9A14A] p-4 rounded-lg transition-all duration-300 group shadow-md hover:shadow-lg transform hover:-translate-y-1"
                aria-label="Facebook"
              >
                <FaFacebook className="h-7 w-7 text-[#C9A14A] group-hover:text-white transition-colors" />
                <span className="mt-2 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">Facebook</span>
              </a>

              {/* Twitter/X */}
              <a
                href="https://x.com/GTravelReport"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-[#C9A14A] p-4 rounded-lg transition-all duration-300 group shadow-md hover:shadow-lg transform hover:-translate-y-1"
                aria-label="X (Twitter)"
              >
                <FaXTwitter className="h-7 w-7 text-[#C9A14A] group-hover:text-white transition-colors" />
                <span className="mt-2 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">Twitter</span>
              </a>

              {/* Medium */}
              <a
                href="https://medium.com/@editorial_31000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-[#C9A14A] p-4 rounded-lg transition-all duration-300 group shadow-md hover:shadow-lg transform hover:-translate-y-1"
                aria-label="Medium"
              >
                <FaMedium className="h-7 w-7 text-[#C9A14A] group-hover:text-white transition-colors" />
                <span className="mt-2 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">Medium</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/globaltravelreport/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-[#C9A14A] p-4 rounded-lg transition-all duration-300 group shadow-md hover:shadow-lg transform hover:-translate-y-1"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-7 w-7 text-[#C9A14A] group-hover:text-white transition-colors" />
                <span className="mt-2 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">LinkedIn</span>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@GlobalTravelReport"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-[#C9A14A] p-4 rounded-lg transition-all duration-300 group shadow-md hover:shadow-lg transform hover:-translate-y-1"
                aria-label="YouTube"
              >
                <FaYoutube className="h-7 w-7 text-[#C9A14A] group-hover:text-white transition-colors" />
                <span className="mt-2 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">YouTube</span>
              </a>

              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@globaltravelreport"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-[#C9A14A] p-4 rounded-lg transition-all duration-300 group shadow-md hover:shadow-lg transform hover:-translate-y-1"
                aria-label="TikTok"
              >
                <FaTiktok className="h-7 w-7 text-[#C9A14A] group-hover:text-white transition-colors" />
                <span className="mt-2 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">TikTok</span>
              </a>

              {/* Tumblr */}
              <a
                href="https://www.tumblr.com/blog/globaltravelreport"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-gray-800 hover:bg-[#C9A14A] p-4 rounded-lg transition-all duration-300 group shadow-md hover:shadow-lg transform hover:-translate-y-1"
                aria-label="Tumblr"
              >
                <FaTumblr className="h-7 w-7 text-[#C9A14A] group-hover:text-white transition-colors" />
                <span className="mt-2 text-xs font-medium text-gray-300 group-hover:text-white transition-colors">Tumblr</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-800 bg-[#0F1824]/50 rounded-t-lg shadow-inner">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-300 text-sm font-medium">
                © {new Date().getFullYear()} Global Travel Report. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-8">
              <Link href="/privacy" className="text-gray-300 hover:text-[#C9A14A] text-sm transition-colors font-medium hover:underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-[#C9A14A] text-sm transition-colors font-medium hover:underline">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-300 hover:text-[#C9A14A] text-sm transition-colors font-medium hover:underline">
                Sitemap
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-xs">
              Based in Sydney, Australia. Content is sourced from various travel news outlets and curated by our editorial team.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}