import { ReactNode } from 'react';
import Hero from './Hero';
import { heroImages } from '../config/images';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  heroType?: keyof typeof heroImages;
  imageUrl?: string;
  imageAlt?: string;
}

export default function PageLayout({
  children,
  title,
  description,
  heroType = 'default',
  imageUrl,
  imageAlt,
}: PageLayoutProps) {
  const heroImage = heroImages[heroType];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero
        title={title}
        description={description}
        imageUrl={imageUrl || (heroImage?.url ?? '')}
        imageAlt={imageAlt || (heroImage?.alt ?? '')}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  );
} 