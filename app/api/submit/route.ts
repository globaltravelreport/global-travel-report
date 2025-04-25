import { NextResponse } from 'next/server'
import { writeFile, mkdir, access } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { logger } from '@/app/utils/logger'

interface ImageMetadata {
  name: string
  originalName: string
  size: number
  type: string
  width?: number
  height?: number
}

interface Story {
  title: string
  author: string
  category: string
  country: string
  body: string
  metaDescription: string
  tags: string[]
  isSponsored: boolean
  editorsPick: boolean
  slug: string
  timestamp: string
  readTime: number
  imageName?: string
  galleryImages?: ImageMetadata[]
}

interface ValidationError {
  field: string
  message: string
}

const MIN_BODY_LENGTH = 500
const MAX_BODY_LENGTH = 10000
const MAX_IMAGES = 10
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const MIN_IMAGE_WIDTH = 800
const MIN_IMAGE_HEIGHT = 500
const TARGET_ASPECT_RATIO = 16 / 9
const ASPECT_RATIO_TOLERANCE = 0.1

async function verifyRecaptcha(token: string): Promise<boolean> {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  })

  const data = await response.json()
  return data.success
}

async function validateStory(story: Partial<Story>): Promise<ValidationError[]> {
  const errors: ValidationError[] = []

  // Required fields
  if (!story.title?.trim()) {
    errors.push({ field: 'title', message: 'Title is required' })
  }

  if (!story.author?.trim()) {
    errors.push({ field: 'author', message: 'Author is required' })
  }

  if (!story.category?.trim()) {
    errors.push({ field: 'category', message: 'Category is required' })
  }

  if (!story.country?.trim()) {
    errors.push({ field: 'country', message: 'Country is required' })
  }

  if (!story.body?.trim()) {
    errors.push({ field: 'body', message: 'Body is required' })
  } else if (story.body.length < MIN_BODY_LENGTH) {
    errors.push({ field: 'body', message: `Body must be at least ${MIN_BODY_LENGTH} characters` })
  } else if (story.body.length > MAX_BODY_LENGTH) {
    errors.push({ field: 'body', message: `Body must be less than ${MAX_BODY_LENGTH} characters` })
  }

  // Validate slug uniqueness
  if (story.slug) {
    try {
      const storyPath = join(process.cwd(), 'data', 'stories', `${story.slug}.json`)
      await access(storyPath)
      errors.push({ field: 'slug', message: 'A story with this title already exists' })
    } catch (error) {
      // File doesn't exist, which is what we want
      logger.debug('Slug is unique:', story.slug);
    }
  }

  return errors
}

async function validateImage(file: File): Promise<ValidationError[]> {
  const errors: ValidationError[] = []

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.push({ field: 'files', message: `Invalid image type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}` })
  }

  if (file.size > MAX_IMAGE_SIZE) {
    errors.push({ field: 'files', message: `Image too large: ${file.name}. Maximum size: 5MB` })
  }

  return errors
}

async function validateImageDimensions(file: File): Promise<ValidationError[]> {
  const errors: ValidationError[] = []
  const buffer = await file.arrayBuffer()
  const metadata = await sharp(Buffer.from(buffer)).metadata()

  if (metadata.width && metadata.height) {
    if (metadata.width < MIN_IMAGE_WIDTH || metadata.height < MIN_IMAGE_HEIGHT) {
      errors.push({
        field: 'files',
        message: `Image dimensions too small. Minimum size: ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT} pixels`
      })
    }

    const aspectRatio = metadata.width / metadata.height
    const aspectRatioDiff = Math.abs(aspectRatio - TARGET_ASPECT_RATIO)
    
    if (aspectRatioDiff > ASPECT_RATIO_TOLERANCE) {
      errors.push({
        field: 'files',
        message: `Image aspect ratio should be close to 16:9 for optimal display`
      })
    }
  }

  return errors
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // Verify reCAPTCHA
    const recaptchaToken = formData.get('recaptchaToken') as string
    if (!recaptchaToken || !(await verifyRecaptcha(recaptchaToken))) {
      return NextResponse.json(
        { error: 'reCAPTCHA verification failed' },
        { status: 400 }
      )
    }

    // Extract form fields
    const title = formData.get('title') as string
    const author = formData.get('author') as string
    const category = formData.get('category') as string
    const country = formData.get('country') as string
    const body = formData.get('body') as string
    const metaDescription = formData.get('metaDescription') as string
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim())
    const isSponsored = formData.get('isSponsored') === 'true'
    const editorsPick = formData.get('editorsPick') === 'true'

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Create story object
    const story: Story = {
      title,
      author,
      category,
      country,
      body,
      metaDescription,
      tags,
      isSponsored,
      editorsPick,
      slug,
      timestamp: new Date().toISOString(),
      readTime: Math.ceil(body.split(/\s+/).length / 200)
    }

    // Validate story
    const storyErrors = await validateStory(story)
    if (storyErrors.length > 0) {
      return NextResponse.json(
        { errors: storyErrors },
        { status: 400 }
      )
    }

    // Handle file uploads
    const files = formData.getAll('files') as File[]
    const galleryImages: ImageMetadata[] = []

    if (files.length > 0) {
      // Validate number of images
      if (files.length > MAX_IMAGES) {
        return NextResponse.json(
          { errors: [{ field: 'files', message: `Maximum ${MAX_IMAGES} images allowed` }] },
          { status: 400 }
        )
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadsDir, { recursive: true })

      // Process each file
      for (const file of files) {
        // Validate image type and size
        const imageErrors = await validateImage(file)
        if (imageErrors.length > 0) {
          return NextResponse.json(
            { errors: imageErrors },
            { status: 400 }
          )
        }

        // Validate image dimensions
        const dimensionErrors = await validateImageDimensions(file)
        if (dimensionErrors.length > 0) {
          return NextResponse.json(
            { errors: dimensionErrors },
            { status: 400 }
          )
        }

        const bytes = await file.arrayBuffer()
        const buffer = new Uint8Array(bytes)
        const extension = file.name.split('.').pop()
        const imageName = `${uuidv4()}.${extension}`
        
        // Save file
        const path = join(uploadsDir, imageName)
        await writeFile(path, buffer)
        
        // Get image dimensions
        const metadata = await sharp(buffer).metadata()
        
        // Add to gallery images
        galleryImages.push({
          name: imageName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          width: metadata.width,
          height: metadata.height
        })
      }

      // Set main image and gallery
      story.imageName = galleryImages[0].name
      story.galleryImages = galleryImages
    }

    // Save story to JSON file
    const storiesDir = join(process.cwd(), 'data', 'stories')
    await mkdir(storiesDir, { recursive: true })
    
    const storyPath = join(storiesDir, `${slug}.json`)
    await writeFile(storyPath, JSON.stringify(story, null, 2))

    return NextResponse.json({
      success: true,
      slug,
      message: 'Story submitted successfully!',
      previewUrl: `/stories/${slug}`
    })
  } catch (_error) {
    logger.error('Failed to submit content:', _error)
    return NextResponse.json(
      { error: 'Failed to submit content' },
      { status: 500 }
    )
  }
} 