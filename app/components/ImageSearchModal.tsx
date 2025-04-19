'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string, alt: string) => void;
}

export default function ImageSearchModal({ isOpen, onClose, onSelectImage }: ImageSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchImages = async (query: string) => {
    if (!query) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/unsplash/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data.results || []);
    } catch (error) {
      console.error('Error searching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Search for Images</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchImages(searchQuery)}
            placeholder="Search for images..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-teal focus:border-transparent"
          />
          <button
            onClick={() => searchImages(searchQuery)}
            disabled={isLoading || !searchQuery}
            className="mt-2 px-4 py-2 bg-brand-teal text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-video cursor-pointer group"
              onClick={() => onSelectImage(image.urls.regular, image.alt_description || 'Article image')}
            >
              <Image
                src={image.urls.thumb}
                alt={image.alt_description || 'Search result'}
                fill
                className="object-cover rounded-md group-hover:opacity-75 transition-opacity"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-md">
                Photo by{' '}
                <a
                  href={`https://unsplash.com/@${image.user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-200"
                >
                  {image.user.name}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 