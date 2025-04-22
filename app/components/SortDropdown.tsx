'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface SortDropdownProps {
  currentSort: string
}

export default function SortDropdown({ currentSort }: SortDropdownProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.set('page', '1') // Reset to first page when changing sort
    router.push(`/stories?${params.toString()}`)
  }

  return (
    <div className="relative">
      <label htmlFor="sort-select" className="sr-only">
        Sort by
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="appearance-none bg-white border rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Sort stories by"
      >
        <option value="newest">Newest</option>
        {/* Add more sort options here in the future */}
      </select>
      <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  )
} 