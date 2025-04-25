'use client';

import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { heroImages } from '../config/images';
import { formatUnsplashAttribution, trackUnsplashDownload } from '../lib/unsplash';
import { logger } from '../lib/logger';

interface HeroImageProps {
  type: string;
  showAttribution?: boolean;
  priority?: boolean;
  className?: string;
}

const HeroImage: FC<HeroImageProps> = ({
  type,
  showAttribution = true,
  priority = false,
  className = '',
}) => {
  const image = heroImages[type] || heroImages.notFound;
  const { photographerUrl, unsplashUrl } = formatUnsplashAttribution(image.photographer);

  const handleLoad = async () => {
    if (image.downloadLocation) {
      try {
        await trackUnsplashDownload(image.downloadLocation);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to track image download:', message);
      }
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority={priority}
          quality={90}
          className={`object-cover brightness-110 hover:brightness-105 transition-all duration-300 ${className}`}
          sizes="100vw"
          onLoad={handleLoad}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />
      </div>
      {showAttribution && (
        <div className="absolute bottom-0 right-0 p-2 text-xs text-white bg-black bg-opacity-50 rounded-tl">
          Photo by{' '}
          <Link
            href={photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-200"
          >
            {image.photographer.name}
          </Link>
          {' '}on{' '}
          <Link
            href={unsplashUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-200"
          >
            Unsplash
          </Link>
        </div>
      )}
    </div>
  );
};

export default HeroImage; 