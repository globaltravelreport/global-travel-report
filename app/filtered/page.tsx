import { Metadata } from 'next'
import { getStories, getPaginatedStories, getUniqueCountries, getUniqueTypes } from '../lib/stories'
import StoryList from '../components/StoryList'
import StoryFilters from '../components/StoryFilters'
import { generateMetadata as generatePageMetadata } from '../lib/utils'
import { notFound } from 'next/navigation'

interface FilteredPageProps {
  searchParams: {
    page?: string
    country?: string
    type?: string
    tag?: string
  }
}

export async function generateMetadata({ searchParams }: FilteredPageProps): Promise<Metadata> {
  const { country, type, tag } = searchParams
  let title = 'All Stories'
  let description = 'Browse our complete collection of travel stories, industry insights, and expert recommendations.'

  if (country && type) {
    title = `${type} Stories from ${country}`
    description = `Explore ${type.toLowerCase()} stories and travel insights from ${country}.`
  } else if (country) {
    title = `Stories from ${country}`
    description = `Discover travel stories, tips, and insights about ${country}.`
  } else if (type) {
    title = `${type} Stories`
    description = `Read the latest ${type.toLowerCase()} stories and travel insights.`
  } else if (tag) {
    title = `Stories Tagged "${tag}"`
    description = `Explore travel stories and insights related to ${tag}.`
  }

  return generatePageMetadata({
    title,
    description,
    path: '/filtered',
    type: 'website'
  })
}

export default async function FilteredPage({ searchParams }: FilteredPageProps) {
  const currentPage = Number(searchParams.page) || 1
  const selectedCountry = searchParams.country
  const selectedType = searchParams.type
  const selectedTag = searchParams.tag

  try {
    // Get filter options
    const [countryNames, types] = await Promise.all([
      getUniqueCountries(),
      getUniqueTypes()
    ])

    // Transform country names into Country objects
    const countries = countryNames.map(name => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }))

    // Get filtered stories (all stories, not just recent)
    const stories = await getStories({
      country: selectedCountry,
      type: selectedType,
      tag: selectedTag
    })

    // Paginate stories
    const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, currentPage)

    // Build the base path for pagination
    const params = new URLSearchParams()
    if (selectedCountry) params.set('country', selectedCountry)
    if (selectedType) params.set('type', selectedType)
    if (selectedTag) params.set('tag', selectedTag)
    const basePath = `/filtered?${params.toString()}`

    // Determine page title based on filters
    let title = 'All Stories'
    if (selectedCountry && selectedType) {
      title = `${selectedType} Stories from ${selectedCountry}`
    } else if (selectedCountry) {
      title = `Stories from ${selectedCountry}`
    } else if (selectedType) {
      title = `${selectedType} Stories`
    } else if (selectedTag) {
      title = `Stories Tagged "${selectedTag}"`
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{title}</h1>

          <div className="mb-8">
            <StoryFilters
              countries={countries}
              types={types}
              selectedCountry={selectedCountry}
              selectedType={selectedType}
              basePath="/filtered"
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
      </div>
    )
  } catch (error) {
    console.error('Error in FilteredPage:', error)
    notFound()
  }
} 