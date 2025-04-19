import Hero from './components/Hero'
import FeaturedArticle from './components/FeaturedArticle'
import LatestNews from './components/LatestNews'
import Deals from './components/Deals'
import Newsletter from './components/Newsletter'
import { StoryDraft } from '@/types/content'
import PageLayout from './components/PageLayout'
import ContentGrid from './components/ContentGrid'
import { featuredItems } from '@/data/featured'
import fs from 'fs/promises'
import path from 'path'

async function getLatestArticles() {
  try {
    const filePath = path.join(process.cwd(), 'app/data/articles.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const articles = JSON.parse(fileContent)
    return articles.slice(0, 4) // Get latest 4 articles
  } catch (error) {
    console.error('Error reading articles:', error)
    return []
  }
}

export default async function HomePage() {
  const latestArticles = await getLatestArticles()
  const allItems = [...featuredItems, ...latestArticles]

  return (
    <PageLayout
      title="Global Travel Report"
      description="Your trusted source for travel news, reviews, tips and exclusive deals."
      heroType="home"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ContentGrid items={allItems} />
      </div>
      <Newsletter />
    </PageLayout>
  )
} 