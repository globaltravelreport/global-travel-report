import { getStoriesByCategory, getPaginatedStories } from '../../lib/stories'
import StoryList from '../../components/StoryList'

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: {
    page?: string
    q?: string
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const currentPage = Number(searchParams.page) || 1
  const stories = await getStoriesByCategory(params.category)
  const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, currentPage)

  return (
    <StoryList
      stories={paginatedStories}
      currentPage={currentPage}
      totalPages={totalPages}
      basePath={`/categories/${params.category}`}
      title={`${params.category} Stories`}
    />
  )
} 