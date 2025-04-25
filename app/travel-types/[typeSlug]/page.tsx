import { getStoriesByType } from '../../lib/stories'
import StoryList from '../../components/StoryList'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { logger } from '@/app/utils/logger'

interface CategoryPageProps {
  params: {
    typeSlug: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const type = decodeURIComponent(params.typeSlug)
  
  return {
    title: `${type} Travel Stories - Global Travel Report`,
    description: `Discover ${type.toLowerCase()} travel stories, news, and updates for Australian travelers.`,
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const type = decodeURIComponent(params.typeSlug)
  const currentPage = Number(searchParams.page) || 1
  
  try {
    const stories = await getStoriesByType(type)
    
    if (!stories.length) {
      notFound()
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {type} Stories
        </h1>
        
        <StoryList
          stories={stories}
          currentPage={currentPage}
          totalPages={1}
          basePath={`/travel-types/${params.typeSlug}`}
          showTags={true}
          totalCount={stories.length}
          isLoading={false}
        />
      </div>
    )
  } catch (error) {
    logger.error('Error loading travel type page:', error);
    notFound()
  }
} 