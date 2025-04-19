'use client';

import Image from 'next/image';

interface ArticleImageProps {
  src: string;
  alt: string;
}

export default function ArticleImage({ src, alt }: ArticleImageProps) {
  return (
    <div className="relative w-full h-[400px] mb-8 bg-gray-100 rounded-lg overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/images/news-hero.jpg';
        }}
      />
    </div>
  );
} 