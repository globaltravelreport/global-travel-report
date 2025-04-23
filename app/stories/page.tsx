import { getPublishedStories, getPaginatedStories } from '../lib/stories'
import StoryList from '../components/StoryList'

interface StoriesPageProps {
  searchParams: {
    page?: string
    category?: string
    country?: string
    tag?: string
    q?: string
  }
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const page = Number(searchParams.page) || 1
  const category = searchParams.category
  const country = searchParams.country
  const tag = searchParams.tag
  const query = searchParams.q

  // Get all published stories
  let stories = await getPublishedStories()

  // Apply filters if provided
  if (category) {
    stories = stories.filter(story => story.category === category)
  }
  if (country) {
    stories = stories.filter(story => story.country === country)
  }
  if (tag) {
    stories = stories.filter(story => story.tags.includes(tag))
  }
  if (query) {
    const searchTerms = query.toLowerCase().split(' ')
    stories = stories.filter(story => {
      const searchableText = [
        story.title,
        story.metaDescription,
        story.body,
        story.author,
        ...story.tags
      ].join(' ').toLowerCase()
      return searchTerms.every(term => searchableText.includes(term))
    })
  }

  // Get paginated results
  const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, page)

  return (
    <StoryList
      stories={paginatedStories}
      currentPage={page}
      totalPages={totalPages}
      basePath="/stories"
      title="All Travel Stories"
      showSearch={true}
    />
  )
} 