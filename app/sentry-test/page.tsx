'use client'

import { logger } from '@/app/utils/logger'

export default function SentryTestPage() {
  const handleErrorClick = () => {
    try {
      // @ts-expect-error - Intentionally calling undefined function
      myUndefinedFunction()
    } catch (error) {
      logger.error('Sentry test error triggered', error)
      throw error // Re-throw to trigger Sentry
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Trigger Sentry Error
          </h1>

          <button
            onClick={handleErrorClick}
            className="px-6 py-3 bg-red-600 text-white rounded-md text-lg font-semibold 
                     hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 
                     focus:ring-offset-2 transition-colors duration-200"
          >
            Click to Trigger Error
          </button>
        </div>
      </div>
    </div>
  )
} 