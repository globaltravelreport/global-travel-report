'use client'

import { XMarkIcon, ShareIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

interface ActiveFiltersProps {
  category?: string
  country?: string
  tag?: string
  query?: string
}

export default function ActiveFilters({
  category,
  country,
  tag,
  query
}: ActiveFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showCopied, setShowCopied] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const removeFilter = (type: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(type)
    router.push(`/stories?${params.toString()}`)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const hasActiveFilters = category || country || tag || query

  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Active Filters */}
        <div className="flex flex-wrap gap-2">
          {category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
              Category: {category}
              <button
                onClick={() => removeFilter('category')}
                className="ml-1 hover:text-blue-600"
                aria-label={`Remove category filter: ${category}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          )}
          
          {country && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
              Country: {country}
              <button
                onClick={() => removeFilter('country')}
                className="ml-1 hover:text-blue-600"
                aria-label={`Remove country filter: ${country}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          )}
          
          {tag && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
              Tag: {tag}
              <button
                onClick={() => removeFilter('tag')}
                className="ml-1 hover:text-blue-600"
                aria-label={`Remove tag filter: ${tag}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          )}
          
          {query && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
              Search: {query}
              <button
                onClick={() => removeFilter('q')}
                className="ml-1 hover:text-blue-600"
                aria-label={`Remove search filter: ${query}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={copyLink}
            className="inline-flex items-center px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            <ShareIcon className="w-4 h-4 mr-1" />
            {showCopied ? 'Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
            Export
          </button>

          <button
            onClick={() => router.push('/stories?page=1')}
            className="inline-flex items-center px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Export Stories</h3>
            <p className="text-gray-600 mb-4">
              Coming Soon
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 