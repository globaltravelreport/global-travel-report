'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Story } from '../lib/stories'

interface FilterSidebarProps {
  categories: string[]
  countries: string[]
  selectedCategory?: string
  selectedCountry?: string
  selectedTags: string[]
  stories: Story[]
}

export default function FilterSidebar({
  categories,
  countries,
  selectedCategory,
  selectedCountry,
  selectedTags,
  stories
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle window resize to show/hide sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Get all unique tags from stories
  const allTags = Array.from(
    new Set(stories.flatMap(story => story.tags))
  ).sort()

  const updateFilters = (type: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '1') // Reset to first page when changing filters
    
    if (value === null) {
      params.delete(type)
    } else {
      params.set(type, value)
    }
    
    router.push(`/stories?${params.toString()}`)
  }

  const removeTag = (_tag: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tag')
    router.push(`/stories?${params.toString()}`)
  }

  return (
    <div className="relative">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between p-4 bg-white rounded-lg shadow mb-4"
      >
        <span className="font-medium">Filters</span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </button>

      {/* Filter Sidebar */}
      <div
        className={`transform transition-all duration-300 ease-in-out ${
          isOpen
            ? 'translate-y-0 opacity-100'
            : 'lg:translate-y-0 lg:opacity-100 -translate-y-10 opacity-0 pointer-events-none'
        } lg:pointer-events-auto`}
      >
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={() => {
                router.push('/stories?page=1')
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Reset All
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => updateFilters('category', cat === selectedCategory ? null : cat)}
                  className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
                    selectedCategory === cat ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Countries */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Countries</h3>
            <div className="space-y-2">
              {countries.map(country => (
                <button
                  key={country}
                  onClick={() => updateFilters('country', country === selectedCountry ? null : country)}
                  className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${
                    selectedCountry === country ? 'bg-blue-50 text-blue-600 font-medium' : ''
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => tag && updateFilters('tag', tag === selectedTags[0] ? null : tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    tag && selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                  {tag && selectedTags.includes(tag) && (
                    <XMarkIcon
                      className="w-4 h-4 ml-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTag(tag)
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 