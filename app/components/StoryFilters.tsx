'use client'

import { useRouter } from 'next/navigation'

interface Country {
  name: string
  slug: string
}

interface StoryFiltersProps {
  countries: Country[]
  types: string[]
  selectedCountry?: string
  selectedType?: string
  basePath: string
}

export default function StoryFilters({ 
  countries, 
  types, 
  selectedCountry, 
  selectedType, 
  basePath 
}: StoryFiltersProps) {
  const router = useRouter()

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countrySlug = e.target.value
    if (countrySlug) {
      router.push(`/countries/${countrySlug}`)
    } else {
      // If no country is selected, go back to the base path
      router.push(basePath)
    }
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value
    if (type) {
      const params = new URLSearchParams()
      params.set('type', type)
      if (selectedCountry) params.set('country', selectedCountry)
      router.push(`${basePath}?${params.toString()}`)
    }
  }

  // Find the selected country's slug
  const selectedCountrySlug = selectedCountry?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8">
      <div className="flex-1">
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
          🌍 Filter by Country
        </label>
        <select
          id="country"
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleCountryChange}
          value={selectedCountrySlug || ''}
        >
          <option value="">All Countries</option>
          {countries.map((country) => (
            <option key={country.slug} value={country.slug}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
          🎯 Filter by Type
        </label>
        <select
          id="type"
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={handleTypeChange}
          value={selectedType || ''}
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
} 