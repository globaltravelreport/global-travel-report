'use client';

import HeroImage from './HeroImage';

export default function Hero() {
  return (
    <div className="relative">
      <HeroImage type="home" height={600} />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Expert travel insights, destination guides, and exclusive deals
          </p>
        </div>
      </div>
    </div>
  );
} 