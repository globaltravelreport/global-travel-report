'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ReCAPTCHA from 'react-google-recaptcha'

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
  author: string
  category: string
  country: string
  body: string
  metaDescription: string
  tags: string[]
  isSponsored: boolean
  editorsPick: boolean
  files: File[]
}

interface ValidationError {
  field: string
  message: string
}

interface SubmissionResponse {
  success: boolean
  slug?: string
  message?: string
  previewUrl?: string
  errors?: ValidationError[]
}

const CATEGORIES = [
  'Adventure',
  'Culture',
  'Food',
  'Luxury',
  'Nature',
  'Urban',
  'Wellness'
] as const

export default function StoryForm() {
  const router = useRouter()
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    author: '',
    category: '',
    country: '',
    body: '',
    metaDescription: '',
    tags: [],
    isSponsored: false,
    editorsPick: false,
    files: []
  })

  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: Array.from(e.target.files!)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors([])
    setSubmissionResult(null)

    try {
      const recaptchaToken = await recaptchaRef.current?.executeAsync()
      if (!recaptchaToken) {
        throw new Error('reCAPTCHA verification failed')
      }

      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'files') {
          formData.files.forEach(file => formDataToSend.append('files', file))
        } else if (key === 'tags') {
          formDataToSend.append('tags', formData.tags.join(','))
        } else {
          formDataToSend.append(key, value.toString())
        }
      })
      
      formDataToSend.append('recaptchaToken', recaptchaToken)

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formDataToSend
      })

      const result: SubmissionResponse = await response.json()

      if (!response.ok) {
        setErrors(result.errors || [{ field: 'form', message: 'Submission failed' }])
        return
      }

      setSubmissionResult(result)
      // Reset form after successful submission
      setFormData({
        title: '',
        author: '',
        category: '',
        country: '',
        body: '',
        metaDescription: '',
        tags: [],
        isSponsored: false,
        editorsPick: false,
        files: []
      })
    } catch (error) {
      setErrors([{ 
        field: 'form', 
        message: error instanceof Error ? error.message : 'Failed to submit story'
      }])
    } finally {
      setIsSubmitting(false)
      recaptchaRef.current?.reset()
    }
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  if (submissionResult?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-medium">{submissionResult.message}</h3>
        <div className="mt-4 flex space-x-4">
          <a
            href={submissionResult.previewUrl}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Preview Story
          </a>
          <button
            type="button"
            onClick={() => setSubmissionResult(null)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Submit Another Story
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.some(error => error.field === 'form') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{getFieldError('form')}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              getFieldError('title') ? 'border-red-300' : ''
            }`}
            required
          />
          {getFieldError('title') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
          )}
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">
            Author
          </label>
          <input
            type="text"
            name="author"
            id="author"
            value={formData.author}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              getFieldError('author') ? 'border-red-300' : ''
            }`}
            required
          />
          {getFieldError('author') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('author')}</p>
          )}
        </div>

        {/* Body */}
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Story Content
          </label>
          <textarea
            name="body"
            id="body"
            rows={8}
            value={formData.body}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              getFieldError('body') ? 'border-red-300' : ''
            }`}
            required
          />
          {getFieldError('body') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('body')}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              getFieldError('category') ? 'border-red-300' : ''
            }`}
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category.toLowerCase()}>
                {category}
              </option>
            ))}
          </select>
          {getFieldError('category') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('category')}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            name="country"
            id="country"
            value={formData.country}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              getFieldError('country') ? 'border-red-300' : ''
            }`}
            required
          />
          {getFieldError('country') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('country')}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            name="tags"
            id="tags"
            value={formData.tags.join(', ')}
            onChange={handleTagsChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              getFieldError('tags') ? 'border-red-300' : ''
            }`}
          />
          {getFieldError('tags') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('tags')}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <label htmlFor="files" className="block text-sm font-medium text-gray-700">
            Images (16:9 ratio recommended, min 800x500px)
          </label>
          <input
            type="file"
            name="files"
            id="files"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className={`mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100 ${
                getFieldError('files') ? 'border-red-300' : ''
              }`}
          />
          {getFieldError('files') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('files')}</p>
          )}
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isSponsored"
              id="isSponsored"
              checked={formData.isSponsored}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isSponsored" className="ml-2 block text-sm text-gray-700">
              Sponsored Content
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="editorsPick"
              id="editorsPick"
              checked={formData.editorsPick}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="editorsPick" className="ml-2 block text-sm text-gray-700">
              Editor's Pick
            </label>
          </div>
        </div>

        <ReCAPTCHA
          ref={recaptchaRef}
          size="invisible"
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Story'}
        </button>
      </div>
    </form>
  )
} 