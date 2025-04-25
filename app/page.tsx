import Link from 'next/link'
import { getRecentStories, getPaginatedStories, getUniqueCountries, getUniqueTypes } from './lib/stories'
import StoryList from './components/StoryList'
import StoryFilters from './components/StoryFilters'
import Image from 'next/image'
import { FaCompass, FaHotel, FaPlane, FaUmbrellaBeach } from 'react-icons/fa'
import type { Metadata } from 'next'
import { logger } from './utils/logger'

interface HomePageProps {
  searchParams: {
    page?: string
    country?: string
    type?: string
  }
}

export const metadata: Metadata = {
  title: 'Latest Travel Stories – Global Travel Report',
  description: 'Explore the latest curated travel news and updates for Australian travelers. Discover destinations, tips, and industry insights.',
  openGraph: {
    title: 'Latest Travel Stories – Global Travel Report',
    description: 'Explore curated travel news and updates for Aussie travelers.',
    siteName: 'Global Travel Report',
    locale: 'en_AU',
    type: 'website',
    url: 'https://www.globaltravelreport.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest Travel Stories – Global Travel Report',
  },
}

export default async function HomePage({ searchParams }: HomePageProps) {
  try {
    const currentPage = Number(searchParams.page) || 1
    const selectedCountry = searchParams.country
    const selectedType = searchParams.type

    // Get filter options with error handling
    const [countryNames, types] = await Promise.all([
      getUniqueCountries().catch(() => []),
      getUniqueTypes().catch(() => [])
    ])

    // Transform country names into Country objects
    const countries = countryNames.map(name => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }))

    // Get filtered stories (recent only) with error handling
    const stories = await getRecentStories({
      country: selectedCountry,
      type: selectedType
    }).catch(() => [])

    // Paginate stories
    const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, currentPage)

    // Get the latest featured story
    const featuredStory = stories[0]

    // Build the base path for pagination
    const params = new URLSearchParams()
    if (selectedCountry) params.set('country', selectedCountry)
    if (selectedType) params.set('type', selectedType)
    const basePath = `/?${params.toString()}`

    // Categories for quick navigation
    const categories = [
      { name: 'Destinations', icon: FaCompass, href: '/destinations', color: 'bg-blue-500' },
      { name: 'Hotels', icon: FaHotel, href: '/categories/hotels', color: 'bg-green-500' },
      { name: 'Airlines', icon: FaPlane, href: '/categories/airlines', color: 'bg-purple-500' },
      { name: 'Experiences', icon: FaUmbrellaBeach, href: '/categories/experiences', color: 'bg-orange-500' },
    ]

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Latest Featured Story */}
        <div className="relative h-[600px] bg-gray-900">
          {featuredStory?.imageUrl ? (
            <>
              <Image
                src={featuredStory?.imageUrl ?? ''}
                alt={featuredStory?.title ?? ''}
                fill
                className="object-cover opacity-80"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />
          )}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your Journey Begins Here
              </h1>
              <p className="mt-6 text-xl text-gray-300">
                Discover authentic travel experiences, industry insights, and expert recommendations from around the globe.
              </p>
              {featuredStory && (
                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
                  <p className="text-sm font-medium text-blue-400">Featured Story</p>
                  <Link href={`/stories/${featuredStory.slug}`}>
                    <h2 className="mt-2 text-2xl font-bold text-white hover:text-blue-400 transition">
                      {featuredStory.title}
                    </h2>
                  </Link>
                  <p className="mt-3 text-gray-300 line-clamp-2">{featuredStory.summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Navigation Categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group block bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6"
              >
                <div className={`inline-flex p-3 rounded-lg ${category.color}`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Stories Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Recent Stories</h2>
            <Link 
              href="/filtered"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="mb-8">
            <StoryFilters
              countries={countries}
              types={types}
              basePath="/"
            />
          </div>
          
          <StoryList
            stories={paginatedStories}
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
            showTags={true}
          />
        </div>

        {/* Newsletter Section */}
        <div className="bg-blue-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Stay Updated</h2>
              <p className="mt-4 text-lg text-blue-100">
                Get the latest travel stories, tips, and insights delivered directly to your inbox.
              </p>
              <Link
                href="/subscribe"
                className="mt-6 inline-block px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-900 transition"
              >
                Subscribe to Our Newsletter
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    logger.error('Error in HomePage:', error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Something went wrong</h1>
          <p className="mt-4 text-gray-600">We're working on fixing this issue. Please try again later.</p>
        </div>
      </div>
    )
  }
} 