import { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from "@/components/ui/button"

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Destinations', href: '/destinations' },
  { name: 'Travel Guides', href: '/guides' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Global Travel Report
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/stories" className="hover:text-gray-600">
              Stories
            </Link>
            <Link href="/submit" className="hover:text-gray-600">
              Submit Story
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