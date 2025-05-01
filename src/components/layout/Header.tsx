'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { FaFacebook, FaXTwitter, FaMedium, FaLinkedin, FaYoutube, FaTiktok } from "react-icons/fa6";

import { ThemeToggle } from '@/src/components/ui/theme-toggle';
import { cn } from '@/src/lib/utils';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled
        ? "bg-white/95 backdrop-blur shadow-md supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/80"
        : "bg-transparent"
    )}>
      {/* Top bar with contact info - Updated with gradient background */}
      <div className="hidden lg:block bg-gradient-to-r from-[#19273A] to-[#2A3F5F] text-white py-0.5">
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
          <div className="flex items-center space-x-3">
            <a href="https://www.facebook.com/globaltravelreport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors" aria-label="Facebook">
              <FaFacebook className="w-4 h-4" />
            </a>
            <a href="https://x.com/GTravelReport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors" aria-label="Twitter (X)">
              <FaXTwitter className="w-4 h-4" />
            </a>
            <a href="https://medium.com/@editorial_31000" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors" aria-label="Medium">
              <FaMedium className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/company/globaltravelreport/" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors" aria-label="LinkedIn">
              <FaLinkedin className="w-4 h-4" />
            </a>
            <a href="https://www.youtube.com/@GlobalTravelReport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors" aria-label="YouTube">
              <FaYoutube className="w-4 h-4" />
            </a>
            <a href="https://www.tiktok.com/@globaltravelreport" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9A14A] transition-colors" aria-label="TikTok">
              <FaTiktok className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className={cn(
        "container transition-all duration-300",
        isScrolled ? "py-2" : "py-3"
      )}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-[#19273A] flex items-center justify-center">
              <span className="text-[#C9A14A] font-bold text-lg">GTR</span>
            </div>
            <span className="hidden font-bold text-xl sm:inline-block bg-gradient-to-r from-[#19273A] to-[#2A3F5F] bg-clip-text text-transparent dark:from-[#C9A14A] dark:to-[#E5C675]">
              Global Travel Report
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link
              href="/"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/'
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              Home
            </Link>
            <Link
              href="/stories"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/stories' || pathname.startsWith('/stories/')
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              Stories
            </Link>
            <Link
              href="/destinations"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/destinations' || pathname.startsWith('/destinations/')
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              Destinations
            </Link>
            <Link
              href="/about"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/about'
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={cn(
                'transition-colors hover:text-[#C9A14A] relative py-2',
                pathname === '/contact'
                  ? 'text-[#19273A] dark:text-white font-semibold after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[#C9A14A]'
                  : 'text-gray-700 dark:text-gray-300'
              )}
            >
              Contact
            </Link>
          </nav>

          {/* Search and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/search">
              <Button variant="ghost" size="sm" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="sr-only">Search</span>
              </Button>
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Toggle menu</span>
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="container py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/'
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/stories"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/stories' || pathname.startsWith('/stories/')
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Stories
              </Link>
              <Link
                href="/destinations"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/destinations' || pathname.startsWith('/destinations/')
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Destinations
              </Link>
              <Link
                href="/about"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/about'
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={cn(
                  'transition-colors hover:text-[#C9A14A] py-2 px-4 rounded-md',
                  pathname === '/contact'
                    ? 'bg-gray-100 dark:bg-gray-800 text-[#19273A] dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile contact info */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex flex-col space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    editorial@globaltravelreport.com
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Sydney, Australia
                  </span>
                </div>

                <div className="flex items-center space-x-4 mt-4">
                  <a href="https://www.facebook.com/globaltravelreport" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C9A14A] transition-colors" aria-label="Facebook">
                    <FaFacebook className="w-5 h-5" />
                  </a>
                  <a href="https://x.com/GTravelReport" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C9A14A] transition-colors" aria-label="Twitter (X)">
                    <FaXTwitter className="w-5 h-5" />
                  </a>
                  <a href="https://medium.com/@editorial_31000" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C9A14A] transition-colors" aria-label="Medium">
                    <FaMedium className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/company/globaltravelreport/" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C9A14A] transition-colors" aria-label="LinkedIn">
                    <FaLinkedin className="w-5 h-5" />
                  </a>
                  <a href="https://www.youtube.com/@GlobalTravelReport" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C9A14A] transition-colors" aria-label="YouTube">
                    <FaYoutube className="w-5 h-5" />
                  </a>
                  <a href="https://www.tiktok.com/@globaltravelreport" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-[#C9A14A] transition-colors" aria-label="TikTok">
                    <FaTiktok className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}