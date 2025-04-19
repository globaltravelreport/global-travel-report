'use client';

import Image from 'next/image';
import Link from 'next/link';
import { heroImages } from '../config/images';

interface HeroImageProps {
  type: keyof typeof heroImages;
  showAttribution?: boolean;
  height?: number;
  priority?: boolean;
}

export default function HeroImage({ 
  type, 
  showAttribution = true, 
  height = 600,
  priority = false 
}: HeroImageProps) {
  const image = heroImages[type];
  
  if (!image) {
    console.error(`No image configuration found for type: ${type}`);
    return null;
  }

  return (
    <div className="relative">
      <div className={`relative w-full`} style={{ height: `${height}px` }}>
        <Image
          src={`${image.url}?w=1920&h=${height}&fit=crop&q=80`}
          alt={image.alt}
          fill
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className="object-cover"
          sizes="100vw"
        />
      </div>
      {showAttribution && (
        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-sm px-4 py-2 rounded-tl">
          Photo by{' '}
          <Link
            href={`https://unsplash.com/@${image.photographer.username}`}
            className="underline hover:text-gray-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            {image.photographer.name}
          </Link>
          {' '}on{' '}
          <Link
            href="https://unsplash.com"
            className="underline hover:text-gray-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </Link>
        </div>
      )}
    </div>
  );
} 