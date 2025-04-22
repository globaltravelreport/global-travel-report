'use client'

import { useState } from 'react'

export default function NuchPage() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:Nuch07!')}`
        },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Unknown error')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Content Rewriter
          </h1>
          <p className="mt-3 text-xl text-gray-500 sm:mt-4">
            Enter a URL or paste content to rewrite
          </p>
        </div>

        <div className="mt-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                URL
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  name="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="shadow-sm focus:ring-brand-teal focus:border-brand-teal block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://example.com/article"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || !url}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-teal hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Rewriting...' : 'Rewrite'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Title</h3>
                <p className="mt-2 text-gray-700">{result.title}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Summary</h3>
                <p className="mt-2 text-gray-700">{result.summary}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Content</h3>
                <div className="mt-2 prose prose-brand-teal max-w-none">
                  {result.content.split('\n\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Keywords</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.keywords.map((keyword: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-teal text-white"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 