'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { logger } from '@/app/utils/logger'

interface ImageMetadata {
  name: string
  originalName: string
  size: number
  type: string
  width?: number
  height?: number
}

interface FormData {
  title: string
  body: string
  category: string
  country: string
  featured: boolean
  heroImage: File | null
  slug?: string
  metaTitle?: string
  metaDescription?: string
  timestamp?: string
  tags?: string[]
  isSponsored?: boolean
  editorsPick?: boolean
  author: string
}

interface StoryData {
  title: string
  content: string
  category: string
  country: string
  slug: string
  metaTitle: string
  metaDescription: string
  timestamp: string
  body?: string
  excerpt?: string
  readTime?: number
  published?: boolean
  featured?: boolean
  isSponsored?: boolean
  editorsPick?: boolean
  tags?: string[]
  heroImage?: File
  imageName?: string
  galleryImages?: ImageMetadata[]
  author?: string
}

interface UploadedFile {
  url: string
  imageName: string
}

const CATEGORIES = [
  'Flights',
  'Ocean Cruises',
  'River Cruises',
  'Hotels',
  'Tours',
  'Car Hire',
  'Insurance',
  'Travel Tips'
] as const

// Utility to escape HTML for meta tags
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (char) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char] || char)
  )
}

// Local SEO generator with robust slug and meta handling
function generateLocalSEO(
  title: string,
  body: string,
  slugSuffix?: string // Optional: for uniqueness
): {
  slug: string
  metaTitle: string
  metaDescription: string
} {
  // Normalize and slugify title
  let slug = title
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanum
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') // Trim - from ends

  if (slugSuffix) {
    slug += `-${slugSuffix}`
  }

  // Clean and escape meta title/description
  const metaTitle = escapeHtml(title.trim()).slice(0, 60)
  const metaDescription = escapeHtml(
    body.replace(/\s+/g, ' ').trim()
  ).slice(0, 160)

  return {
    slug,
    metaTitle,
    metaDescription,
  }
}

// Auto-tagging helper function
function autoTagStory(title: string, body: string) {
  const content = `${title} ${body}`.toLowerCase()

  const categories = [
    { keyword: ['qantas', 'flight', 'airfare', 'airport', 'jetstar', 'emirates', 'check-in'], value: 'flights' },
    { keyword: ['cruise', 'princess', 'royal caribbean', 'ocean', 'carnival', 'celebrity', 'msc'], value: 'ocean-cruises' },
    { keyword: ['river', 'danube', 'rhine', 'viking', 'avalon', 'amawaterways', 'douro'], value: 'river-cruises' },
    { keyword: ['hotel', 'resort', 'stay', 'accommodation', 'check-in', 'check-out', 'room'], value: 'hotels' },
    { keyword: ['tour', 'escorted', 'sightseeing', 'excursion', 'guided', 'group tour'], value: 'tours' },
    { keyword: ['car hire', 'car rental', 'rental car', 'driving'], value: 'car-hire' },
    { keyword: ['insurance', 'policy', 'cover', 'emergency', 'claim'], value: 'insurance' },
    { keyword: ['tips', 'guide', 'travel advice', 'what to pack'], value: 'travel-tips' }
  ]

  const countries = [
    'thailand', 'japan', 'australia', 'france', 'italy', 'vietnam', 'new zealand',
    'greece', 'egypt', 'turkey', 'canada', 'usa', 'america', 'mexico', 'indonesia',
    'bali', 'spain', 'portugal', 'romania', 'slovenia', 'germany', 'netherlands',
    'uk', 'england', 'ireland', 'scotland', 'croatia', 'switzerland', 'austria',
    'hungary', 'czech', 'dubai', 'uae', 'singapore', 'china', 'south korea',
    'philippines', 'malaysia'
  ]

  const matchedCategory = categories.find(cat =>
    cat.keyword.some(k => content.includes(k))
  )

  const matchedCountry = countries.find(c =>
    content.includes(c)
  )

  return {
    category: matchedCategory?.value || '',
    country: matchedCountry || ''
  }
}

