import Hero from './components/Hero'
import FeaturedArticle from './components/FeaturedArticle'
import LatestNews from './components/LatestNews'
import Deals from './components/Deals'
import Newsletter from './components/Newsletter'
import { StoryDraft } from '@/types/content'
import PageLayout from './components/PageLayout'
import ContentGrid from './components/ContentGrid'
import { featuredItems } from '@/data/featured'

async function getPublishedStories() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stories`, {
    cache: 'no-store'
  });
  if (!response.ok) {
    return [];
  }
  return response.json();
}

export default function HomePage() {
  return (
    <PageLayout
      title="Global Travel Report"
      description="Your trusted source for travel news, reviews, tips and exclusive deals."
      heroType="home"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ContentGrid items={featuredItems} />
      </div>
    </PageLayout>
  );
} 