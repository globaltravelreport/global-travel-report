'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StoryCard } from './StoryCard'
import type { Story } from '@/lib/stories'

interface StorySearchProps {
  stories: Story[]
}

export function StorySearch({ stories }: StorySearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showFeatured, setShowFeatured] = useState(false)
  const [showRecent, setShowRecent] = useState(false)
  const [showEditorsPick, setShowEditorsPick] = useState(false)

  const categories = useMemo(() => {
    const uniqueCategories = new Set(stories.map(story => story.category))
    return Array.from(uniqueCategories)
  }, [stories])

  const countries = useMemo(() => {
    const uniqueCountries = new Set(stories.map(story => story.country))
    return Array.from(uniqueCountries)
  }, [stories])

  const tags = useMemo(() => {
    const uniqueTags = new Set(stories.flatMap(story => story.tags))
    return Array.from(uniqueTags)
  }, [stories])

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || story.category === selectedCategory
      const matchesCountry = !selectedCountry || story.country === selectedCountry
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => story.tags.includes(tag))
      const matchesFeatured = !showFeatured || story.featured
      const matchesEditorsPick = !showEditorsPick || story.editorsPick
      const matchesRecent = !showRecent || new Date(story.publishedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      return matchesSearch && matchesCategory && matchesCountry && matchesTags && matchesFeatured && matchesEditorsPick && matchesRecent
    })
  }, [stories, searchTerm, selectedCategory, selectedCountry, selectedTags, showFeatured, showRecent, showEditorsPick])

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="search"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button
            variant={showFeatured ? 'default' : 'outline'}
            onClick={() => setShowFeatured(!showFeatured)}
          >
            Featured
          </Button>
          <Button
            variant={showRecent ? 'default' : 'outline'}
            onClick={() => setShowRecent(!showRecent)}
          >
            Recent
          </Button>
          <Button
            variant={showEditorsPick ? 'default' : 'outline'}
            onClick={() => setShowEditorsPick(!showEditorsPick)}
          >
            Editor's Pick
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? 'default' : 'outline'}
            onClick={() => {
              setSelectedTags(prev =>
                prev.includes(tag)
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              )
            }}
          >
            {tag}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  )
} 