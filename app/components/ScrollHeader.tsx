'use client';

import React, { useEffect, useState } from 'react';
import SearchBar from './SearchBar';

export default function ScrollHeader() {
  const [scrolled, setScrolled] = useState(false);
  
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
    <header className={`fixed top-0 left-0 right-0 z-50 text-white py-4 transition-all duration-300 ${
      scrolled ? 'bg-brand-dark shadow-md' : 'bg-gradient-to-b from-brand-dark/90 to-transparent'
    }`}>
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <div className="flex flex-col items-start mb-4 md:mb-0">
          <a href="/" className="flex items-center group">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-white">Global Travel</span>
              <span className="text-brand-gold"> Report</span>
            </span>
          </a>
          <div className="flex items-center mt-2 space-x-2">
            <a 
              href="mailto:editorial@globaltravelreport.com" 
              className="text-xs text-gray-300 hover:text-brand-gold transition-colors duration-200"
            >
              editorial@globaltravelreport.com
            </a>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            <a href="/" className="text-white hover:text-brand-gold transition-colors duration-200 font-medium">Home</a>
            <a href="/about" className="text-white hover:text-brand-gold transition-colors duration-200 font-medium">About</a>
            <a href="/stories" className="text-white hover:text-brand-gold transition-colors duration-200 font-medium">Stories</a>
            <a href="/categories" className="text-white hover:text-brand-gold transition-colors duration-200 font-medium">Categories</a>
            <a href="/destinations" className="text-white hover:text-brand-gold transition-colors duration-200 font-medium">Destinations</a>
          </div>
          
          <div className="flex items-center md:ml-6">
            {/* Social Media Links */}
            <div className="flex items-center space-x-2 ml-4 mt-4 md:mt-0">
              <a 
                href="https://www.facebook.com/globaltravelreport" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-brand-gold transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a 
                href="https://x.com/GTravelReport" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-brand-gold transition-colors duration-200"
                aria-label="X (Twitter)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/globaltravelreport/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-brand-gold transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
            </div>
            
            {/* Search Bar */}
            <div className="ml-4 mt-4 md:mt-0">
              <SearchBar />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
