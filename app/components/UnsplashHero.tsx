'use client';

import React, { useEffect, useState } from 'react';

interface UnsplashHeroProps {
  imageUrl: string;
  photographerName: string;
  photographerUrl: string;
  children?: React.ReactNode;
  height?: 'default' | 'tall';
}

export default function UnsplashHero({
  imageUrl,
  photographerName,
  photographerUrl,
  children,
  height = 'default'
}: UnsplashHeroProps) {
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header transparency
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <div className={`relative bg-brand-dark text-white overflow-hidden ${height === 'tall' ? 'min-h-screen' : 'min-h-[80vh]'}`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt="Scenic travel destination background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/50 to-brand-dark/70"></div>
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-brand-gold/10 animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-brand-gold/5 animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-brand-gold/5 animate-float-fast"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 rounded-full bg-brand-gold/10 animate-float-medium"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-32 md:py-40 relative z-10">
        {children}
      </div>

      {/* Photo Attribution */}
      <div className="absolute bottom-4 right-4 text-xs text-white/80 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
        Photo by <a
          href={photographerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          {photographerName}
        </a> on <a
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Unsplash
        </a>
      </div>

      {/* Gold Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold"></div>

      {/* Wave Divider */}
      <div className="absolute bottom-0.5 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#ffffff" preserveAspectRatio="none">
          <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,69.3C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
}
