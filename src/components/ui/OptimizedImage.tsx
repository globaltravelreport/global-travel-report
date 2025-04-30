"use client";

import React from 'react';
import Image from 'next/image';

interface Photographer {
  name: string;
  url?: string;
}

interface StoryCoverImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  photographer?: Photographer;
  showAttribution?: boolean;
}

export function StoryCoverImage({
  src,
  alt,
  priority = false,
  className = '',
  photographer,
  showAttribution = false,
}: StoryCoverImageProps) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover ${className}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {showAttribution && photographer && (
        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs p-1 rounded-tl">
          Photo: {photographer.url ? (
            <a 
              href={photographer.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-gray-200"
            >
              {photographer.name}
            </a>
          ) : (
            photographer.name
          )}
        </div>
      )}
    </div>
  );
}
