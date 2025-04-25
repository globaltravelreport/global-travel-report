'use client';

import { useState } from 'react';
import Image from 'next/image';
import { logger } from '@/app/utils/logger';
import { formatUnsplashAttribution } from '@/app/lib/unsplash';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    thumb: string;
  };
  alt_description: string | null;
  user: {
    username: string;
    name: string;
  };
  links: {
    download_location: string;
  };
}

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string, alt: string, attribution: { photographer: string; photographerUrl: string; unsplashUrl: string }) => void;
}

export default function ImageSearchModal({ isOpen, onClose, onSelectImage }: ImageSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
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
      logger.error('Error searching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (image: UnsplashImage) => {
    const { photographerUrl, unsplashUrl } = formatUnsplashAttribution(image.user);
    onSelectImage(
      image.urls.regular,
      image.alt_description || 'Article image',
      {
        photographer: image.user.name,
        photographerUrl,
        unsplashUrl
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search Images</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchImages(searchQuery)}
            placeholder="Search for images..."
            className="w-full px-4 py-2 border rounded-lg"
          />
          <button
            onClick={() => searchImages(searchQuery)}
            disabled={isLoading}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative aspect-video cursor-pointer group"
              onClick={() => handleImageSelect(image)}
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
                  href={formatUnsplashAttribution(image.user).photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {image.user.name}
                </a>
                {' '}on{' '}
                <a
                  href={formatUnsplashAttribution(image.user).unsplashUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  Unsplash
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 