import Link from 'next/link';
import { EnhancedSEO } from '@/src/components/seo/EnhancedSEO';
import { NewsletterSignup } from '@/src/components/newsletter/NewsletterSignup';

/**
 * Custom 404 Not Found Page
 *
 * Provides search functionality and related story suggestions
 * to help users find what they're looking for.
 */
export default function NotFound() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';

  // Generate structured data for 404 page
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Page Not Found - Global Travel Report',
    description: 'The requested page could not be found. Discover amazing travel stories and destination guides.',
    url: `${baseUrl}/404`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Global Travel Report',
      url: baseUrl,
    },
  };

  return (
    <>
      <EnhancedSEO
        title="Page Not Found - Global Travel Report"
        description="The requested page could not be found. Discover amazing travel stories, destination guides, and adventure inspiration from around the world."
        canonical={`${baseUrl}/404`}
        structuredData={structuredData}
        noIndex={true}
      />

      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Global Travel Report</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="text-8xl font-bold text-blue-600 mb-4">404</div>
              <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! This destination doesn't exist
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              The page you're looking for seems to have taken a different route.
              Don't worry, let's get you back on track with some amazing travel content.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Homepage
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Stories
              </Link>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Stay Updated with Travel Stories
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Get the latest travel tips and destination guides delivered to your inbox.
              </p>
              <NewsletterSignup variant="inline" />
            </div>

            {/* Popular Categories */}
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Explore Popular Destinations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { name: 'Europe', href: '/destinations/europe', color: 'bg-green-100 text-green-800' },
                  { name: 'Asia', href: '/destinations/asia', color: 'bg-red-100 text-red-800' },
                  { name: 'Cruises', href: '/categories/cruises', color: 'bg-blue-100 text-blue-800' },
                  { name: 'Hotels', href: '/categories/hotels', color: 'bg-purple-100 text-purple-800' },
                  { name: 'Adventure', href: '/categories/adventure', color: 'bg-orange-100 text-orange-800' },
                  { name: 'Culture', href: '/categories/culture', color: 'bg-pink-100 text-pink-800' },
                ].map((category) => (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`${category.color} px-4 py-3 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity text-center`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500 text-sm">
              <p>&copy; 2024 Global Travel Report. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}