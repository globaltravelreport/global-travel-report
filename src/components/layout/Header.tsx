'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { FaMedium, FaYoutube, FaTiktok, FaTumblr } from "react-icons/fa6";
import { cn } from '../../lib/utils';
import { SocialLinks } from '../ui/SocialLinks';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-[100] w-full transition-all duration-300 bg-gradient-to-r from-[#19273A] to-[#2A3F5F] text-white shadow-lg border-b-2 border-[#C9A14A]">

      <div className="hidden lg:block py-0.5">
        <div className="container flex justify-between items-center text-xs">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              editorial@globaltravelreport.com
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Sydney, Australia
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <SocialLinks />
            <a href="https://medium.com/@editorial_31000" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors">
              <FaMedium className="w-4 h-4" />
            </a>
            <a href="https://www.youtube.com/@GlobalTravelReport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors">
              <FaYoutube className="w-4 h-4" />
            </a>
            <a href="https://www.tiktok.com/@globaltravelreport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors">
              <FaTiktok className="w-4 h-4" />
            </a>
            <a href="https://www.tumblr.com/blog/globaltravelreport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors">
              <FaTumblr className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      <div className={cn(
        "container transition-all duration-300",
        isScrolled ? "py-2" : "py-3"
      )}>
        <div className="flex items-center justify-between">

          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white flex items-center justify-center">
              <span className="text-[#19273A] font-bold text-lg">GTR</span>
            </div>
            <span className="hidden font-bold text-xl sm:inline-block text-[#C9A14A]">
              Global Travel Report
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link href="/" className={cn('transition-colors hover:text-[#C9A14A] relative py-2', pathname === '/' ? 'text-[#C9A14A] font-semibold' : 'text-white')}>Home</Link>
            <Link href="/stories" className={cn('transition-colors hover:text-[#C9A14A] relative py-2', pathname.startsWith('/stories') ? 'text-[#C9A14A] font-semibold' : 'text-white')}>Stories</Link>
            <Link href="/destinations" className={cn('transition-colors hover:text-[#C9A14A] relative py-2', pathname.startsWith('/destinations') ? 'text-[#C9A14A] font-semibold' : 'text-white')}>Destinations</Link>
            <Link href="/category-index" className={cn('transition-colors hover:text-[#C9A14A] relative py-2', pathname.includes('category') ? 'text-[#C9A14A] font-semibold' : 'text-white')}>Categories</Link>
            <Link href="/offers" className={cn('transition-colors hover:text-[#C9A14A] relative py-2', pathname.startsWith('/offers') ? 'text-[#C9A14A] font-semibold' : 'text-white')}>Travel Offers</Link>
            <Link href="/archive" className={cn('transition-colors hover:text-[#C9A14A] relative py-2', pathname === '/archive' ? 'text-[#C9A14A] font-semibold' : 'text-white')}>Archive</Link>
            <Link href="/about" className={cn('transition-colors hover:text-[#C9A14A] relative py-2', pathname === '/about' ? 'text-[#C9A14A] font-semibold' : 'text-white')}>About</Link>
            <Link href="/contact" className={cn('transition-colors hover:text-[#C9A14A] relative py-2', pathname === '/contact' ? 'text-[#C9A14A] font-semibold' : 'text-white')}>Contact</Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Link href="/search">
              <Button variant="ghost" size="sm" className="rounded-full text-white hover:bg-[#19273A]/50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="rounded-full text-white hover:bg-[#19273A]/50 lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? '✕' : '☰'}
            </Button>
          </div>
        </div>
      </div>

    </header>
  );
}
