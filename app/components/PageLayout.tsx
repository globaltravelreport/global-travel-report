'use client';

import { ReactNode } from 'react';
import Hero from './Hero';
import { heroImages } from '../config/images';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  heroType?: keyof typeof heroImages;
}

export default function PageLayout({ children, title, description, heroType = 'home' }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Hero title={title} description={description} heroType={heroType} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
    </div>
  );
} 