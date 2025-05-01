'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-[60vh] w-full overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y }}
      >
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
          alt="Beautiful travel destination with mountains and lake"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 dark:from-black/80 dark:via-black/60 dark:to-black/80" />
        <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
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

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-6 h-6 text-yellow-400" />
        ) : (
          <Moon className="w-6 h-6 text-gray-800" />
        )}
      </button>

      {/* Content */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-center text-white px-4"
        style={{ opacity }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-center mb-6 tracking-tight text-shadow-lg"
          style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
        >
          Discover Your Next Adventure
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-center mb-10 max-w-2xl font-medium leading-relaxed"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
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
            href="/stories"
            className="relative bg-gradient-to-r from-[#C9A14A] to-[#B08D3F] hover:from-[#D5B05C] hover:to-[#C9A14A] text-white font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 inline-block shadow-lg hover:shadow-xl"
            aria-label="Start exploring travel stories"
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