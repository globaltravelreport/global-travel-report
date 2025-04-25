import { getAllStories } from '../lib/stories'
import Link from 'next/link'

export default async function CountriesPage() {
  const stories = await getAllStories()
  
  // Count stories per country
  const countryCounts = stories.reduce((acc, story) => {
    acc[story.country] = (acc[story.country] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Sort countries by story count (descending)
  const sortedCountries = (Object.entries(countryCounts) as [string, number][])
    .sort(([, a], [, b]) => b - a)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Explore Countries
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCountries.map(([country, count]) => (
            <Link
              key={country}
              href={`/countries/${country}`}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {country}
                </h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {count} {count === 1 ? 'story' : 'stories'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 