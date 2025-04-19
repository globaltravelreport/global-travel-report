import Link from 'next/link'
import PageLayout from './components/PageLayout'

export default function NotFound() {
  return (
    <PageLayout
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      heroImage="/images/not-found-hero.jpg"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">404 - Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-navy text-white px-6 py-3 rounded-lg hover:bg-navy-700 transition-colors duration-200"
        >
          Return to Home
        </Link>
      </div>
    </PageLayout>
  )
} 