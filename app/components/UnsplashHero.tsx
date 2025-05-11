'use client';

import React from 'react';

interface UnsplashHeroProps {
  imageUrl: string;
  photographerName: string;
  photographerUrl: string;
  children?: React.ReactNode;
}

export default function UnsplashHero({
  imageUrl,
  photographerName,
  photographerUrl,
  children
}: UnsplashHeroProps) {
  return (
    <div className="relative bg-brand-dark text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={imageUrl} 
          alt="Travel hero image" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/70 to-brand-dark/90"></div>
      </div>
      
      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-24 h-24 rounded-full bg-brand-gold/10 animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-16 h-16 rounded-full bg-brand-gold/5 animate-float-medium"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-brand-gold/5 animate-float-fast"></div>
        <div className="absolute top-1/3 right-1/3 w-12 h-12 rounded-full bg-brand-gold/10 animate-float-medium"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        {children}
      </div>
      
      {/* Photo Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
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
      
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#ffffff" preserveAspectRatio="none">
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
        </svg>
      </div>
    </div>
  );
}
