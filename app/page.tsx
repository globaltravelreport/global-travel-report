import { Metadata } from 'next'
import Link from 'next/link'
import { getRecentStories, getPaginatedStories, getUniqueCountries, getUniqueTypes } from './lib/stories'
import StoryList from './components/StoryList'
import StoryFilters from './components/StoryFilters'

export const metadata: Metadata = {
  title: 'Latest Travel Stories – Global Travel Report',
  description: 'Explore the latest curated travel news and updates for Australian travelers, rewritten and optimized by AI.',
  openGraph: {
    title: 'Latest Travel Stories – Global Travel Report',
    description: 'Explore the latest curated travel news and updates for Australian travelers, rewritten and optimized by AI.',
    type: 'website',
    url: 'https://globaltravelreport.com',
    siteName: 'Global Travel Report',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest Travel Stories – Global Travel Report',
    description: 'Explore the latest curated travel news and updates for Australian travelers, rewritten and optimized by AI.',
  }
}

interface HomePageProps {
  searchParams: {
    page?: string
    country?: string
    type?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const currentPage = Number(searchParams.page) || 1
  const selectedCountry = searchParams.country
  const selectedType = searchParams.type

  // Get filter options
  const [countries, types] = await Promise.all([
    getUniqueCountries(),
    getUniqueTypes()
  ])

  // Get filtered stories (recent only)
  const stories = await getRecentStories({
    country: selectedCountry,
    type: selectedType
  })

  // Paginate stories
  const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, currentPage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          Latest Travel Stories
        </h1>
        <Link
          href="/filtered"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Stories →
        </Link>
      </div>

      <StoryFilters
        countries={countries}
        types={types}
      />
      
      <StoryList
        stories={paginatedStories}
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/?${new URLSearchParams({
          ...(selectedCountry && { country: selectedCountry }),
          ...(selectedType && { type: selectedType })
        }).toString()}`}
        title="Latest Travel Stories"
        showSearch={true}
      />
    </div>
  )
} 