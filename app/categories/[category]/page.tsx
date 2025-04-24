import { Metadata } from 'next'
import { getStoriesByCategory } from '@/app/lib/stories'
import StoryList from '@/app/components/StoryList'
import { generateMetadata as generatePageMetadata } from '@/app/lib/utils'

interface CategoryPageProps {
  params: {
    category: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = decodeURIComponent(params.category)
  return generatePageMetadata({
    title: `${category} Travel Stories`,
    description: `Explore ${category} travel stories, news, and updates. Get insights on destinations, experiences, and travel tips.`,
    path: `/categories/${params.category}`,
    type: 'website'
  })
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = decodeURIComponent(params.category)
  const currentPage = Number(searchParams.page) || 1
  const stories = await getStoriesByCategory(category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        {category} Travel Stories
      </h1>
      
      <StoryList
        stories={stories}
        currentPage={currentPage}
        totalPages={Math.ceil(stories.length / 10)}
        basePath={`/categories/${params.category}`}
        showTags={true}
        totalCount={stories.length}
        isLoading={false}
      />
    </div>
  )
} 