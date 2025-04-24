import { Metadata } from 'next'
import { getStories, getPaginatedStories, getUniqueCountries, getUniqueTypes } from '../lib/stories'
import StoryList from '../components/StoryList'
import StoryFilters from '../components/StoryFilters'
import SearchBox from '../components/SearchBox'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Explore All Travel Stories - Global Travel Report',
  description: 'Discover archived travel stories by country, category, and keywords. Find detailed guides, tips, and insights for your next adventure.',
  openGraph: {
    title: 'Explore All Travel Stories - Global Travel Report',
    description: 'Discover archived travel stories by country, category, and keywords. Find detailed guides, tips, and insights for your next adventure.',
    type: 'website',
    url: 'https://globaltravelreport.com/filtered',
    siteName: 'Global Travel Report',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore All Travel Stories - Global Travel Report',
    description: 'Discover archived travel stories by country, category, and keywords.',
  }
}

interface FilteredPageProps {
  searchParams: {
    page?: string
    country?: string
    type?: string
    tag?: string
    q?: string
  }
}

export default async function FilteredPage({ searchParams }: FilteredPageProps) {
  const currentPage = Number(searchParams.page) || 1
  const selectedCountry = searchParams.country
  const selectedType = searchParams.type
  const selectedTag = searchParams.tag
  const searchQuery = searchParams.q

  try {
    // Get filter options
    const [countries, types] = await Promise.all([
      getUniqueCountries(),
      getUniqueTypes()
    ])

    // Get filtered stories (not limited to recent)
    const stories = await getStories({
      country: selectedCountry,
      type: selectedType,
      tag: selectedTag,
      searchQuery: searchQuery
    })

    // Paginate stories (12 per page)
    const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, currentPage, 12)

    // Determine the title based on filters
    let title = 'Explore All Travel Stories'
    if (searchQuery) {
      title = `Search Results for "${searchQuery}"`
    } else if (selectedTag) {
      title = `Stories Tagged "${selectedTag}"`
    } else if (selectedCountry && selectedType) {
      title = `${selectedType} Stories from ${selectedCountry}`
    } else if (selectedCountry) {
      title = `Stories from ${selectedCountry}`
    } else if (selectedType) {
      title = `${selectedType} Stories`
    }

    // Build the base path for pagination
    const params = new URLSearchParams()
    if (selectedCountry) params.set('country', selectedCountry)
    if (selectedType) params.set('type', selectedType)
    if (selectedTag) params.set('tag', selectedTag)
    if (searchQuery) params.set('q', searchQuery)
    const basePath = `/filtered?${params.toString()}`

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-lg text-gray-600">
              {stories.length === 0 
                ? 'No stories found. Try adjusting your filters or search terms.'
                : `Found ${stories.length} stories matching your criteria.`
              }
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-3/4">
              <SearchBox 
                initialValue={searchQuery}
                placeholder="Search stories..."
              />
            </div>
            <div className="w-full md:w-1/4">
              <StoryFilters
                countries={countries}
                types={types}
                selectedCountry={selectedCountry}
                selectedType={selectedType}
              />
            </div>
          </div>

          <StoryList
            stories={paginatedStories}
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
            showTags={true}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in FilteredPage:', error)
    notFound()
  }
} 