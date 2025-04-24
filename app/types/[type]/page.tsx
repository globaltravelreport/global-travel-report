import { Metadata } from 'next'
import { getStories, getPaginatedStories } from '../../lib/stories'
import StoryList from '../../components/StoryList'
import { notFound } from 'next/navigation'

interface TypePageProps {
  params: {
    type: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: TypePageProps): Promise<Metadata> {
  const type = decodeURIComponent(params.type)
  
  return {
    title: `${type} Travel Stories - Global Travel Report`,
    description: `Discover ${type.toLowerCase()} travel stories, guides, and tips. Plan your next adventure with insights from Australian travelers.`,
    openGraph: {
      title: `${type} Travel Stories - Global Travel Report`,
      description: `Discover ${type.toLowerCase()} travel stories, guides, and tips. Plan your next adventure with insights from Australian travelers.`,
      type: 'website',
      url: `https://globaltravelreport.com/type/${encodeURIComponent(type)}`,
      siteName: 'Global Travel Report',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${type} Travel Stories - Global Travel Report`,
      description: `Discover ${type.toLowerCase()} travel stories and guides.`,
    }
  }
}

export default async function TypePage({ params, searchParams }: TypePageProps) {
  const type = decodeURIComponent(params.type)
  const currentPage = Number(searchParams.page) || 1

  try {
    // Get stories for this type
    const stories = await getStories({ type })

    if (stories.length === 0) {
      notFound()
    }

    // Paginate stories (12 per page)
    const { stories: paginatedStories, totalPages } = await getPaginatedStories(stories, currentPage, 12)

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {type} Travel Stories
            </h1>
            <p className="text-lg text-gray-600">
              {`Found ${stories.length} ${type.toLowerCase()} travel stories`}
            </p>
          </div>

          <StoryList
            stories={paginatedStories}
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/type/${encodeURIComponent(type)}`}
            showTags={true}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error(`Error in TypePage for ${type}:`, error)
    notFound()
  }
} 