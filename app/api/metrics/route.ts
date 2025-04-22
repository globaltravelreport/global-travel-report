import { NextResponse } from 'next/server'
import { getMetrics } from '../../lib/stories'
import { siteConfig } from '../../config/site'

export const revalidate = siteConfig.cacheDuration.metrics

export async function GET() {
  try {
    const metrics = await getMetrics()
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Failed to fetch metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
} 