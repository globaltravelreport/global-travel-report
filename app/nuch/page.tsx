'use client'

import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import { toast } from 'react-hot-toast'

// Force dynamic rendering and edge runtime
export const dynamic = 'force-dynamic'
export const runtime = 'experimental-edge'
export const preferredRegion = 'auto'

export default function NuchPage() {
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    title: string
    summary: string
    content: string
    keywords: string[]
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url || undefined,
          content: content || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to rewrite content')
      }

      const data = await response.json()
      setResult(data)
      toast.success('Content rewritten successfully!')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout
      title="Content Rewriter"
      description="Transform your content with AI-powered rewriting"
      heroType="simple"
    >
      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Article URL (optional)
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Or paste your content here
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Paste your content here..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || (!url && !content)}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-teal hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Rewriting...' : 'Rewrite Content'}
          </button>
        </form>

        {result && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{result.title}</h2>
              <p className="mt-2 text-gray-600">{result.summary}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Content</h3>
              <div className="mt-2 prose prose-brand-teal max-w-none">
                {result.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">SEO Keywords</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-teal/10 text-brand-teal"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.content)
                  toast.success('Content copied to clipboard!')
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brand-teal bg-brand-teal/10 hover:bg-brand-teal/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal"
              >
                Copy Content
              </button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
} 