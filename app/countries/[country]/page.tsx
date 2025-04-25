import { Metadata } from 'next'
import { getStoriesByCountry } from '@/app/lib/stories'
import { cleanCountryName } from '@/app/utils/storyUtils'
import { getFlagEmoji, getCountryTitle, getCountryMetaDescription } from '@/app/utils/countryHelpers'
import StoryList from '@/app/components/StoryList'
import { notFound } from 'next/navigation'
import { logger } from '@/app/utils/logger'

interface CountryPageProps {
  params: {
    country: string // This is the slug
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const countryName = decodeURIComponent(params.country).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  const cleanedCountry = cleanCountryName(countryName)
  const title = getCountryTitle(cleanedCountry)
  const description = getCountryMetaDescription(cleanedCountry)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Global Travel Report',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/countries/${params.country}`,
    }
  }
}

export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const page = Number(searchParams.page) || 1
  const countryName = decodeURIComponent(params.country).split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  try {
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
            {flagEmoji} Travel Stories from {cleanedCountry}
          </h1>
          <p className="text-gray-600">
            Discover travel stories, guides, and experiences from {cleanedCountry}
          </p>
        </header>

        <StoryList
          stories={stories}
          currentPage={page}
          totalPages={Math.ceil(stories.length / 10)}
          basePath={`/countries/${params.country}`}
          showTags
        />
      </section>
    )
  } catch (error) {
    logger.error('Error loading country page:', error);
    notFound()
  }
} 