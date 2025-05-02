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

      {showAttribution && photographer && photographer.name && (
        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs p-2 rounded-tl">
          Photo by{" "}
          {photographer.url ? (
            <a
              href={photographer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-gray-200"
            >
              {photographer.name}
            </a>
          ) : (
            <span className="font-bold">{photographer.name}</span>
          )}
          {" "}on{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:text-gray-200"
          >
            Unsplash
          </a>
        </div>
      )}
    </div>
  );
}
