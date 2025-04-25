import { Metadata } from 'next'
import { getStoriesByCountry } from '@/app/lib/stories'
import { cleanCountryName } from '@/app/utils/storyUtils'
import { getFlagEmoji } from '@/app/utils/countryHelpers'
import StoryList from '@/app/components/StoryList'
import { notFound } from 'next/navigation'

interface DestinationPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
  }
}

// Generate metadata for the page
export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const countryName = decodeURIComponent(params.slug).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  const cleanedCountry = cleanCountryName(countryName)

  return {
    title: `${cleanedCountry} Travel Destinations & Places to Visit`,
    description: `Discover amazing destinations and places to visit in ${cleanedCountry}. Find travel guides, tips, and recommendations.`,
    openGraph: {
      title: `${cleanedCountry} Travel Destinations`,
      description: `Explore the best places to visit in ${cleanedCountry}`,
      type: 'website',
      siteName: 'Global Travel Report',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${cleanedCountry} Travel Destinations`,
      description: `Explore the best places to visit in ${cleanedCountry}`,
    },
    alternates: {
      canonical: `/destinations/${params.slug}`,
    }
  }
}

export default async function DestinationPage({ params, searchParams }: DestinationPageProps) {
  const page = Number(searchParams.page) || 1
  const countryName = decodeURIComponent(params.slug).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  const stories = await getStoriesByCountry(countryName)
  
  if (!stories.length) {
    notFound()
  }

  const cleanedCountry = cleanCountryName(countryName)
  const flagEmoji = getFlagEmoji(cleanedCountry)

  return (
    <section className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {flagEmoji} Destinations in {cleanedCountry}
        </h1>
        <p className="text-gray-600">
          Discover amazing places to visit and travel experiences in {cleanedCountry}
        </p>
      </header>

      <StoryList
        stories={stories}
        currentPage={page}
        totalPages={Math.ceil(stories.length / 10)}
        basePath={`/destinations/${params.slug}`}
        showTags
      />
    </section>
  )
} 