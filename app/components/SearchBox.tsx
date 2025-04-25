'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import debounce from 'lodash/debounce'

interface SearchBoxProps {
  initialValue?: string
  placeholder?: string
}

export default function SearchBox({ initialValue = '', placeholder = 'Search...' }: SearchBoxProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(initialValue)

  // Debounced search function
  const debouncedSearch = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    params.delete('page') // Reset to first page on new search
    router.push(`/filtered?${params.toString()}`)
  }, [searchParams, router])

  // Create debounced version of the search function
  const debouncedSearchWithDelay = useCallback(
    (term: string) => {
      debounce((searchTerm: string) => debouncedSearch(searchTerm), 300)(term)
    },
    [debouncedSearch]
  )

  // Update search when input changes
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    debouncedSearchWithDelay(term)
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const params = new URLSearchParams(searchParams.toString())
      if (searchTerm) {
        params.set('q', searchTerm)
      } else {
        params.delete('q')
      }
      params.delete('page')
      router.push(`/filtered?${params.toString()}`)
    }
  }

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearchWithDelay.cancel()
    }
  }, [debouncedSearchWithDelay])

  return (
    <div className="relative">
      <input
        type="search"
        value={searchTerm}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Search stories"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  )
} 