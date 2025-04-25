import { getUniqueCountries } from '@/app/lib/stories'
import Link from 'next/link'
import { FaCompass } from 'react-icons/fa'
import { Metadata } from 'next'
import { logger } from '@/app/utils/logger'

export const metadata: Metadata = {
  title: 'Travel Destinations - Global Travel Report',
  description: 'Explore travel guides and stories for destinations around the world, curated for Australian travelers.',
  openGraph: {
    title: 'Travel Destinations - Global Travel Report',
    description: 'Explore travel guides and stories for destinations around the world.',
    siteName: 'Global Travel Report',
    locale: 'en_AU',
    type: 'website',
  }
}

export default async function DestinationsPage() {
  try {
    // Get all unique countries from stories
    const countries = await getUniqueCountries()

    // Group countries by continent (simplified version)
    const continents = {
      'Asia & Pacific': ['Japan', 'Thailand', 'Vietnam', 'Singapore', 'Indonesia', 'Malaysia', 'Philippines', 'South Korea', 'China', 'India'],
      'Europe': ['France', 'Italy', 'Spain', 'Greece', 'Germany', 'United Kingdom', 'Netherlands', 'Switzerland', 'Portugal'],
      'Americas': ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina'],
      'Middle East': ['Dubai', 'Qatar', 'United Arab Emirates', 'Saudi Arabia', 'Turkey'],
      'Africa': ['South Africa', 'Morocco', 'Egypt', 'Kenya', 'Tanzania']
    }

    // Filter countries by those that have stories
    const groupedCountries = Object.entries(continents).reduce((acc, [continent, countryList]) => {
      const availableCountries = countryList.filter(country => 
        countries.includes(country)
      )
      if (availableCountries.length > 0) {
        acc[continent] = availableCountries
      }
      return acc
    }, {} as Record<string, string[]>)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gray-900 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                Explore Destinations
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
                Discover amazing places around the world with detailed guides and insider tips curated for Australian travelers.
              </p>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {Object.entries(groupedCountries).map(([continent, countryList]) => (
            <div key={continent} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{continent}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {countryList.map(country => {
                  const slug = country.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <Link
                      key={country}
                      href={`/destinations/${slug}`}
                      className="group block bg-white rounded-lg shadow-lg hover:shadow-xl transition overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="inline-flex p-3 rounded-lg bg-blue-500 mb-4">
                          <FaCompass className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                          {country}
                        </h3>
                        <p className="mt-2 text-gray-600">
                          Explore travel stories and guides about {country}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    logger.error('Error in DestinationsPage:', error)
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