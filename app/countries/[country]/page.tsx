import { getStoriesByCountry, getPaginatedStories } from '../../lib/stories'
import StoryList from '../../components/StoryList'

interface CountryPageProps {
  params: {
    country: string
  }
  searchParams: {
    page?: string
  }
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const currentPage = Number(searchParams.page) || 1
  const stories = await getStoriesByCountry(params.country)
  const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, currentPage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Stories from {params.country}
      </h1>
      <StoryList
        stories={paginatedStories}
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/countries/${params.country}`}
      />
    </div>
  )
} 