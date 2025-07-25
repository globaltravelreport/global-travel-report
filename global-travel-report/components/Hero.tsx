'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=90");
  const [photographer, setPhotographer] = useState({
    name: "Jeremy Bishop",
    url: "https://unsplash.com/@jeremybishop",
    photoUrl: "https://unsplash.com/photos/8xznAGy4HcY"
  });

  // Rotate through a selection of high-quality travel images
  useEffect(() => {
    const heroImages = [
      {
        url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&q=90",
        photographer: "Jeremy Bishop",
        photographerUrl: "https://unsplash.com/@jeremybishop",
        photoUrl: "https://unsplash.com/photos/8xznAGy4HcY"
      },
      {
        url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&q=90",
        photographer: "Asoggetti",
        photographerUrl: "https://unsplash.com/@asoggetti",
        photoUrl: "https://unsplash.com/photos/3U7HcqkIGNM"
      },
      {
        url: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&q=90",
        photographer: "Dino Reichmuth",
        photographerUrl: "https://unsplash.com/@dinoreichmuth",
        photoUrl: "https://unsplash.com/photos/A5rCN8626Ck"
      },
      {
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&q=90",
        photographer: "Sylvain Mauroux",
        photographerUrl: "https://unsplash.com/@sylvainmauroux",
        photoUrl: "https://unsplash.com/photos/VzFM_SD8kUw"
      }
    ];

    // Only change the image if this is a client-side render and not during SSR
    if (typeof window !== 'undefined') {
      // Get a random image from the array
      const randomIndex = Math.floor(Math.random() * heroImages.length);
      const selectedImage = heroImages[randomIndex];

      setHeroImage(selectedImage.url);
      setPhotographer({
        name: selectedImage.photographer,
        url: selectedImage.photographerUrl,
        photoUrl: selectedImage.photoUrl
      });
    }
  }, []);

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] w-full overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0"
        style={{ y }}
      >
        <OptimizedImage
          src={heroImage}
          alt="Beautiful travel destination"
          fill
          className="object-cover"
          priority={true}
          sizes="100vw"
          quality={90}
          objectFit="cover"
          loading="eager"
        />

        {/* Gradient overlay with more sophisticated layering */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#19273A]/80 via-transparent to-[#19273A]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#19273A]/60 to-transparent" />

        {/* Subtle pattern overlay for texture */}
        <div className="absolute inset-0 bg-[url('/images/noise-pattern.png')] opacity-5"></div>

        {/* Photo credit */}
        <div className="absolute bottom-4 right-4 text-white text-xs bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full z-10">
          Photo by <a
            href={photographer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:text-[#C9A14A] transition-colors"
          >
            {photographer.name}
          </a> on <a
            href={photographer.photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:text-[#C9A14A] transition-colors"
          >
            Unsplash
          </a>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-center text-white px-4 pt-16 pb-24"
        style={{ opacity }}
      >
        {/* Decorative elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#C9A14A]/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <motion.div
          className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-[#C9A14A]/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />

        {/* Main heading with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <h1 className="text-5xl md:text-7xl font-black text-center mb-2 tracking-tight leading-tight"
              style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)' }}>
            Discover Your Next <br className="hidden md:block" />
            <span className="relative inline-block">
              <span className="relative z-10">Adventure</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-[#C9A14A]/30 -z-10 transform -rotate-1"></span>
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-center mb-12 max-w-2xl font-medium leading-relaxed"
          style={{ textShadow: '0 2px 6px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)' }}
        >
          Explore travel stories, tips, and inspiration from around the world
        </motion.p>

        {/* Call to action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          {/* Primary CTA */}
          <motion.div
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
              Explore Destinations
            </Link>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/categories"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/30 font-bold py-4 px-10 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 inline-block shadow-lg hover:shadow-xl"
              aria-label="Browse categories"
            >
              Browse Categories
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 1.5, duration: 1 },
            y: { delay: 1.5, duration: 2, repeat: Infinity }
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5L12 19M12 19L19 12M12 19L5 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
};

// Export as a dynamic component with no SSR
export default dynamic(() => Promise.resolve(Hero), { ssr: false });