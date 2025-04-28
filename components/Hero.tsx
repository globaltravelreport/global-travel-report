import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const Hero = () => {
  return (
    <div className="relative h-[600px] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Travel destinations"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6">
          Discover Your Next Adventure
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
          Explore travel stories, tips, and inspiration from around the world
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search destinations, stories, or topics..."
              className="flex-1 bg-white/90 text-black placeholder:text-gray-500"
            />
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="mt-8 flex gap-4">
          <Button variant="outline" className="bg-white/10 hover:bg-white/20">
            Japan
          </Button>
          <Button variant="outline" className="bg-white/10 hover:bg-white/20">
            Australia
          </Button>
          <Button variant="outline" className="bg-white/10 hover:bg-white/20">
            Europe
          </Button>
        </div>
      </div>
    </div>
  );
}; 