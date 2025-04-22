import { NextResponse } from 'next/server'

// Get build information from environment variables
const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString()
const buildId = process.env.NEXT_PUBLIC_BUILD_ID || 'development'
const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'local'

export async function GET() {
  return NextResponse.json({
    version: process.env.npm_package_version || '0.1.0',
    buildTime,
    buildId,
    commitSha,
    environment: process.env.NODE_ENV,
    deploymentUrl: process.env.NEXT_PUBLIC_VERCEL_URL || 'localhost',
    status: 'healthy',
    lastChecked: new Date().toISOString()
  })
} 