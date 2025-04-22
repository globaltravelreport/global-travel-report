import { getStoriesByCountry, getPaginatedStories } from '../../lib/stories'
import StoryList from '../../components/StoryList'

interface CountryPageProps {
  params: {
    country: string
  }
  searchParams: {
    page?: string
    q?: string
  }
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const currentPage = Number(searchParams.page) || 1
  const stories = await getStoriesByCountry(params.country)
  const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, currentPage)

  return (
    <StoryList
      stories={paginatedStories}
      currentPage={currentPage}
      totalPages={totalPages}
      basePath={`/countries/${params.country}`}
      title={`Stories from ${params.country}`}
    />
  )
} 