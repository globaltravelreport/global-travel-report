'use client';

import { ReactNode } from 'react';
import HeroImage from './HeroImage';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  heroType: 'home' | 'article' | 'contact' | 'news' | 'destinations' | 'tips' | 'reviews' | 'deals' | 'notFound' | 'rewrite';
  priority?: boolean;
}

export default function PageLayout({ 
  children, 
  title, 
  description, 
  heroType, 
  priority = false 
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <HeroImage 
          type={heroType} 
          priority={priority} 
          showAttribution={true}
        />
        <div className="relative">
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {title}
              </h1>
              {description && (
                <p className="text-lg md:text-xl opacity-90">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 