import { Metadata } from 'next'
import { getStoriesByType } from '@/app/lib/stories'
import StoryList from '@/app/components/StoryList'
import { notFound } from 'next/navigation'

interface CategoryPageProps {
  params: {
    type: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const type = decodeURIComponent(params.type).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  return {
    title: `${type} Travel Stories & Guides`,
    description: `Discover the latest ${type.toLowerCase()} travel stories, guides, and experiences. Find insider tips and travel inspiration.`,
    openGraph: {
      title: `${type} Travel Stories & Guides`,
      description: `Discover the latest ${type.toLowerCase()} travel stories and guides.`,
      type: 'website',
      siteName: 'Global Travel Report',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${type} Travel Stories & Guides`,
      description: `Discover the latest ${type.toLowerCase()} travel stories and guides.`,
    },
    alternates: {
      canonical: `/categories/${params.type}`,
    }
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const page = Number(searchParams.page) || 1
  const type = decodeURIComponent(params.type).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  const stories = await getStoriesByType(type)
  
  if (!stories.length) {
    notFound()
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {type} Travel Stories
        </h1>
        <p className="text-gray-600">
          Discover travel stories, guides, and experiences about {type.toLowerCase()}
        </p>
      </header>

      <StoryList
        stories={stories}
        currentPage={page}
        totalPages={Math.ceil(stories.length / 10)}
        basePath={`/categories/${params.type}`}
        showTags
      />
    </section>
  )
} 