import { Suspense } from 'react'
import { getPublishedStories, getPaginatedStories, type Story } from '../lib/stories'
import StoryCard from '../components/StoryCard'
import Search from '../components/Search'
import FilterSidebar from '../components/FilterSidebar'
import ActiveFilters from '../components/ActiveFilters'
import SortDropdown from '../components/SortDropdown'

interface StoriesPageProps {
  searchParams: {
    page?: string
    q?: string
    category?: string
    country?: string
    tag?: string
    sort?: string
  }
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const page = parseInt(searchParams.page || '1')
  const query = searchParams.q || ''
  const category = searchParams.category
  const country = searchParams.country
  const tag = searchParams.tag
  const sort = searchParams.sort || 'newest'

  let stories = await getPublishedStories()

  // Apply filters
  if (query) {
    stories = stories.filter((story: Story) => {
      const searchableText = [
        story.title,
        story.metaDescription,
        story.body,
        story.author,
        ...story.tags
      ].join(' ').toLowerCase()
      return searchableText.includes(query.toLowerCase())
    })
  }

  if (category) {
    stories = stories.filter((story: Story) => story.category === category)
  }

  if (country) {
    stories = stories.filter((story: Story) => story.country === country)
  }

  if (tag) {
    stories = stories.filter((story: Story) => story.tags.includes(tag))
  }

  // Apply sorting
  stories.sort((a: Story, b: Story) => {
    switch (sort) {
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      // Add more sort options here in the future
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    }
  })

  // Get paginated results
  const { stories: paginatedStories, totalPages, currentPage } = await getPaginatedStories(stories, page)

  // Get unique categories and countries for filters
  const categories = Array.from(new Set(stories.map((story: Story) => story.category)))
  const countries = Array.from(new Set(stories.map((story: Story) => story.country)))

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Stories</h1>
      
      <div className="mb-8">
        <Search initialQuery={query} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <FilterSidebar
            categories={categories}
            countries={countries}
            selectedCategory={category}
            selectedCountry={country}
            selectedTags={tag ? [tag] : []}
            stories={stories}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <ActiveFilters
            category={category}
            country={country}
            tag={tag}
            query={query}
            stories={stories}
          />

          {/* Sort and Results Count */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'} found
            </div>
            <SortDropdown currentSort={sort} />
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Suspense fallback={<div>Loading stories...</div>}>
              {paginatedStories.map((story: Story) => (
                <StoryCard key={story.slug} story={story} />
              ))}
            </Suspense>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum: number) => (
                <a
                  key={pageNum}
                  href={`/stories?page=${pageNum}${query ? `&q=${query}` : ''}${
                    category ? `&category=${category}` : ''
                  }${country ? `&country=${country}` : ''}${
                    tag ? `&tag=${tag}` : ''
                  }${sort ? `&sort=${sort}` : ''}`}
                  className={`px-4 py-2 rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 