import { Metadata } from 'next'
import { getStoriesByCountry } from '@/app/lib/stories'
import StoryList from '@/app/components/StoryList'
import { generateMetadata as generatePageMetadata } from '@/app/lib/utils'

interface CountryPageProps {
  params: {
    country: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const country = decodeURIComponent(params.country)
  return generatePageMetadata({
    title: `Travel Stories from ${country}`,
    description: `Discover the latest travel stories, news, and updates from ${country}. Get insights on destinations, experiences, and travel tips.`,
    path: `/countries/${params.country}`,
    type: 'website'
  })
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const country = decodeURIComponent(params.country)
  const currentPage = Number(searchParams.page) || 1
  const stories = await getStoriesByCountry(country)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Travel Stories from {country}
      </h1>
      
      <StoryList
        stories={stories}
        currentPage={currentPage}
        totalPages={Math.ceil(stories.length / 10)}
        basePath={`/countries/${params.country}`}
        showTags={true}
        totalCount={stories.length}
        isLoading={false}
      />
    </div>
  )
} 