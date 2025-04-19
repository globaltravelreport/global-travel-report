'use client';

import { ReactNode } from 'react';
import Hero from './Hero';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  heroImage?: string;
  heroType?: 'default' | 'news' | 'article';
}

export default function PageLayout({ children, title, description, heroImage, heroType = 'default' }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Hero title={title} description={description} image={heroImage} type={heroType} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 