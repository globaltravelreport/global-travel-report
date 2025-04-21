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
      title="AI Content Rewriter"
      description="Transform your content with AI-powered rewriting"
      heroType="none"
    >
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">AI Content Rewriter</h1>
          <p className="text-lg text-gray-600 mb-8 text-center">Transform your content with AI-powered rewriting</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow-xl rounded-lg p-8 border-2 border-gray-200">
              <div className="space-y-6">
                <div>
                  <label htmlFor="url" className="block text-lg font-medium text-gray-700 mb-2">
                    Paste a URL
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/article"
                      className="flex-1 min-w-0 block w-full px-4 py-3 rounded-l-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-base bg-white"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || (!url && !content)}
                      className="ml-px inline-flex items-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-r-md text-white bg-brand-teal hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                  {url && (
                    <button
                      type="button"
                      onClick={() => setUrl('')}
                      className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear URL
                    </button>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-gray-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 py-1 bg-white text-base text-gray-500 font-medium">Or</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-2">
                    Paste content directly
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    placeholder="Paste your content here..."
                    className="mt-1 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal text-base bg-white px-4 py-3"
                  />
                </div>
              </div>
            </div>
          </form>

          {result && (
            <div className="mt-8 bg-white shadow-xl rounded-lg p-8 border-2 border-gray-200">
              <div className="space-y-6">
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
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
} 