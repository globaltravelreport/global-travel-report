'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReCaptcha } from '@/components/ui/ReCaptcha'

interface StoryFormData {
  title: string
  content: string
  category: string
  country: string
  tags: string
}

export function StoryForm() {
  const [formData, setFormData] = useState<StoryFormData>({
    title: '',
    content: '',
    category: '',
    country: '',
    tags: '',
  })
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError('')

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA verification')
      setStatus('error')
      return
    }

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit story')
      }

      setStatus('success')
      setFormData({
        title: '',
        content: '',
        category: '',
        country: '',
        tags: '',
      })
      setRecaptchaToken('')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <Input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full"
          aria-invalid={status === 'error' ? 'true' : 'false'}
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
          rows={10}
          className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          aria-invalid={status === 'error' ? 'true' : 'false'}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <Input
          id="category"
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          className="w-full"
          aria-invalid={status === 'error' ? 'true' : 'false'}
        />
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <Input
          id="country"
          type="text"
          value={formData.country}
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          required
          className="w-full"
          aria-invalid={status === 'error' ? 'true' : 'false'}
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags (comma-separated)
        </label>
        <Input
          id="tags"
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          required
          className="w-full"
          aria-invalid={status === 'error' ? 'true' : 'false'}
        />
      </div>

      <ReCaptcha
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
        onChange={(token: string | null) => {
          if (!token) {
            setError('Please complete the reCAPTCHA verification');
          }
          setRecaptchaToken(token || '');
        }}
      />

      {status === 'error' && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={status === 'loading'}
        aria-label="Submit story"
      >
        {status === 'loading' ? 'Submitting...' : 'Submit Story'}
      </Button>

      {status === 'success' && (
        <p className="text-sm text-green-600">
          Thanks for your submission! Our team will review it shortly.
        </p>
      )}
    </form>
  )
} 