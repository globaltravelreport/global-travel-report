'use client'

import * as Sentry from '@sentry/nextjs'
import { logger } from '@/app/utils/logger'
import { notFound } from 'next/navigation'

export default function SentryTestPage() {
  // Only allow access in development mode
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const handleErrorClick = () => {
    try {
      throw new Error('Sentry test error')
    } catch (error) {
      logger.error('Sentry test error triggered', error)
      Sentry.captureException(error)
      throw error // Re-throw to trigger error boundary
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Sentry Error Test Page
          </h1>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  ⚠️ This page is only available in development mode.
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-8">
            Click the button below to trigger a test error that will be captured by Sentry.
          </p>

          <button
            onClick={handleErrorClick}
            className="px-6 py-3 bg-red-600 text-white rounded-md text-lg font-semibold 
                     hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
                     focus:ring-offset-2 transition-colors duration-200"
          >
            Trigger Test Error
          </button>
        </div>
      </div>
    </div>
  )
} 