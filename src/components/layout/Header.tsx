import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Global Travel Report
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/stories" className="text-gray-600 hover:text-gray-900">
              Stories
            </Link>
            <Link href="/destinations" className="text-gray-600 hover:text-gray-900">
              Destinations
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
            <Button asChild>
              <Link href="/submit">Share Your Story</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  )
} 