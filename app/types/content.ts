export type Category = 'news' | 'reviews' | 'tips' | 'deals' | 'destinations'

export interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
}

export interface FeaturedImage {
  url: string
  alt: string
}

export interface StoryDraft {
  id?: string
  title: string
  content: string
  category: Category
  status?: 'draft' | 'published'
  author?: string
  isReadyToPublish?: boolean
  summary?: string
  image?: string
  featuredImage?: {
    url: string
    alt: string
  }
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  date?: string
  createdAt?: string
  publishedAt?: string
  slug?: string
}

export interface RewrittenContent {
  title: string
  content: string
  summary: string
  keywords: string[]
  image: string
  callToAction?: string
}

export interface StoryEditorProps {
  content: string
  initialData?: {
    title?: string
    summary?: string
    seo?: {
      title?: string
      description?: string
      keywords?: string[]
    }
  }
  onPublish: (story: StoryDraft) => Promise<void>
} 