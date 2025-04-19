import { ReactNode } from 'react'
import Image from 'next/image'

interface PageLayoutProps {
  title: string
  description: string
  heroImage?: string
  children: ReactNode
}

export default function PageLayout({ title, description, heroImage, children }: PageLayoutProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 md:h-96">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy to-brand-teal opacity-90" />
        {heroImage && (
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl">{description}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {children}
      </div>
    </main>
  )
} 