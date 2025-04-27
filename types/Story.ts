export interface Story {
  slug: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  updatedAt?: string
  author?: {
    name: string
    avatar?: string
  }
  coverImage?: {
    url: string
    alt: string
  }
  categories?: string[]
  tags?: string[]
  readingTime?: number
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
    ogImage?: string
  }
} 