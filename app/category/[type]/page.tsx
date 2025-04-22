import { notFound } from 'next/navigation'
import { getStoriesByCategory } from '../../lib/stories'
import StoryCard from '../../components/StoryCard'

interface CategoryPageProps {
  params: {
    type: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const stories = await getStoriesByCategory(params.type)
  
  if (stories.length === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {params.type.charAt(0).toUpperCase() + params.type.slice(1)} Stories
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </div>
    </div>
  )
} 