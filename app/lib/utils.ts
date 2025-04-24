import { format, isValid, parseISO, subDays, formatDistanceToNow } from 'date-fns'

export function formatDate(date: string): string {
  const parsedDate = parseISO(date)
  return isValid(parsedDate) ? format(parsedDate, 'MMMM d, yyyy') : 'Invalid Date'
}

export function isValidDate(dateString: string): boolean {
  const date = parseISO(dateString)
  return isValid(date)
}

export function isWithinLast7Days(date: string | Date): boolean {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(parsedDate)) return false
  
  const sevenDaysAgo = subDays(new Date(), 7)
  return parsedDate >= sevenDaysAgo
}

// New helper functions
export function formatReadingTime(content: string): string {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min read`
}

export function getTagColor(tag: string): { bg: string; text: string } {
  // Create a consistent hash of the tag for color selection
  const hash = tag.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  // Predefined color combinations for better visual consistency
  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-800' },
    { bg: 'bg-green-100', text: 'text-green-800' },
    { bg: 'bg-purple-100', text: 'text-purple-800' },
    { bg: 'bg-orange-100', text: 'text-orange-800' },
    { bg: 'bg-red-100', text: 'text-red-800' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { bg: 'bg-pink-100', text: 'text-pink-800' },
    { bg: 'bg-teal-100', text: 'text-teal-800' },
  ]

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export function truncateText(text: string, length: number): string {
  if (!text || text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

export function formatUpdatedDate(date: Date): string {
  return `Updated ${formatDistanceToNow(date, { addSuffix: true })}`
}

// SEO Helpers
export function generateMetadata(params: {
  title: string
  description: string
  imageUrl?: string
  type?: 'website' | 'article'
  path: string
  datePublished?: string
  dateModified?: string
  authorName?: string
}) {
  const { 
    title, 
    description, 
    imageUrl, 
    type = 'website', 
    path,
    datePublished,
    dateModified,
    authorName = 'Global Travel Report'
  } = params
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com'
  const fullUrl = `${baseUrl}${path}`
  const defaultImage = `${baseUrl}/images/og-default.jpg`
  const finalImage = imageUrl || defaultImage

  // Base metadata
  const metadata = {
    title: `${title} | Global Travel Report`,
    description,
    canonical: fullUrl,
    openGraph: {
      title,
      description,
      type,
      url: fullUrl,
      siteName: 'Global Travel Report',
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [finalImage],
    },
  }

  // Add structured data for articles
  if (type === 'article' && datePublished) {
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description,
      image: finalImage,
      datePublished,
      dateModified: dateModified || datePublished,
      author: {
        '@type': 'Person',
        name: authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Global Travel Report',
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/images/logo.png`,
        },
      },
    }

    return {
      ...metadata,
      alternates: {
        canonical: fullUrl,
      },
      robots: {
        index: true,
        follow: true,
      },
      other: {
        'script:ld+json': JSON.stringify(articleSchema),
      },
    }
  }

  return metadata
}

// This function should only be used in server components
export async function getFileModifiedDate(date: string): Promise<string> {
  try {
    const parsedDate = parseISO(date)
    return isValid(parsedDate) ? parsedDate.toISOString() : new Date().toISOString()
  } catch (error) {
    console.warn(`Error parsing date: ${date}`, error)
    return new Date().toISOString()
  }
}