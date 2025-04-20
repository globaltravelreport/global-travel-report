'use client'

import { useState, useEffect } from 'react'
import { StoryDraft, Category } from '@/types/content'
import PageLayout from '../components/PageLayout'
import StoryEditor from '../components/StoryEditor'

export default function RewritePage() {
  const [url, setUrl] = useState('')
  const [directContent, setDirectContent] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [story, setStory] = useState<StoryDraft>({
    title: '',
    content: '',
    category: 'news' as Category,
    status: 'draft',
    author: 'Nuch',
    isReadyToPublish: false,
    summary: '',
    slug: '',
    featuredImage: {
      url: '',
      alt: ''
    },
    seo: {
      title: '',
      description: '',
      keywords: []
    }
  })

  useEffect(() => {
    // Check if we're authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/rewrite', {
          credentials: 'include',
          headers: {
            'Authorization': 'Basic ' + btoa('Admin:Nuch07!')
          }
        })
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) {
      setError('Please enter a URL')
      return
    }

    // Validate URL format
    try {
      new URL(url)
    } catch (error) {
      setError('Please enter a valid URL')
      return
    }

    setIsProcessing(true)
    setError(null)
    setIsSuccess(false)

    try {
      console.log('Sending request to rewrite API...')
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceUrl: url,
          guidelines: {
            platform: 'Global Travel Report',
            tone: 'professional and engaging',
            length: 'concise',
            requirements: [
              'Use proper grammar and punctuation',
              'Include relevant travel tips and insights',
              'Maintain a positive and informative tone'
            ]
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch and rewrite content')
      }

      const rewrittenContent = await response.json()
      console.log('Successfully received rewritten content')
      
      setStory(prevStory => ({
        ...prevStory,
        title: rewrittenContent.title,
        content: rewrittenContent.content,
        summary: rewrittenContent.summary,
        seo: {
          ...prevStory.seo,
          title: rewrittenContent.seo?.title || rewrittenContent.title,
          description: rewrittenContent.seo?.description || rewrittenContent.summary,
          keywords: rewrittenContent.keywords || []
        }
      }))
      setIsSuccess(true)
      setUrl('') // Clear the URL input after success
    } catch (error) {
      console.error('Error in handleUrlSubmit:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch and rewrite content')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDirectContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      // TODO: Process direct content
      console.log('Processing direct content:', directContent)
    } catch (error) {
      console.error('Error processing content:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePublish = async (updatedStory: StoryDraft) => {
    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish story');
      }

      const publishedStory = await response.json();
      console.log('Successfully published story:', publishedStory);
      
      // Show success message
      alert('Story published successfully!');
      
      // Redirect to the article page
      window.location.href = `/articles/${publishedStory.slug}`;
    } catch (error) {
      console.error('Error publishing story:', error);
      alert(error instanceof Error ? error.message : 'Failed to publish story');
    }
  };

  const categories: Category[] = ['news', 'reviews', 'tips', 'deals', 'destinations']

  if (!isAuthenticated) {
    return null // The middleware will handle the auth prompt
  }

  return (
    <PageLayout
      title="Content Rewriter"
      description="Rewrite and enhance your content"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* URL Input Section */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Rewrite from URL</h2>
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                  URL to rewrite
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal sm:text-sm"
                  placeholder="https://example.com/article"
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              {isSuccess && (
                <div className="text-green-600 text-sm">Content successfully rewritten! Check the editor below.</div>
              )}
              <button
                type="submit"
                disabled={isProcessing || !url}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-teal hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Fetch & Rewrite'}
              </button>
            </form>
          </div>

          {/* Direct Content Input Section */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Rewrite Direct Content</h2>
            <form onSubmit={handleDirectContentSubmit} className="space-y-4">
              <div>
                <label htmlFor="directContent" className="block text-sm font-medium text-gray-700">
                  Content to rewrite
                </label>
                <textarea
                  id="directContent"
                  rows={5}
                  value={directContent}
                  onChange={(e) => setDirectContent(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-teal focus:ring-brand-teal sm:text-sm"
                  placeholder="Paste your content here..."
                />
              </div>
              <button
                type="submit"
                disabled={isProcessing || !directContent}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-teal hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Rewrite Content'}
              </button>
            </form>
          </div>

          {/* Story Editor */}
          {story.content && (
            <div className="bg-white shadow sm:rounded-lg">
              <StoryEditor
                initialData={story}
                onPublish={handlePublish}
              />
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  )
} 