export default function RodneyPage() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    body: '',
    category: '',
    country: '',
    featured: false,
    heroImage: null,
    tags: [],
    isSponsored: false,
    editorsPick: false,
    author: 'Rodney Pattison' // Default author
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const updateDependentFields = () => {
      if (formData.category || formData.country) {
        logger.debug('Updating dependent fields', {
          category: formData.category,
          country: formData.country
        })
        // Update dependent fields based on category and country
      }
    }

    updateDependentFields()
  }, [formData.category, formData.country])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      logger.info('Submitting form data', { formData })
      const autoTags = autoTagStory(formData.title, formData.body)
      const seo = generateLocalSEO(formData.title, formData.body, Date.now().toString())
      
      let imageName = null
      if (formData.heroImage) {
        const formDataFile = new FormData()
        formDataFile.append('file', formData.heroImage)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataFile,
        })
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Failed to upload image')
        }
        
        const uploadResult = await uploadResponse.json()
        imageName = uploadResult.imageName
      }
      
      // Create story data with proper type handling
      const storyData: StoryData = {
        title: formData.title,
        content: formData.body,
        category: formData.category || autoTags.category || 'Uncategorized',
        country: formData.country || autoTags.country || 'Unknown',
        slug: seo.slug,
        metaTitle: seo.metaTitle,
        metaDescription: seo.metaDescription,
        timestamp: new Date().toISOString(),
        body: formData.body,
        featured: formData.featured,
        isSponsored: formData.isSponsored,
        editorsPick: formData.editorsPick,
        tags: formData.tags,
        heroImage: formData.heroImage || undefined,
        readTime: Math.ceil(formData.body.split(/\s+/).length / 200),
        author: formData.author,
        imageName: imageName || undefined
      }

      // Submit to API
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save story')
      }

      // Reset form and show success message
      setFormData({
        title: '',
        body: '',
        category: '',
        country: '',
        featured: false,
        heroImage: null,
        tags: [],
        isSponsored: false,
        editorsPick: false,
        author: 'Rodney Pattison'
      })
      setPreview(null)
      alert('Story published successfully!')
    } catch (error) {
      logger.error('Form submission failed', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, heroImage: file }))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
    setError(null)

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setUploadedFiles(result.files)
      setSelectedFiles([])
      setPreviews([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Submit New Story
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                Author
              </label>
              <input
                type="text"
                id="author"
                value={formData.author}
                onChange={e => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            {/* Body */}
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700">
                Body
              </label>
              <textarea
                id="body"
                rows={8}
                value={formData.body}
                onChange={e => setFormData(prev => ({ ...prev, body: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category (auto-detected)
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category.toLowerCase().replace(/\s+/g, '-')}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country (auto-detected)
              </label>
              <input
                type="text"
                id="country"
                value={formData.country}
                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            {/* Feature on Homepage */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={e => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Feature on Homepage
              </label>
            </div>

            {/* Hero Image */}
            <div>
              <label htmlFor="heroImage" className="block text-sm font-medium text-gray-700">
                Hero Image
              </label>
              <input
                type="file"
                id="heroImage"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Story'}
              </button>
            </div>
          </form>

          {/* Preview */}
          {preview && (
            <div className="mt-8 border-t pt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Form Data Preview</h2>
              <pre 
                className="bg-gray-50 rounded-md p-4 overflow-auto text-sm whitespace-pre-wrap"
                aria-label="Form JSON Preview"
                tabIndex={0}
              >
                {preview}
              </pre>
            </div>
          )}

          {/* File Input */}
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Select Images to Upload
            </label>
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: JPEG, PNG, WebP (max 5MB each)
            </p>
          </div>

          {/* Preview Section */}
          {previews.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Selected Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-video">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload Images'}
          </button>

          {/* Uploaded Images */}
          {uploadedFiles.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Uploaded Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative aspect-video">
                    <Image
                      src={file.url}
                      alt={`Uploaded ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                      {file.imageName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/*
To display stories on the homepage, you can:

1. Create a server component that reads all JSON files from /data/stories:
```typescript
async function getStories() {
  const storiesDir = path.join(process.cwd(), 'data', 'stories')
  const files = await fs.readdir(storiesDir)
  const stories = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(path.join(storiesDir, file), 'utf-8')
      return JSON.parse(content)
    })
  )
  return stories.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}
```

2. In your homepage component:
```typescript
const stories = await getStories()
const featuredStories = stories.filter(story => story.featured)
const latestStories = stories.slice(0, 4) // Get 4 most recent stories
```

3. Render the stories in your homepage layout:
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {featuredStories.map(story => (
    <StoryCard key={story.slug} story={story} />
  ))}
</div>
```
*/ 