'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface StoryFiltersProps {
  countries: string[]
  types: string[]
}

export default function StoryFilters({ countries, types }: StoryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCountry = searchParams.get('country') || ''
  const currentType = searchParams.get('type') || ''

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }

      return params.toString()
    },
    [searchParams]
  )

  const handleCountryChange = (country: string) => {
    const query = createQueryString('country', country)
    router.push(`/?${query}`)
  }

  const handleTypeChange = (type: string) => {
    const query = createQueryString('type', type)
    router.push(`/?${query}`)
  }

  const clearFilters = () => {
    router.push('/')
  }

  const hasFilters = currentCountry || currentType

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
      <div className="flex-1 w-full sm:w-auto">
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          🗺️ Filter by Country
        </label>
        <select
          id="country"
          value={currentCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 w-full sm:w-auto">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
          🏖️ Filter by Type
        </label>
        <select
          id="type"
          value={currentType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {types.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6 sm:mt-0"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
} 