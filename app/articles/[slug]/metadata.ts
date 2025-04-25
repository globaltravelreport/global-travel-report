import { Metadata } from 'next'
import fs from 'fs/promises'
import path from 'path'
import { logger } from '@/app/utils/logger'

interface Article {
  slug: string
  title: string
  summary: string
  image: string
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const filePath = path.join(process.cwd(), 'app/data/articles.json')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const articles = JSON.parse(fileContent) as Article[]
    return articles.find(article => article.slug === slug) || null
  } catch (error) {
    logger.error('Error reading article:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug)
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [article.image]
    }
  }
} 