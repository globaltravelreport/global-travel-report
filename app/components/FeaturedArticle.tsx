import Link from 'next/link'
import Image from 'next/image'

export default function FeaturedArticle() {
  return (
    <div className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Story</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative h-[400px]">
            <Image
              src="/images/destinations/paris.jpg"
              alt="Paris cityscape with Eiffel Tower"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              A Weekend in Paris: The Ultimate Guide
            </h3>
            <p className="text-lg text-gray-600">
              Discover the magic of the City of Light with our comprehensive guide to Paris's most iconic landmarks, hidden gems, and local favorites. From the best time to visit the Eiffel Tower to secret cafés in Le Marais.
            </p>
            <Link
              href="/article/paris-weekend-guide"
              className="inline-block bg-gradient-to-r from-navy-600 to-teal-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-navy-700 hover:to-teal-700 transition-all duration-200"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 