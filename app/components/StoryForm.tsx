'use client'

import { useState } from 'react'
import { Story } from '../lib/stories'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import ReCAPTCHA from 'react-google-recaptcha'

interface StoryFormProps {
  story?: Story
  onSubmit: (story: Story) => Promise<void>
  submitButtonText?: string
  showRecaptcha?: boolean
}

export default function StoryForm({
  story: initialStory,
  onSubmit,
  submitButtonText = 'Submit',
  showRecaptcha = false
}: StoryFormProps) {
  const [story, setStory] = useState<Story>(initialStory || {
    title: '',
    content: '',
    summary: '',
    keywords: [],
    slug: '',
    date: new Date().toISOString(),
    timestamp: Date.now(),
    lastModified: Date.now(),
    country: '',
    type: '',
    imageUrl: '',
    imageAlt: '',
    author: '',
    source: '',
    sourceUrl: '',
    tags: [],
    body: '',
    published: false,
    category: '',
    featured: false,
    editorsPick: false,
    readTime: 0,
    metaDescription: '',
    isSponsored: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (showRecaptcha && !recaptchaToken) {
      alert('Please complete the reCAPTCHA verification')
      return
    }
    
    setIsSubmitting(true)
    try {
      await onSubmit(story)
    } catch (error) {
      console.error('Error submitting story:', error)
      alert('Failed to submit story. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setStory(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <Input
          type="text"
          name="title"
          id="title"
          value={story.title}
          onChange={handleInputChange}
          required
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
          Summary
        </label>
        <Textarea
          name="summary"
          id="summary"
          value={story.summary}
          onChange={handleInputChange}
          required
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <Textarea
          name="content"
          id="content"
          value={story.content}
          onChange={handleInputChange}
          required
          className="mt-1"
          rows={10}
        />
      </div>

      {showRecaptcha && (
        <div>
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            onChange={token => setRecaptchaToken(token)}
          />
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting || (showRecaptcha && !recaptchaToken)}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-teal hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  )
} 