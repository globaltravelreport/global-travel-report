'use client'

import { useState } from 'react'
import PageLayout from '../components/PageLayout'

export default function NuchPage() {
  const [inputText, setInputText] = useState('')
  const [platform, setPlatform] = useState('facebook')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to rewrite')
      return
    }

    setIsLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          platform,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to rewrite content')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err) {
      setError('An error occurred while rewriting the content')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
  }

  return (
    <PageLayout
      title="AI Rewriter Tool"
      description="Private content rewriting tool"
      heroImage="/images/destinations-hero.jpg"
    >
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 md:p-8 border border-gray-200/50">
          <h2 className="text-3xl font-bold text-center mb-8 text-brand-navy">
            AI Rewriter Tool (Private Use)
          </h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="inputText" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your content here
              </label>
              <textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
                placeholder="Paste your article or social media text here..."
              />
            </div>

            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-700 mb-2">
                Select platform
              </label>
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-transparent"
              >
                <option value="facebook">Rewrite for Facebook</option>
                <option value="instagram">Rewrite for Instagram</option>
                <option value="blog">Rewrite for Blog</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              onClick={handleRewrite}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-brand-navy to-brand-teal text-white py-3 px-6 rounded-lg hover:from-navy-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Rewriting...' : 'Rewrite'}
            </button>

            {result && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Rewritten Content</h3>
                  <button
                    onClick={copyToClipboard}
                    className="text-brand-teal hover:text-teal-600 font-medium"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="whitespace-pre-wrap">{result}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
} 