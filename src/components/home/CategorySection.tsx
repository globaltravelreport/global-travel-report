'use client';

import React from 'react';
import Link from 'next/link';
import { StoryCard } from '@/components/stories/StoryCard';
import { Story } from '@/types/Story';
import { Category } from '@/src/config/categories';

interface CategorySectionProps {
  category: Category;
  stories: Story[];
  limit?: number;
}

/**
 * Component to display a section of stories from a specific category
 * Used on the homepage to group content by themes
 */
export function CategorySection({ category, stories, limit = 3 }: CategorySectionProps) {
  // Filter stories by this category
  const categoryStories = stories
    .filter(story => {
      // Check if the story belongs to this category
      // This handles both direct category matches and keyword matches
      if (story.category.toLowerCase() === category.name.toLowerCase()) {
        return true;
      }
      
      // Check if the story's category matches any of the category keywords
      if (category.keywords && category.keywords.length > 0) {
        return category.keywords.some(keyword => 
          story.category.toLowerCase().includes(keyword.toLowerCase()) ||
          (story.type && story.type.toLowerCase().includes(keyword.toLowerCase())) ||
          (story.tags && story.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase())))
        );
      }
      
      return false;
    })
    .slice(0, limit);
  
  // If no stories in this category, don't render the section
  if (categoryStories.length === 0) {
    return null;
  }
  
  return (
    <section className="py-12 border-b border-gray-200 last:border-0">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <span className="text-3xl mr-3">{category.icon}</span>
          <h2 className="text-2xl font-bold">{category.name}</h2>
        </div>
        <Link 
          href={`/categories/${category.slug}`}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          View all
          <svg xmlns="https://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
      
      <p className="text-gray-600 mb-6">{category.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categoryStories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}
