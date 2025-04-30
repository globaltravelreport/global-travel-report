"use client";

import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { StoryCard } from "@/src/components/stories/StoryCard";
import type { Story } from "@/lib/stories";

interface StorySearchProps {
  stories: Story[];
}

export const StorySearch: React.FC<StorySearchProps> = ({ stories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [showEditorsPicks, setShowEditorsPicks] = useState(false);

  const categories = useMemo(() => 
    Array.from(new Set(stories.map(story => story.category))).sort(),
    [stories]
  );

  const countries = useMemo(() => 
    Array.from(new Set(stories.map(story => story.country))).sort(),
    [stories]
  );

  const tags = useMemo(() => 
    Array.from(new Set(stories.flatMap(story => story.tags))).sort(),
    [stories]
  );

  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || story.category === selectedCategory;
      const matchesCountry = !selectedCountry || story.country === selectedCountry;
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => story.tags.includes(tag));
      const matchesFeatured = !showFeatured || story.featured;
      const matchesEditorsPicks = !showEditorsPicks || story.editorsPick;
      const matchesRecent = !showRecent || 
        new Date(story.publishedAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000);

      return matchesSearch && matchesCategory && matchesCountry && 
        matchesTags && matchesFeatured && matchesEditorsPicks && matchesRecent;
    });
  }, [
    stories,
    searchTerm,
    selectedCategory,
    selectedCountry,
    selectedTags,
    showFeatured,
    showRecent,
    showEditorsPicks
  ]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Search Stories</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="search">Search Term</Label>
            <Input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search stories..."
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded"
              aria-label="Select story category"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCountry(e.target.value)}
              className="w-full p-2 border rounded"
              aria-label="Select story country"
            >
              <option value="">All Countries</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showFeatured}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowFeatured(e.target.checked)}
                className="form-checkbox"
              />
              <span>Featured Only</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showRecent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowRecent(e.target.checked)}
                className="form-checkbox"
              />
              <span>Recent Only</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showEditorsPicks}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowEditorsPicks(e.target.checked)}
                className="form-checkbox"
              />
              <span>Editor's Picks</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}; 