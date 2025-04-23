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

  // Construct UTM-tagged URLs for attribution
  const photographerUrl = `https://unsplash.com/@${image.photographer.username}?utm_source=global_travel_report&utm_medium=referral`;
  const unsplashUrl = 'https://unsplash.com?utm_source=global_travel_report&utm_medium=referral';

  // Track download when image is loaded
  const handleLoad = async () => {
    try {
      if (image.downloadLocation) {
        await fetch(`/api/unsplash/search?downloadLocation=${encodeURIComponent(image.downloadLocation)}`, {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Failed to track download:', error);
    }
  };

  return (
    <div className="relative">
      <div className={`relative w-full`} style={{ height: `${height}px` }}>
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className="object-cover"
          sizes="100vw"
          onLoad={handleLoad}
        />
      </div>
      {showAttribution && (
        <div className="absolute bottom-0 right-0 bg-black/50 text-white text-sm px-4 py-2 rounded-tl">
          Photo by{' '}
          <Link
            href={photographerUrl}
            className="underline hover:text-gray-200"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${image.photographer.name}'s profile on Unsplash`}
          >
            {image.photographer.name}
          </Link>
          {' '}on{' '}
          <Link
            href={unsplashUrl}
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