import { Metadata } from 'next'
import { featuredItems } from '@/data/featured'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = featuredItems.find(item => item.slug === params.slug)
  
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