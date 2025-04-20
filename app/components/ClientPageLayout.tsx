'use client';

import { ReactNode } from 'react';
import Hero from './Hero';
import { heroImages } from '../config/images';

interface ClientPageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  heroType?: keyof typeof heroImages;
}

export default function ClientPageLayout({ 
  children, 
  title, 
  description, 
  heroType = 'home',
}: ClientPageLayoutProps) {
  const imageConfig = heroImages[heroType] || heroImages.home;

  return (
    <main>
      <Hero 
        title={title} 
        description={description} 
        heroType={heroType}
      />
      {children}
    </main>
  );
} 