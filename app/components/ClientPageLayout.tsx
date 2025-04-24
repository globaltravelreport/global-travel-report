'use client';

import { ReactNode } from 'react';
import { heroImages } from '../config/hero-images';

interface ClientPageLayoutProps {
  children: ReactNode;
  heroType?: keyof typeof heroImages;
}

export default function ClientPageLayout({ 
  children, 
  heroType = 'home',
}: ClientPageLayoutProps) {
  const { src, alt } = heroImages[heroType] || heroImages.home;

  return (
    <main>
      <div className="relative h-[400px] bg-gray-900">
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />
      </div>
      {children}
    </main>
  );
} 