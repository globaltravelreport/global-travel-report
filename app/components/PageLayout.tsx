import { ReactNode } from 'react';
import Hero from './Hero';
import { heroImages } from '../config/images';
import { Metadata } from 'next';

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  heroType?: keyof typeof heroImages;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  schemaType?: 'Article' | 'WebPage' | 'Organization';
  schemaData?: Record<string, any>;
}

export default function PageLayout({ 
  children, 
  title, 
  description, 
  heroType = 'home',
  ogImage,
  ogTitle,
  ogDescription,
  schemaType = 'WebPage',
  schemaData = {}
}: PageLayoutProps) {
  const imageConfig = heroImages[heroType] || heroImages.home;
  const siteTitle = 'Global Travel Report';
  const fullTitle = `${title} | ${siteTitle}`;
  const fullDescription = description || 'Your trusted source for travel news, reviews, tips and exclusive deals.';
  const imageUrl = ogImage || imageConfig.url;

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