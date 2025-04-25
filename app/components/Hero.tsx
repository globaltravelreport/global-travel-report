'use client';

import Image from 'next/image'
import { heroImages } from '../config/images'

interface HeroProps {
  title?: string
  description?: string
  heroType?: keyof typeof heroImages
  imageUrl?: string
  imageAlt?: string
}

export default function Hero({ 
  title, 
  description, 
  heroType = 'home',
  imageUrl,
  imageAlt
}: HeroProps) {
  const imageConfig = heroImages[heroType] || heroImages.home
  const heightClass = heroType === 'article' ? 'h-[300px]' : 'h-[400px]'
  const overlayClass = heroType === 'article' ? 'bg-black/60' : 'bg-black/40'
  
  const displayImageUrl = imageUrl || imageConfig.url
  const displayImageAlt = imageAlt || imageConfig.alt
  
  return (
    <div className={`relative ${heightClass}`}>
      <Image
        src={displayImageUrl}
        alt={displayImageAlt}
        fill
        className="object-cover"
        priority
        sizes="100vw"
        quality={90}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAkLCAgLCAgLCAgLCAgLCAgLCAgLCAgLCAgLCAgLCAgLCAgLCAgLCAgL/2wBDAR0XHR4eHRoaHSQtJCAgICAgJCAgICAgJCAgICAgJCAgICAgJCAgICAgJCAgICAgJCAgICAgJCAgICAgJCAgICAgJCAgICAgL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
      <div className={`absolute inset-0 ${overlayClass} flex items-center justify-center`}>
        <div className="text-center text-white px-4 max-w-3xl">
          {title && (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-lg md:text-xl opacity-90">
              {description}
            </p>
          )}
        </div>
      </div>
      {!imageUrl && imageConfig.photographer && (
        <div className="absolute bottom-0 right-0 bg-black/60 text-white text-xs px-3 py-2 rounded-tl-lg backdrop-blur-sm">
          <span className="block font-medium">Photo by{' '}
            <a
              href={`https://unsplash.com/@${imageConfig.photographer.username}`}
              className="underline hover:text-brand-teal transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`View ${imageConfig.photographer.name}'s profile on Unsplash`}
            >
              {imageConfig.photographer.name}
            </a>
          </span>
          <span className="text-gray-300">
            on{' '}
            <a
              href="https://unsplash.com"
              className="underline hover:text-brand-teal transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Unsplash
            </a>
          </span>
        </div>
      )}
    </div>
  )
} 