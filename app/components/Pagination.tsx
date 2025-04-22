'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalPages: number
  currentPage: number
  basePath: string
}

export default function Pagination({ totalPages, currentPage, basePath }: PaginationProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const tag = searchParams.get('tag')

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (tag) params.set('tag', tag)
    params.set('page', page.toString())
    return `${basePath}?${params.toString()}`
  }

  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center space-x-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-3 py-1 rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
        >
          Previous
        </Link>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`px-3 py-1 rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-3 py-1 rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
        >
          Next
        </Link>
      )}
    </nav>
  )
} 