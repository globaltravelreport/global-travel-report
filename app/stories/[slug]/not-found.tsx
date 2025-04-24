import Link from 'next/link'

export default function StoryNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - Story Not Found</h1>
      <p className="text-gray-600 mb-8">
        Sorry, we couldn't find the story you're looking for.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Latest Stories
      </Link>
    </div>
  )
} 