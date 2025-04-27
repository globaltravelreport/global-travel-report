import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { Story } from '../types/Story'

const STORIES_DIRECTORY = path.join(process.cwd(), 'content/articles')

export async function getAllStories(): Promise<Story[]> {
  const fileNames = fs.readdirSync(STORIES_DIRECTORY)
  
  const stories = fileNames
    .filter(fileName => fileName.endsWith('.md') || fileName.endsWith('.mdx'))
    .map(fileName => {
      const slug = fileName.replace(/\.mdx?$/, '')
      const fullPath = path.join(STORIES_DIRECTORY, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        content,
        title: data.title,
        excerpt: data.excerpt || '',
        publishedAt: data.publishedAt || '',
        updatedAt: data.updatedAt || '',
        author: data.author || { name: 'Global Travel Report' },
        coverImage: data.coverImage || null,
        categories: data.categories || [],
        tags: data.tags || [],
        readingTime: Math.ceil(content.split(/\s+/).length / 200), // Rough estimate of reading time
        seo: {
          title: data.seo?.title || data.title,
          description: data.seo?.description || data.excerpt,
          keywords: data.seo?.keywords || data.tags,
          ogImage: data.seo?.ogImage || data.coverImage?.url
        }
      } as Story
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return stories
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  try {
    const fullPath = path.join(STORIES_DIRECTORY, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      content,
      title: data.title,
      excerpt: data.excerpt || '',
      publishedAt: data.publishedAt || '',
      updatedAt: data.updatedAt || '',
      author: data.author || { name: 'Global Travel Report' },
      coverImage: data.coverImage || null,
      categories: data.categories || [],
      tags: data.tags || [],
      readingTime: Math.ceil(content.split(/\s+/).length / 200),
      seo: {
        title: data.seo?.title || data.title,
        description: data.seo?.description || data.excerpt,
        keywords: data.seo?.keywords || data.tags,
        ogImage: data.seo?.ogImage || data.coverImage?.url
      }
    } as Story
  } catch (error) {
    return null
  }
} 