'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { OptimizedImage } from '@/src/components/ui/OptimizedImage';

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative min-h-[55vh] w-full overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y }}
      >
        <OptimizedImage
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=90"
          alt="Beautiful travel destination with mountains and lake"
          fill
          className="object-cover"
          priority={true}
          sizes="100vw"
          quality={90}
          objectFit="cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded z-10">
          Photo by <a
            href="https://unsplash.com/@jeremybishop"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-200"
          >
            Jeremy Bishop
          </a> on <a
            href="https://unsplash.com/photos/8xznAGy4HcY"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-200"
          >
            Unsplash
          </a>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-center text-white px-4 pt-8"
        style={{ opacity }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-black text-center mb-6 tracking-tight"
          style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)' }}
        >
          Discover Your Next Adventure
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-center mb-10 max-w-2xl font-semibold leading-relaxed"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)' }}
        >
          Explore travel stories, tips, and inspiration from around the world
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#E6C677] to-[#C9A14A] rounded-full blur-sm opacity-70"></div>
          <Link
            href="/destinations"
            className="relative bg-gradient-to-r from-[#C9A14A] to-[#B08D3F] hover:from-[#D5B05C] hover:to-[#C9A14A] text-white font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 inline-block shadow-lg hover:shadow-xl"
            aria-label="Start exploring destinations"
          >
            Start Exploring
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

// Export as a dynamic component with no SSR
export default dynamic(() => Promise.resolve(Hero), { ssr: false });