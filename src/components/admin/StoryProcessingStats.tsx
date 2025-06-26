"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'

interface ProcessingStats {
  totalStories: number
  processedStories: number
  pendingStories: number
  failedStories: number
  averageProcessingTime: number
}

export function StoryProcessingStats() {
  const [stats, setStats] = useState<ProcessingStats>({
    totalStories: 0,
    processedStories: 0,
    pendingStories: 0,
    failedStories: 0,
    averageProcessingTime: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/processing-stats')
        if (!response.ok) {
          throw new Error('Failed to fetch processing stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading stats...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processing Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Total Stories</p>
            <p className="text-2xl font-semibold">{stats.totalStories}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Processed</p>
            <p className="text-2xl font-semibold">{stats.processedStories}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-semibold">{stats.pendingStories}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600">Failed</p>
            <p className="text-2xl font-semibold">{stats.failedStories}</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Average Processing Time: {stats.averageProcessingTime.toFixed(2)}s
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 