import Link from 'next/link'
import PageLayout from './components/PageLayout'

export default function NotFound() {
  return (
    <PageLayout
      title="Page Not Found"
      description="Sorry, we couldn't find the page you're looking for."
      heroType="notFound"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lost your way?</h2>
        <p className="text-gray-600 mb-8">
          Don't worry, it happens to the best of us. Let's get you back on track.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-teal text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </PageLayout>
  )
} 