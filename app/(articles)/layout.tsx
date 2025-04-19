import { ReactNode } from 'react'
import { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Articles | Global Travel Report',
  description: 'Latest travel news, reviews, and tips from around the world.',
  openGraph: {
    title: 'Articles | Global Travel Report',
    description: 'Latest travel news, reviews, and tips from around the world.',
    type: 'website',
  },
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-8">{children}</main>
    </div>
  )
} 