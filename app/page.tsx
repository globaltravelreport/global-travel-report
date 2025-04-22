import { getRecentStories, getPaginatedStories } from './lib/stories'
import StoryList from './components/StoryList'

interface HomePageProps {
  searchParams: {
    page?: string
    q?: string
  }
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const currentPage = Number(searchParams.page) || 1
  const stories = await getRecentStories()
  const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, currentPage)

  return (
    <StoryList
      stories={paginatedStories}
      currentPage={currentPage}
      totalPages={totalPages}
      basePath="/"
      title="Latest Travel Stories"
    />
  )
} 