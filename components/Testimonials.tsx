'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'New York, USA',
    quote: 'The travel tips and stories on Global Travel Report have been invaluable for planning my trips. The detailed guides and honest reviews make it so much easier to make informed decisions.',
    image: '/images/testimonials/sarah.jpg',
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'Singapore',
    quote: 'As a frequent traveler, I appreciate the diverse perspectives and authentic experiences shared on this platform. It\'s become my go-to resource for travel inspiration.',
    image: '/images/testimonials/michael.jpg',
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    location: 'Barcelona, Spain',
    quote: 'The community here is amazing! I\'ve connected with fellow travelers and discovered hidden gems I would have never found otherwise. Highly recommended!',
    image: '/images/testimonials/emma.jpg',
  },
  {
    id: 4,
    name: 'David Kim',
    location: 'Seoul, South Korea',
    quote: 'The photography and storytelling are exceptional. Each article transports you to the destination and makes you feel like you\'re there.',
    image: '/images/testimonials/david.jpg',
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 bg-gray-50" aria-label="Testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          What Our Travelers Say
        </h2>
        
        <div className="relative h-[400px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="max-w-3xl mx-auto text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <Image
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <blockquote className="text-xl text-gray-700 mb-6">
                  "{testimonials[currentIndex].quote}"
                </blockquote>
                <div className="text-gray-900 font-semibold">
                  {testimonials[currentIndex].name}
                </div>
                <div className="text-gray-600">
                  {testimonials[currentIndex].location}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center space-x-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[#C9A14A]' : 'bg-gray-300'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}; 