'use client'

import { useState } from 'react'
import { RewrittenContent } from '@/types/content'
import Link from 'next/link'

interface ContentRewriterProps {
  onRewriteComplete: (content: RewrittenContent) => void
}

export default function ContentRewriter({ onRewriteComplete }: ContentRewriterProps) {
  const [originalContent, setOriginalContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [articleSlug, setArticleSlug] = useState('')

  const handleRewrite = async () => {
    if (!originalContent && !sourceUrl) {
      setError('Please provide either content or a URL to rewrite')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: originalContent,
          sourceUrl,
          guidelines: {
            type: 'editorial',
            platform: 'Global Travel Report',
            tone: 'informative and friendly',
            format: 'article',
            length: '300-400 words',
            requirements: [
              'Original editorial content',
              'No reference to original source',
              'Conversational tone without emojis',
              'Strong engaging title',
              'One-sentence summary',
              '3-5 SEO keywords',
              'Optional CTA'
            ]
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to rewrite content')
      }

      const rewrittenContent: RewrittenContent = await response.json()
      onRewriteComplete(rewrittenContent)
      setOriginalContent('')
      setSourceUrl('')
      setSuccess(true)
      setArticleSlug(rewrittenContent.slug)
    } catch (err) {
      console.error('Error rewriting content:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source URL (Optional)
        </label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          placeholder="https://example.com/article"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Original Content
        </label>
        <textarea
          value={originalContent}
          onChange={(e) => setOriginalContent(e.target.value)}
          className="w-full h-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          placeholder="Paste the content you want to rewrite..."
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <p className="font-medium">Content successfully rewritten!</p>
          <p className="text-sm mt-1">
            View your article: {' '}
            <Link 
              href={`/articles/${articleSlug}`}
              className="text-brand-teal hover:underline"
            >
              Click here
            </Link>
          </p>
        </div>
      )}

      <button
        onClick={handleRewrite}
        disabled={isLoading || (!originalContent && !sourceUrl)}
        className="w-full py-2 px-4 bg-brand-teal text-white rounded-md hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-teal focus:ring-offset-2 relative"
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin mr-2">⟳</span>
            Rewriting...
          </>
        ) : (
          'Rewrite Content'
        )}
      </button>
    </div>
  )
} 